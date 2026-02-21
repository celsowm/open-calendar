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
  private getState: () => CalendarState;
  private getVisibleRange: () => DateRange;
  private getTitle: () => string;
  private getAllEvents: () => CalendarEvent[];
  private addNewEvent: (event: CalendarEventInput) => string;
  private deleteEvent: (eventId: string) => void;
  private deleteAllEvents: () => void;
  private getAllEventSources: () => EventSource[];
  private addNewEventSource: (source: EventSource) => void;
  private deleteEventSource: (source: EventSource) => void;
  private doRefetchEvents: () => void;

  constructor(
    getState: () => CalendarState,
    getVisibleRange: () => DateRange,
    getTitle: () => string,
    getAllEvents: () => CalendarEvent[],
    addNewEvent: (event: CalendarEventInput) => string,
    deleteEvent: (eventId: string) => void,
    deleteAllEvents: () => void,
    getAllEventSources: () => EventSource[],
    addNewEventSource: (source: EventSource) => void,
    deleteEventSource: (source: EventSource) => void,
    refetchEvents: () => void
  ) {
    this.getState = getState;
    this.getVisibleRange = getVisibleRange;
    this.getTitle = getTitle;
    this.getAllEvents = getAllEvents;
    this.addNewEvent = addNewEvent;
    this.deleteEvent = deleteEvent;
    this.deleteAllEvents = deleteAllEvents;
    this.getAllEventSources = getAllEventSources;
    this.addNewEventSource = addNewEventSource;
    this.deleteEventSource = deleteEventSource;
    this.doRefetchEvents = refetchEvents;
  }

  getView(): CalendarViewInfo {
    const state = this.getState();
    const range = this.getVisibleRange();
    return {
      type: state.view,
      title: this.getTitle(),
      start: range.start,
      end: range.end
    };
  }

  getDate(): Date {
    return this.getState().currentDate;
  }

  gotoDate(date: Date | string | number): void {
    this.getState().setCurrentDate(toDate(date));
  }

  incrementDate(duration: { years?: number; months?: number; days?: number }): void {
    const state = this.getState();
    const newDate = addDuration(state.currentDate, duration);
    state.setCurrentDate(newDate);
  }

  prev(): void {
    this.getState().goToPrevious();
  }

  next(): void {
    this.getState().goToNext();
  }

  today(): void {
    this.getState().goToToday();
  }

  changeView(view: CalendarView): void {
    this.getState().setView(view);
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
    return [...this.getAllEventSources()];
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
