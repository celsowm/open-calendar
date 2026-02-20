import type { CalendarEventInput } from "../src/types";

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

function dateAt(day: number, hour = 0, minute = 0): Date {
  return new Date(year, month, day, hour, minute, 0, 0);
}

export const demoEvents: CalendarEventInput[] = [
  {
    id: "planning",
    title: "Sprint Planning",
    start: dateAt(5, 9, 0),
    end: dateAt(5, 10, 30),
    color: "#3862ff"
  },
  {
    id: "build",
    title: "Launch Build",
    start: dateAt(5, 9, 30),
    end: dateAt(5, 11, 0),
    color: "#009f86"
  },
  {
    id: "all-day",
    title: "Conference",
    start: dateAt(8),
    allDay: true,
    color: "#7a5cff"
  },
  {
    id: "background-focus",
    title: "Focus Block",
    start: dateAt(6, 13, 0),
    end: dateAt(6, 17, 0),
    display: "background"
  },
  {
    id: "recurring-checkin",
    title: "Daily Standup",
    start: dateAt(4, 10, 0),
    end: dateAt(4, 10, 15),
    color: "#ef4f4f",
    rrule: "FREQ=DAILY;COUNT=15"
  }
];
