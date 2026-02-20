import type { CalendarEventInput, Resource } from "../src/types";

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
    color: "#3862ff",
    resourceId: "room-a"
  },
  {
    id: "build",
    title: "Launch Build",
    start: dateAt(5, 9, 30),
    end: dateAt(5, 11, 0),
    color: "#009f86",
    resourceId: "room-b"
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
    rrule: "FREQ=DAILY;COUNT=15",
    resourceId: "room-a"
  },
  {
    id: "design-review",
    title: "Design Review",
    start: dateAt(7, 14, 0),
    end: dateAt(7, 15, 30),
    color: "#e67e22",
    resourceId: "room-b"
  },
  {
    id: "team-lunch",
    title: "Team Lunch",
    start: dateAt(10, 12, 0),
    end: dateAt(10, 13, 0),
    color: "#2ecc71",
    resourceId: "room-a"
  }
];

export const demoResources: Resource[] = [
  { id: "room-a", title: "Room A", color: "#3862ff" },
  { id: "room-b", title: "Room B", color: "#009f86" }
];
