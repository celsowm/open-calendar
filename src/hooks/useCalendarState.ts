import { useMemo, useState } from "react";
import { addDays, addMonths, addWeeks } from "date-fns";
import { toDate } from "../core/date";
import type { CalendarView, CustomViewConfig, DateInput } from "../types";

interface CalendarStateOptions {
  initialDate?: DateInput;
  initialView?: CalendarView;
  customViews?: CustomViewConfig[];
}

function stepDate(
  currentDate: Date,
  view: CalendarView,
  direction: 1 | -1,
  customViews?: CustomViewConfig[]
): Date {
  // Check for custom view first
  const customView = customViews?.find((cv) => cv.type === view);
  if (customView) {
    if (customView.durationMonths) {
      return addMonths(currentDate, direction * customView.durationMonths);
    }
    if (customView.durationWeeks) {
      return addWeeks(currentDate, direction * customView.durationWeeks);
    }
    const duration = customView.duration ?? 1;
    return addDays(currentDate, direction * duration);
  }

  // Built-in views
  if (view === "month" || view === "multiMonthGrid") {
    return addMonths(currentDate, direction);
  }
  if (view === "multiMonthStack") {
    return addMonths(currentDate, direction * 3);
  }
  if (view === "timeGridWeek" || view === "dayGridWeek") {
    return addWeeks(currentDate, direction);
  }
  if (view === "list") {
    return addDays(currentDate, direction * 30);
  }
  return addDays(currentDate, direction);
}

export function useCalendarState(options: CalendarStateOptions) {
  const [view, setView] = useState<CalendarView>(options.initialView ?? "month");
  const [currentDate, setCurrentDate] = useState<Date>(() =>
    options.initialDate ? toDate(options.initialDate) : new Date()
  );

  return useMemo(
    () => ({
      view,
      currentDate,
      setView,
      setCurrentDate,
      goToToday: () => setCurrentDate(new Date()),
      goToPrevious: () =>
        setCurrentDate((date) => stepDate(date, view, -1, options.customViews)),
      goToNext: () =>
        setCurrentDate((date) => stepDate(date, view, 1, options.customViews))
    }),
    [currentDate, view, options.customViews]
  );
}
