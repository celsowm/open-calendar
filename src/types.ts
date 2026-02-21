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

export interface CommonViewProps {
  /** Current date being displayed */
  date: Date;
  /** Events visible in the current range */
  events: CalendarEvent[];
  /** Current locale and translations */
  locale: CalendarLocale;
  /** Day the week starts on (0=Sunday, 1=Monday, etc.) */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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

export interface CustomViewProps extends Omit<CommonViewProps, "locale"> {
  /** Current locale (date-fns for backward compat/custom use) */
  locale?: Locale;
  /** Original locale data */
  localeData?: CalendarLocale;
  /** Resources for resource-based views */
  resources?: Resource[];
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

export interface TranslationMessages {
  today: string;
  next: string;
  prev: string;
  allDay: string;
  week: string;
  day: string;
  month: string;
  list: string;
  moreEvents: string;
  noEvents: string;
  close: string;
  // View labels
  viewMonth: string;
  viewWeek: string;
  viewDay: string;
  viewList: string;
  viewTimeline: string;
  viewResources: string;
}

export interface CalendarLocale {
  code: string;
  dateFnsLocale: Locale;
  messages: TranslationMessages;
}

export interface CalendarProps {
  /** Static events array. Optional if using eventSources */
  events?: CalendarEventInput[];
  /** Event sources for dynamic event fetching (HTTP, function, JSON feed) */
  eventSources?: EventSource[];
  initialDate?: DateInput;
  initialView?: CalendarView;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  nowIndicator?: boolean;
  /** Locale configuration. Can be a CalendarLocale object or a date-fns Locale. */
  locale?: CalendarLocale | Locale;
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
  /** Called when the calendar is ready, receives the CalendarApi */
  onReady?: (api: CalendarApi) => void;
}

/** Event Source Types */

export interface EventSourceRange {
  start: Date;
  end: Date;
}

export interface EventSourceFetchParams {
  start: Date;
  end: Date;
  timeZone?: string;
}

export interface HttpEventSourceConfig {
  /** URL to fetch events from. Can be a string or a function that returns a URL */
  url: string | ((params: EventSourceFetchParams) => string);
  /** HTTP method (default: 'GET') */
  method?: string;
  /** Headers to include in the request */
  headers?: Record<string, string>;
  /** Request body for POST requests */
  body?: Record<string, unknown> | ((params: EventSourceFetchParams) => Record<string, unknown>);
  /** Custom response data extractor */
  eventDataTransform?: (data: unknown) => CalendarEventInput[];
  /** Enable caching (default: true) */
  cache?: boolean;
  /** Cache duration in milliseconds (default: 10 minutes) */
  cacheDuration?: number;
  /** Fetch options */
  credentials?: RequestCredentials;
  /** Enable lazy range fetching - only fetch when range is needed */
  lazy?: boolean;
}

export interface FunctionEventSourceConfig {
  /** Function to fetch events */
  events: (params: EventSourceFetchParams) => CalendarEventInput[] | Promise<CalendarEventInput[]>;
  /** Enable caching (default: true) */
  cache?: boolean;
  /** Cache duration in milliseconds (default: 10 minutes) */
  cacheDuration?: number;
  /** Enable lazy range fetching */
  lazy?: boolean;
}

export interface JsonFeedEventSourceConfig {
  /** URL to fetch JSON feed from */
  url: string | ((params: EventSourceFetchParams) => string);
  /** Headers to include in the request */
  headers?: Record<string, string>;
  /** Custom response data extractor */
  eventDataTransform?: (data: unknown) => CalendarEventInput[];
  /** Enable caching (default: true) */
  cache?: boolean;
  /** Cache duration in milliseconds (default: 10 minutes) */
  cacheDuration?: number;
  /** Fetch options */
  credentials?: RequestCredentials;
  /** Enable lazy range fetching */
  lazy?: boolean;
}

export type EventSource =
  | { type: "http"; config: HttpEventSourceConfig }
  | { type: "function"; config: FunctionEventSourceConfig }
  | { type: "jsonFeed"; config: JsonFeedEventSourceConfig }
  | { type: "static"; events: CalendarEventInput[] };

export interface EventSourceStatus {
  isLoading: boolean;
  error: Error | null;
  lastFetched?: Date;
}

export interface ToolbarProps {
  title: string;
  view: CalendarView;
  availableViews: Array<{ label: string; value: CalendarView }>;
  messages: TranslationMessages;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarView) => void;
}

/** Calendar API Types */

export interface CalendarViewInfo {
  type: CalendarView;
  title: string;
  start: Date;
  end: Date;
}

export interface CalendarApi {
  /** Get the current view information */
  getView(): CalendarViewInfo;
  /** Get the current date */
  getDate(): Date;
  /** Navigate to a specific date */
  gotoDate(date: DateInput): void;
  /** Move the current date forward or backward by the given duration */
  incrementDate(duration: { years?: number; months?: number; days?: number }): void;
  /** Go to the previous period */
  prev(): void;
  /** Go to the next period */
  next(): void;
  /** Go to today */
  today(): void;
  /** Change the current view */
  changeView(view: CalendarView): void;
  /** Get all current events */
  getEvents(): CalendarEvent[];
  /** Get a specific event by its ID */
  getEventById(id: string): CalendarEvent | undefined;
  /** Add a new event */
  addEvent(event: CalendarEventInput): string;
  /** Remove an event by ID */
  removeEvent(eventId: string): void;
  /** Remove all events */
  removeAllEvents(): void;
  /** Get all event sources */
  getEventSources(): EventSource[];
  /** Add a new event source */
  addEventSource(source: EventSource): void;
  /** Remove an event source */
  removeEventSource(source: EventSource): void;
  /** Refetch events from all event sources */
  refetchEvents(): void;
}
