import type { Locale } from "date-fns";

export type DateInput = Date | string | number;
export type CalendarView =
  | "month"
  | "timeGridWeek"
  | "timeGridDay"
  | "list"
  | "dayGridWeek"
  | "dayGridDay"
  | "multiMonthStack"
  | "multiMonthGrid"
  | "timeline"
  | "resourceTimeGrid";

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

export interface Resource {
  id: string;
  title: string;
  color?: string;
  children?: Resource[];
}

export interface EventDropInfo {
  event: CalendarEvent;
  oldStart: Date;
  oldEnd: Date;
  newStart: Date;
  newEnd: Date;
  oldResourceId?: string;
  newResourceId?: string;
  revert: () => void;
}

export interface EventResizeInfo {
  event: CalendarEvent;
  oldStart: Date;
  oldEnd: Date;
  newStart: Date;
  newEnd: Date;
  revert: () => void;
}

export interface DateSelectInfo {
  start: Date;
  end: Date;
  allDay: boolean;
  resourceId?: string;
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
  editable?: boolean;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  selectable?: boolean;
  onSelect?: (info: DateSelectInfo) => void;
  weekNumbers?: boolean;
  resources?: Resource[];
  listRange?: number;
}

export interface ToolbarProps {
  title: string;
  view: CalendarView;
  availableViews: Array<{ label: string; value: CalendarView }>;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarView) => void;
}
