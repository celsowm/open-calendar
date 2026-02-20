import { addMinutes, isWithinInterval, startOfDay } from "date-fns";
import { RRule } from "rrule";
import { toDate } from "./date";
import type { CalendarEvent, CalendarEventInput } from "../types";

const DEFAULT_EVENT_DURATION_MINUTES = 30;

function normalizeSingleEvent(input: CalendarEventInput, fallbackIndex: number): CalendarEvent {
  const start = toDate(input.start);
  const allDay = input.allDay ?? false;
  const end = input.end
    ? toDate(input.end)
    : allDay
      ? addMinutes(start, 24 * 60)
      : addMinutes(start, DEFAULT_EVENT_DURATION_MINUTES);

  return {
    id: String(input.id ?? `${fallbackIndex}-${start.getTime()}`),
    title: input.title,
    start,
    end,
    allDay,
    color: input.color,
    resourceId: input.resourceId,
    className: input.className,
    display: input.display ?? "auto",
    rrule: input.rrule,
    exdate: input.exdate?.map(toDate) ?? []
  };
}

export function normalizeEvents(inputs: CalendarEventInput[]): CalendarEvent[] {
  return inputs.map((event, index) => normalizeSingleEvent(event, index));
}

export function eventIntersectsDay(event: CalendarEvent, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = addMinutes(dayStart, 24 * 60 - 1);

  return event.start <= dayEnd && event.end >= dayStart;
}

export function eventIntersectsRange(event: CalendarEvent, start: Date, end: Date): boolean {
  return event.start <= end && event.end >= start;
}

export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const expanded: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.rrule) {
      if (eventIntersectsRange(event, rangeStart, rangeEnd)) {
        expanded.push(event);
      }
      continue;
    }

    try {
      const rule = RRule.fromString(event.rrule);
      rule.options.dtstart = event.start;
      const occurrences = rule.between(rangeStart, rangeEnd, true);
      const eventDuration = event.end.getTime() - event.start.getTime();

      for (const occurrence of occurrences) {
        const excluded = event.exdate.some(
          (date) =>
            isWithinInterval(occurrence, {
              start: addMinutes(date, -1),
              end: addMinutes(date, 1)
            })
        );
        if (excluded) {
          continue;
        }

        expanded.push({
          ...event,
          id: `${event.id}-${occurrence.toISOString()}`,
          start: occurrence,
          end: new Date(occurrence.getTime() + eventDuration)
        });
      }
    } catch {
      if (eventIntersectsRange(event, rangeStart, rangeEnd)) {
        expanded.push(event);
      }
    }
  }

  return expanded.sort((a, b) => a.start.getTime() - b.start.getTime());
}
