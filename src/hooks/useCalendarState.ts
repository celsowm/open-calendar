import { useMemo, useState } from "react";
import { addDays, addMonths, addWeeks } from "date-fns";
import { toDate } from "../core/date";
import type { CalendarView, DateInput } from "../types";

interface CalendarStateOptions {
  initialDate?: DateInput;
  initialView?: CalendarView;
}

function stepDate(currentDate: Date, view: CalendarView, direction: 1 | -1): Date {
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
      goToPrevious: () => setCurrentDate((date) => stepDate(date, view, -1)),
      goToNext: () => setCurrentDate((date) => stepDate(date, view, 1))
    }),
    [currentDate, view]
  );
}
