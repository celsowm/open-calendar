import clsx from "clsx";
import { addMinutes, format, startOfDay } from "date-fns";
import { useMemo, useRef, type CSSProperties } from "react";
import { getViewRange } from "../core/date";
import { expandRecurringEvents, normalizeEvents } from "../core/events";
import { useCalendarState } from "../hooks/useCalendarState";
import { useDrag } from "../hooks/useDrag";
import { useResize } from "../hooks/useResize";
import { useSelection } from "../hooks/useSelection";
import { Toolbar } from "./Toolbar";
import { MonthView } from "../views/MonthView";
import { TimeGridView } from "../views/TimeGridView";
import { ListView } from "../views/ListView";
import { DayGridView } from "../views/DayGridView";
import { MultiMonthView } from "../views/MultiMonthView";
import { TimelineView } from "../views/TimelineView";
import { ResourceTimeGridView } from "../views/ResourceTimeGridView";
import type { BuiltInViewType, CalendarProps, CalendarView, CustomViewConfig } from "../types";

const VIEW_LABELS: Record<BuiltInViewType, string> = {
  month: "Month",
  timeGridWeek: "Week",
  timeGridDay: "Day",
  list: "List",
  dayGridWeek: "DayGrid Week",
  dayGridDay: "DayGrid Day",
  multiMonthStack: "Multi-Month",
  multiMonthGrid: "Multi-Month Grid",
  timeline: "Timeline",
  resourceTimeGrid: "Resources"
};

function buildTitle(
  view: CalendarView,
  date: Date,
  locale: CalendarProps["locale"],
  customViews?: CustomViewConfig[]
): string {
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
    return `${format(date, "MMM d", { locale })} week`;
  }
  if (view === "list") {
    return `${format(date, "MMM d", { locale })} — upcoming`;
  }
  if (view === "multiMonthStack" || view === "multiMonthGrid") {
    return format(date, "MMMM yyyy", { locale });
  }
  return format(date, "MMMM yyyy", { locale });
}

function getAvailableViews(props: CalendarProps) {
  const views: Array<{ label: string; value: CalendarView }> = [
    { label: VIEW_LABELS.month, value: "month" },
    { label: VIEW_LABELS.timeGridWeek, value: "timeGridWeek" },
    { label: VIEW_LABELS.timeGridDay, value: "timeGridDay" }
  ];

  if (props.resources && props.resources.length > 0) {
    views.push(
      { label: VIEW_LABELS.timeline, value: "timeline" },
      { label: VIEW_LABELS.resourceTimeGrid, value: "resourceTimeGrid" }
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
    events,
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
    resources = [],
    listRange = 30,
    customViews = []
  } = props;

  const state = useCalendarState({ initialDate, initialView, customViews });
  const { dragState, handlePointerDown } = useDrag({ enabled: editable, onEventDrop });
  const { resizeState, handleResizePointerDown } = useResize({ enabled: editable, onEventResize });
  const { selectionState, handleTimeGridSelectionStart } = useSelection({
    enabled: selectable,
    onSelect
  });

  const normalizedEvents = useMemo(() => normalizeEvents(events), [events]);
  
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

  const visibleEvents = useMemo(
    () => expandRecurringEvents(normalizedEvents, visibleRange.start, visibleRange.end),
    [normalizedEvents, visibleRange.end, visibleRange.start]
  );

  const title = useMemo(
    () => buildTitle(state.view, state.currentDate, locale, customViews),
    [locale, state.currentDate, state.view, customViews]
  );

  const availableViews = useMemo(() => getAvailableViews(props), [props.resources, props.customViews]);

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
        locale={locale}
        weekStartsOn={weekStartsOn}
        resources={resources}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
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
            locale={locale}
            weekStartsOn={weekStartsOn}
            weekNumbers={weekNumbers}
            navLinks={navLinks}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onNavLinkClick={navLinkHandler}
          />
        );

      case "timeGridWeek":
      case "timeGridDay":
        return (
          <TimeGridView
            date={state.currentDate}
            events={visibleEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            view={state.view}
            navLinks={navLinks}
            nowIndicator={nowIndicator}
            businessHours={businessHours}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
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
            locale={locale}
            onEventClick={onEventClick}
          />
        );

      case "dayGridWeek":
      case "dayGridDay":
        return (
          <DayGridView
            date={state.currentDate}
            events={visibleEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            view={state.view}
            navLinks={navLinks}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onNavLinkClick={navLinkHandler}
          />
        );

      case "multiMonthStack":
        return (
          <MultiMonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            mode="stack"
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        );

      case "multiMonthGrid":
        return (
          <MultiMonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            mode="grid"
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        );

      case "timeline":
        return (
          <TimelineView
            date={state.currentDate}
            events={visibleEvents}
            resources={resources}
            locale={locale}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />
        );

      case "resourceTimeGrid":
        return (
          <ResourceTimeGridView
            date={state.currentDate}
            events={visibleEvents}
            resources={resources}
            locale={locale}
            nowIndicator={nowIndicator}
            businessHours={businessHours}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
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
