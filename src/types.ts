import type { Locale } from "date-fns";

export type DateInput = Date | string | number;
export type CalendarView = "month" | "timeGridWeek" | "timeGridDay";

export type EventDisplay = "auto" | "background";

export interface CalendarEventInput {
  id?: string | number;
  title: string;
  start: DateInput;
  end?: DateInput;
  allDay?: boolean;
  color?: string;
  resourceId?: string;
  className?: string;
  display?: EventDisplay;
  rrule?: string;
  exdate?: DateInput[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  resourceId?: string;
  className?: string;
  display: EventDisplay;
  rrule?: string;
  exdate: Date[];
}

export interface BusinessHoursInput {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface CalendarProps {
  events: CalendarEventInput[];
  initialDate?: DateInput;
  initialView?: CalendarView;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  nowIndicator?: boolean;
  locale?: Locale;
  className?: string;
  height?: number | string;
  businessHours?: BusinessHoursInput[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  navLinks?: boolean;
}

export interface ToolbarProps {
  title: string;
  view: CalendarView;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarView) => void;
}
