import clsx from "clsx";
import { addMinutes, format, startOfDay } from "date-fns";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { getViewRange } from "../core/date";
import { expandRecurringEvents, normalizeEvents } from "../core/events";
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
import type { BuiltInViewType, CalendarLocale, CalendarProps, CalendarView, CustomViewConfig } from "../types";
import { getLocaleData, DEFAULT_MESSAGES } from "../locales";
import type { Locale } from "date-fns";

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

export function Calendar(props: CalendarProps) {
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
    customViews = []
  } = props;

  const localeData = useMemo(() => getLocaleData(locale), [locale]);

  const state = useCalendarState({ initialDate, initialView, customViews });
  const { dragState, handlePointerDown } = useDrag({ enabled: editable, onEventDrop });
  const { resizeState, handleResizePointerDown } = useResize({ enabled: editable, onEventResize });
  const { selectionState, handleTimeGridSelectionStart } = useSelection({
    enabled: selectable,
    onSelect
  });

  // Event sources hook for dynamic event fetching
  const { events: sourceEvents, isLoading, error, fetchForRange } = useEventSources({
    sources: eventSources,
    initialEvents: staticEvents
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
    if (eventSources.length > 0) {
      fetchForRange(visibleRange.start, visibleRange.end);
    }
  }, [eventSources, visibleRange.start, visibleRange.end, fetchForRange]);

  const visibleEvents = useMemo(
    () => expandRecurringEvents(normalizedEvents, visibleRange.start, visibleRange.end),
    [normalizedEvents, visibleRange.end, visibleRange.start]
  );

  const title = useMemo(
    () => buildTitle(state.view, state.currentDate, localeData, customViews),
    [localeData, state.currentDate, state.view, customViews]
  );

  const availableViews = useMemo(() => getAvailableViews(props, localeData), [props.resources, props.customViews, localeData]);

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
}
