import type { Locale } from "date-fns";
import type { ReactNode } from "react";

export type DateInput = Date | string | number;
export type BuiltInViewType =
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

export type CalendarView = BuiltInViewType | string;

export interface CustomViewConfig {
  /** Unique identifier for the view */
  type: string;
  /** Display label shown in toolbar */
  label: string;
  /** Component to render for this view */
  component: React.ComponentType<CustomViewProps>;
  /** Duration in days for navigation (default: 1) */
  duration?: number;
  /** Duration in weeks for navigation */
  durationWeeks?: number;
  /** Duration in months for navigation */
  durationMonths?: number;
  /** Custom title formatter */
  titleFormat?: (date: Date, locale?: Locale) => string;
  /** Custom date range calculator */
  dateRange?: (date: Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6) => { start: Date; end: Date };
}

export interface CustomViewProps {
  /** Current date being displayed */
  date: Date;
  /** Events visible in the current range */
  events: CalendarEvent[];
  /** Current locale */
  locale?: Locale;
  /** Day the week starts on (0=Sunday, 1=Monday, etc.) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Resources for resource-based views */
  resources?: Resource[];
  /** Handler for date clicks */
  onDateClick?: (date: Date) => void;
  /** Handler for event clicks */
  onEventClick?: (event: CalendarEvent) => void;
  /** Handler for event mouse enter */
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  /** Handler for event mouse leave */
  onEventMouseLeave?: (info: EventMouseInfo) => void;
  /** Whether editing is enabled */
  editable?: boolean;
  /** Whether selection is enabled */
  selectable?: boolean;
  /** Handler for date selection */
  onSelect?: (info: DateSelectInfo) => void;
}

export type EventDisplay = "auto" | "background" | "compact" | "dot" | "list-item";

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

export interface EventMouseInfo {
  event: CalendarEvent;
  domEvent: React.MouseEvent;
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
  /** Called when mouse enters an event element */
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  /** Called when mouse leaves an event element */
  onEventMouseLeave?: (info: EventMouseInfo) => void;
  navLinks?: boolean;
  editable?: boolean;
  onEventDrop?: (info: EventDropInfo) => void;
  onEventResize?: (info: EventResizeInfo) => void;
  selectable?: boolean;
  onSelect?: (info: DateSelectInfo) => void;
  weekNumbers?: boolean;
  resources?: Resource[];
  listRange?: number;
  /** Custom view configurations for extending the calendar with user-defined views */
  customViews?: CustomViewConfig[];
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
