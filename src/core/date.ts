import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek
} from "date-fns";
import type { CalendarView, DateInput } from "../types";

export interface DateRange {
  start: Date;
  end: Date;
}

export function toDate(value: DateInput): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

export function getViewRange(
  view: CalendarView,
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  listRange = 30
): DateRange {
  if (view === "month" || view === "multiMonthGrid") {
    return {
      start: startOfWeek(startOfMonth(date), { weekStartsOn }),
      end: endOfWeek(endOfMonth(date), { weekStartsOn })
    };
  }

  if (view === "timeGridWeek" || view === "dayGridWeek") {
    return {
      start: startOfWeek(date, { weekStartsOn }),
      end: endOfWeek(date, { weekStartsOn })
    };
  }

  if (view === "list") {
    return {
      start: startOfDay(date),
      end: endOfDay(addDays(date, listRange - 1))
    };
  }

  if (view === "multiMonthStack") {
    return {
      start: startOfWeek(startOfMonth(date), { weekStartsOn }),
      end: endOfWeek(endOfMonth(addMonths(date, 2)), { weekStartsOn })
    };
  }

  if (view === "timeline") {
    return {
      start: startOfDay(date),
      end: endOfDay(date)
    };
  }

  if (view === "resourceTimeGrid") {
    return {
      start: startOfDay(date),
      end: endOfDay(date)
    };
  }

  // timeGridDay, dayGridDay
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  };
}

export function eachDayBetween(range: DateRange): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(range.start);

  while (cursor <= range.end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function areSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function minutesSinceDayStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map((item) => Number.parseInt(item, 10));
  return hours * 60 + minutes;
}
