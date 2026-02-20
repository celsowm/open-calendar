import { addMinutes, endOfDay, startOfDay } from "date-fns";
import { minutesSinceDayStart } from "./date";
import type { CalendarEvent } from "../types";

export interface TimedEventLayout {
  event: CalendarEvent;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Placement {
  event: CalendarEvent;
  startMinutes: number;
  endMinutes: number;
  column: number;
}

function clampToDay(event: CalendarEvent, day: Date): { start: number; end: number } {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const start = event.start < dayStart ? dayStart : event.start;
  const end = event.end > dayEnd ? dayEnd : event.end;

  return {
    start: Math.max(0, minutesSinceDayStart(start)),
    end: Math.min(24 * 60, minutesSinceDayStart(end))
  };
}

function buildClusterLayouts(cluster: CalendarEvent[], day: Date): TimedEventLayout[] {
  const columns: number[] = [];
  const placements: Placement[] = [];

  for (const event of cluster) {
    const { start, end } = clampToDay(event, day);
    let assignedColumn = columns.findIndex((columnEnd) => columnEnd <= start);

    if (assignedColumn < 0) {
      assignedColumn = columns.length;
      columns.push(0);
    }

    columns[assignedColumn] = Math.max(columns[assignedColumn], end);
    placements.push({
      event,
      startMinutes: start,
      endMinutes: Math.max(start + 15, end),
      column: assignedColumn
    });
  }

  const maxColumns = Math.max(columns.length, 1);

  return placements.map((placement) => {
    const width = 100 / maxColumns;
    return {
      event: placement.event,
      top: (placement.startMinutes / (24 * 60)) * 100,
      left: placement.column * width,
      width,
      height: Math.max(((placement.endMinutes - placement.startMinutes) / (24 * 60)) * 100, 1.25)
    };
  });
}

export function layoutTimedEvents(events: CalendarEvent[], day: Date): TimedEventLayout[] {
  const dayStart = startOfDay(day);
  const dayEnd = addMinutes(dayStart, 24 * 60 - 1);
  const timedEvents = events
    .filter(
      (event) =>
        !event.allDay &&
        event.display !== "background" &&
        event.start <= dayEnd &&
        event.end >= dayStart
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (timedEvents.length === 0) {
    return [];
  }

  const result: TimedEventLayout[] = [];
  let cluster: CalendarEvent[] = [];
  let clusterEnd = -1;

  for (const event of timedEvents) {
    const current = clampToDay(event, day);
    if (cluster.length === 0) {
      cluster.push(event);
      clusterEnd = current.end;
      continue;
    }

    if (current.start < clusterEnd) {
      cluster.push(event);
      clusterEnd = Math.max(clusterEnd, current.end);
      continue;
    }

    result.push(...buildClusterLayouts(cluster, day));
    cluster = [event];
    clusterEnd = current.end;
  }

  if (cluster.length > 0) {
    result.push(...buildClusterLayouts(cluster, day));
  }

  return result;
}
