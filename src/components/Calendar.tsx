import clsx from "clsx";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef, type Ref } from "react";
import { getViewRange } from "../core/date";
import { expandRecurringEvents, normalizeEvents } from "../core/events";
import { CalendarApi } from "../core/calendar-api";
import { useCalendarState } from "../hooks/useCalendarState";
import { useDrag } from "../hooks/useDrag";
import { useResize } from "../hooks/useResize";
import { useSelection } from "../hooks/useSelection";
import { useEventSources } from "../hooks/useEventSources";
import { Toolbar } from "./Toolbar";
import { MonthView } from "../views/MonthView";
import { TimeGridView } from "../views/TimeGridView";
import { ListView } from "../views/ListView";
import { DayGridView } from "../views/DayGridView";
import { MultiMonthView } from "../views/MultiMonthView";
import { TimelineView } from "../views/TimelineView";
import { ResourceTimeGridView } from "../views/ResourceTimeGridView";
import type { CalendarLocale, CalendarProps, CalendarView, CustomViewConfig, CalendarEventInput, CalendarApi as ICalendarApi, EventSource } from "../types";
import { getLocaleData } from "../locales";

function buildTitle(
  view: CalendarView,
  date: Date,
  localeData: CalendarLocale,
  customViews?: CustomViewConfig[]
): string {
  const { dateFnsLocale: locale, messages } = localeData;

  // Check for custom view title formatter
  const customView = customViews?.find((cv) => cv.type === view);
  if (customView?.titleFormat) {
    return customView.titleFormat(date, locale);
  }

  // Built-in views
  if (view === "timeGridDay" || view === "dayGridDay" || view === "timeline" || view === "resourceTimeGrid") {
    return format(date, "EEEE, MMM d yyyy", { locale });
  }
  if (view === "timeGridWeek" || view === "dayGridWeek") {
    return `${format(date, "MMM d", { locale })} ${messages.week}`;
  }
  if (view === "list") {
    return `${format(date, "MMM d", { locale })} — ${messages.list}`;
  }
  if (view === "multiMonthStack" || view === "multiMonthGrid") {
    return format(date, "MMMM yyyy", { locale });
  }
  return format(date, "MMMM yyyy", { locale });
}

function getAvailableViews(props: CalendarProps, localeData: CalendarLocale) {
  const { messages } = localeData;

  const views: Array<{ label: string; value: CalendarView }> = [
    { label: messages.viewMonth, value: "month" },
    { label: messages.viewWeek, value: "timeGridWeek" },
    { label: messages.viewDay, value: "timeGridDay" }
  ];

  if (props.resources && props.resources.length > 0) {
    views.push(
      { label: messages.viewTimeline, value: "timeline" },
      { label: messages.viewResources, value: "resourceTimeGrid" }
    );
  }

  // Add custom views
  if (props.customViews) {
    for (const customView of props.customViews) {
      views.push({ label: customView.label, value: customView.type });
    }
  }

  return views;
}

