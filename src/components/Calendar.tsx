import clsx from "clsx";
import { format } from "date-fns";
import { useMemo } from "react";
import { getViewRange } from "../core/date";
import { expandRecurringEvents, normalizeEvents } from "../core/events";
import { useCalendarState } from "../hooks/useCalendarState";
import { Toolbar } from "./Toolbar";
import { MonthView } from "../views/MonthView";
import { TimeGridView } from "../views/TimeGridView";
import type { CalendarProps, CalendarView } from "../types";

function buildTitle(view: CalendarView, date: Date, locale?: CalendarProps["locale"]): string {
  if (view === "timeGridDay") {
    return format(date, "EEEE, MMM d yyyy", { locale });
  }
  if (view === "timeGridWeek") {
    return `${format(date, "MMM d", { locale })} week`;
  }
  return format(date, "MMMM yyyy", { locale });
}

export function Calendar({
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
  onDateClick,
  onEventClick
}: CalendarProps) {
  const state = useCalendarState({ initialDate, initialView });

  const normalizedEvents = useMemo(() => normalizeEvents(events), [events]);
  const visibleRange = useMemo(
    () => getViewRange(state.view, state.currentDate, weekStartsOn),
    [state.currentDate, state.view, weekStartsOn]
  );

  const visibleEvents = useMemo(
    () => expandRecurringEvents(normalizedEvents, visibleRange.start, visibleRange.end),
    [normalizedEvents, visibleRange.end, visibleRange.start]
  );

  const title = useMemo(
    () => buildTitle(state.view, state.currentDate, locale),
    [locale, state.currentDate, state.view]
  );

  return (
    <div className={clsx("oc-calendar", className)} style={{ height }}>
      <Toolbar
        title={title}
        view={state.view}
        onToday={state.goToToday}
        onPrev={state.goToPrevious}
        onNext={state.goToNext}
        onViewChange={state.setView}
      />

      <div className="oc-calendar__body">
        {state.view === "month" ? (
          <MonthView
            date={state.currentDate}
            events={visibleEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            navLinks={navLinks}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
            onNavLinkClick={(clickedDate) => {
              state.setCurrentDate(clickedDate);
              state.setView("timeGridDay");
            }}
          />
        ) : (
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
            onNavLinkClick={(clickedDate) => {
              state.setCurrentDate(clickedDate);
              state.setView("timeGridDay");
            }}
          />
        )}
      </div>
    </div>
  );
}
