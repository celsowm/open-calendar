import type { 
  CalendarApi as ICalendarApi, 
  CalendarEventInput, 
  CalendarViewInfo,
  CalendarEvent,
  CalendarView,
  EventSource
} from "../types";
import type { DateRange } from "./date";
import { toDate, addDuration } from "./date";

export interface CalendarState {
  view: CalendarView;
  currentDate: Date;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
}

export class CalendarApi implements ICalendarApi {
  private state: CalendarState;
  private getVisibleRange: () => DateRange;
  private getTitle: () => string;
  private getAllEvents: () => CalendarEvent[];
  private addNewEvent: (event: CalendarEventInput) => string;
  private deleteEvent: (eventId: string) => void;
  private deleteAllEvents: () => void;
  private eventSources: EventSource[];
  private addNewEventSource: (source: EventSource) => void;
  private deleteEventSource: (source: EventSource) => void;
  private doRefetchEvents: () => void;

  constructor(
    state: CalendarState,
    getVisibleRange: () => DateRange,
    getTitle: () => string,
    getAllEvents: () => CalendarEvent[],
    addNewEvent: (event: CalendarEventInput) => string,
    deleteEvent: (eventId: string) => void,
    deleteAllEvents: () => void,
    eventSources: EventSource[],
    addNewEventSource: (source: EventSource) => void,
    deleteEventSource: (source: EventSource) => void,
    refetchEvents: () => void
  ) {
    this.state = state;
    this.getVisibleRange = getVisibleRange;
    this.getTitle = getTitle;
    this.getAllEvents = getAllEvents;
    this.addNewEvent = addNewEvent;
    this.deleteEvent = deleteEvent;
    this.deleteAllEvents = deleteAllEvents;
    this.eventSources = eventSources;
    this.addNewEventSource = addNewEventSource;
    this.deleteEventSource = deleteEventSource;
    this.doRefetchEvents = refetchEvents;
  }

  getView(): CalendarViewInfo {
    const range = this.getVisibleRange();
    return {
      type: this.state.view,
      title: this.getTitle(),
      start: range.start,
      end: range.end
    };
  }

  getDate(): Date {
    return this.state.currentDate;
  }

  gotoDate(date: Date | string | number): void {
    this.state.setCurrentDate(toDate(date));
  }

  incrementDate(duration: { years?: number; months?: number; days?: number }): void {
    const newDate = addDuration(this.state.currentDate, duration);
    this.state.setCurrentDate(newDate);
  }

  prev(): void {
    this.state.goToPrevious();
  }

  next(): void {
    this.state.goToNext();
  }

  today(): void {
    this.state.goToToday();
  }

  changeView(view: CalendarView): void {
    this.state.setView(view);
  }

  getEvents(): CalendarEvent[] {
    return this.getAllEvents();
  }

  getEventById(id: string): CalendarEvent | undefined {
    const events = this.getAllEvents();
    return events.find(event => event.id === id);
  }

  addEvent(event: CalendarEventInput): string {
    return this.addNewEvent(event);
  }

  removeEvent(eventId: string): void {
    this.deleteEvent(eventId);
  }

  removeAllEvents(): void {
    this.deleteAllEvents();
  }

  getEventSources(): EventSource[] {
    return [...this.eventSources];
  }

  addEventSource(source: EventSource): void {
    this.addNewEventSource(source);
  }

  removeEventSource(source: EventSource): void {
    this.deleteEventSource(source);
  }

  refetchEvents(): void {
    this.doRefetchEvents();
  }
}
