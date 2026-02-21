export { Calendar } from "./components/Calendar";
export { defineOpenCalendarElement, OpenCalendarElement } from "./web-component/open-calendar-element";
export { useEventSources } from "./hooks/useEventSources";
export type { UseEventSourcesOptions, UseEventSourcesResult } from "./hooks/useEventSources";
export {
  createHttpSource,
  createFunctionSource,
  createJsonFeedSource,
  createStaticSource,
  fetchFromSource,
  fetchFromSources,
  clearCache
} from "./core/event-sources";
export {
  DEFAULT_LOCALE,
  PT_BR_LOCALE,
  ES_LOCALE,
  DEFAULT_MESSAGES,
  getLocaleData
} from "./locales";
export type {
  BusinessHoursInput,
  CalendarEvent,
  CalendarEventInput,
  CalendarLocale,
  CalendarProps,
  CalendarView,
  CustomViewConfig,
  CustomViewProps,
  CommonViewProps,
  DateSelectInfo,
  EventDisplay,
  EventDropInfo,
  EventResizeInfo,
  EventSource,
  EventSourceFetchParams,
  EventSourceStatus,
  FunctionEventSourceConfig,
  HttpEventSourceConfig,
  JsonFeedEventSourceConfig,
  Resource,
  TranslationMessages
} from "./types";