export const Calendar = forwardRef(function Calendar(props: CalendarProps, ref: Ref<ICalendarApi>) {
  const {
    events: staticEvents = [],
    eventSources = [],
    initialDate,
    initialView = "month",
    weekStartsOn = 1,
    nowIndicator = true,
    locale,
    className,
    height = 760,
    businessHours,
    navLinks = true,
    weekNumbers = false,
    editable = false,
    onEventDrop,
    onEventResize,
    selectable = false,
    onSelect,
    onDateClick,
    onEventClick,
    onEventMouseEnter,
    onEventMouseLeave,
    resources = [],
    listRange = 30,
    customViews = [],
    onReady
  } = props;

  const localeData = useMemo(() => getLocaleData(locale), [locale]);

  // Internal state for events and event sources (can be modified via API)
  const [internalEvents, setInternalEvents] = useState<CalendarEventInput[]>(staticEvents);
  const [internalEventSources, setInternalEventSources] = useState(eventSources);

  const state = useCalendarState({ initialDate, initialView, customViews });
  const { dragState, handlePointerDown } = useDrag({ enabled: editable, onEventDrop });
  const { resizeState, handleResizePointerDown } = useResize({ enabled: editable, onEventResize });
  const { selectionState, handleTimeGridSelectionStart } = useSelection({
    enabled: selectable,
    onSelect
  });

  // Event sources hook for dynamic event fetching
  const { events: sourceEvents, isLoading, error, fetchForRange } = useEventSources({
    sources: internalEventSources,
    initialEvents: internalEvents
  });

  // Normalize all events (from static + sources)
  const normalizedEvents = useMemo(() => normalizeEvents(sourceEvents), [sourceEvents]);

  // Get custom view date range if applicable
  const customViewRange = useMemo(() => {
    const customView = customViews.find((cv) => cv.type === state.view);
    if (customView?.dateRange) {
      return customView.dateRange(state.currentDate, weekStartsOn);
    }
    return null;
  }, [customViews, state.view, state.currentDate, weekStartsOn]);

  const visibleRange = useMemo(
    () => customViewRange ?? getViewRange(state.view, state.currentDate, weekStartsOn, listRange),
    [customViewRange, state.currentDate, state.view, weekStartsOn, listRange]
  );

  // Fetch events from sources when visible range changes
  useEffect(() => {
    if (internalEventSources.length > 0) {
      fetchForRange(visibleRange.start, visibleRange.end);
    }
  }, [internalEventSources, visibleRange.start, visibleRange.end, fetchForRange]);

  const visibleEvents = useMemo(
    () => expandRecurringEvents(normalizedEvents, visibleRange.start, visibleRange.end),
    [normalizedEvents, visibleRange.end, visibleRange.start]
  );

  const title = useMemo(
    () => buildTitle(state.view, state.currentDate, localeData, customViews),
    [localeData, state.currentDate, state.view, customViews]
  );

  const availableViews = useMemo(() => getAvailableViews(props, localeData), [props.resources, props.customViews, localeData]);

  // Keep latest values accessible from a stable API instance.
  const stateRef = useRef(state);
  const visibleRangeRef = useRef(visibleRange);
  const titleRef = useRef(title);
  const normalizedEventsRef = useRef(normalizedEvents);
  const eventSourcesRef = useRef(internalEventSources);
  const fetchForRangeRef = useRef(fetchForRange);

  stateRef.current = state;
  visibleRangeRef.current = visibleRange;
  titleRef.current = title;
  normalizedEventsRef.current = normalizedEvents;
  eventSourcesRef.current = internalEventSources;
  fetchForRangeRef.current = fetchForRange;
  
  const addNewEvent = (event: CalendarEventInput): string => {
    const id = event.id ?? `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const eventWithId = { ...event, id: String(id) };
    setInternalEvents(prev => [...prev, eventWithId]);
    return String(id);
  };
  
  const deleteEvent = (eventId: string) => {
    setInternalEvents(prev => prev.filter(e => String(e.id) !== eventId));
  };
  
  const deleteAllEvents = () => {
    setInternalEvents([]);
  };
  
  const addNewEventSource = (source: EventSource) => {
    setInternalEventSources(prev => {
      const newSources = [...prev];
      newSources.push(source);
      return newSources;
    });
  };
  
  const deleteEventSource = (source: EventSource) => {
    setInternalEventSources(prev => {
      const index = prev.findIndex(s => s === source);
      if (index >= 0) {
        const newSources = [...prev];
        newSources.splice(index, 1);
        return newSources;
      }
      return prev;
    });
  };

  const apiRef = useRef<ICalendarApi | null>(null);
  if (!apiRef.current) {
    apiRef.current = new CalendarApi(
      () => stateRef.current,
      () => visibleRangeRef.current,
      () => titleRef.current,
      () => normalizedEventsRef.current,
      addNewEvent,
      deleteEvent,
      deleteAllEvents,
      () => eventSourcesRef.current,
      addNewEventSource,
      deleteEventSource,
      () => {
        const currentRange = visibleRangeRef.current;
        void fetchForRangeRef.current(currentRange.start, currentRange.end);
      }
    );
  }

  // Expose API via ref
  useImperativeHandle(ref, () => apiRef.current as ICalendarApi, []);

  // Call onReady callback when API is ready
  useEffect(() => {
    if (onReady) {
      onReady(apiRef.current as ICalendarApi);
    }
  }, [onReady]);

  const navLinkHandler = (clickedDate: Date) => {
    state.setCurrentDate(clickedDate);
    state.setView("timeGridDay");
  };

  const renderCustomView = () => {
    const customView = customViews.find((cv) => cv.type === state.view);
    if (!customView) return null;

    const CustomComponent = customView.component;
    return (
      <CustomComponent
        date={state.currentDate}
        events={visibleEvents}
        locale={localeData.dateFnsLocale}
        localeData={localeData}
        weekStartsOn={weekStartsOn}
        resources={resources}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
        onEventMouseEnter={onEventMouseEnter}
        onEventMouseLeave={onEventMouseLeave}
        editable={editable}
        selectable={selectable}
        onSelect={onSelect}
      />
    );
  };

  const renderView = () => {
    // Check for custom view first
    if (customViews.some((cv) => cv.type === state.view)) {
      return renderCustomView();
    }

    switch (state.view) {
      case "month":
        return (
          <MonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={localeData}
            weekStartsOn={weekStartsOn}
            weekNumbers={weekNumbers}
            navLinks={navLinks}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
            onNavLinkClick={navLinkHandler}
          />
        );

      case "timeGridWeek":
      case "timeGridDay":
        return (
          <TimeGridView
            date={state.currentDate}
            events={visibleEvents}
            locale={localeData}
            weekStartsOn={weekStartsOn}
            view={state.view}
            navLinks={navLinks}
            nowIndicator={nowIndicator}
            businessHours={businessHours}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
            onNavLinkClick={navLinkHandler}
            editable={editable}
            selectable={selectable}
            dragState={dragState}
            resizeState={resizeState}
            selectionState={selectionState}
            onDragStart={handlePointerDown}
            onResizeStart={handleResizePointerDown}
            onSelectionStart={handleTimeGridSelectionStart}
          />
        );

      case "list":
        return (
          <ListView
            events={visibleEvents}
            locale={localeData}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
          />
        );

      case "dayGridWeek":
      case "dayGridDay":
        return (
          <DayGridView
            date={state.currentDate}
            events={visibleEvents}
            locale={localeData}
            weekStartsOn={weekStartsOn}
            view={state.view}
            navLinks={navLinks}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
            onNavLinkClick={navLinkHandler}
          />
        );

      case "multiMonthStack":
        return (
          <MultiMonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={localeData}
            weekStartsOn={weekStartsOn}
            mode="stack"
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
          />
        );

      case "multiMonthGrid":
        return (
          <MultiMonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={localeData}
            weekStartsOn={weekStartsOn}
            mode="grid"
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
          />
        );

      case "timeline":
        return (
          <TimelineView
            date={state.currentDate}
            events={visibleEvents}
            resources={resources}
            locale={localeData}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
          />
        );

      case "resourceTimeGrid":
        return (
          <ResourceTimeGridView
            date={state.currentDate}
            events={visibleEvents}
            resources={resources}
            locale={localeData}
            nowIndicator={nowIndicator}
            businessHours={businessHours}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onEventMouseEnter={onEventMouseEnter}
            onEventMouseLeave={onEventMouseLeave}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx("oc-calendar", className)} style={{ height }}>
      <Toolbar
        title={title}
        view={state.view}
        availableViews={availableViews}
        messages={localeData.messages}
        onToday={state.goToToday}
        onPrev={state.goToPrevious}
        onNext={state.goToNext}
        onViewChange={state.setView}
      />

      <div className="oc-calendar__body">
        {renderView()}
      </div>
    </div>
  );
});
