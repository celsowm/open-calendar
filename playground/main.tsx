import { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { format, addDays } from "date-fns";
import { Calendar, DEFAULT_LOCALE, PT_BR_LOCALE, ES_LOCALE } from "../src";
import type { CalendarView, CustomViewConfig, CustomViewProps, CalendarLocale, CalendarApi } from "../src/types";
import { demoEvents, demoResources } from "./demo-events";
import "../src/styles/open-calendar.css";
import "./styles.css";

// Example custom view: A simple 3-day view
function ThreeDayView({ date, events, locale, onEventClick }: CustomViewProps) {
  const days = [0, 1, 2].map((offset) => addDays(date, offset));

  return (
    <div className="oc-three-day-view">
      <div className="oc-three-day-view__header">
        {days.map((day) => (
          <div key={day.toISOString()} className="oc-three-day-view__header-cell">
            <span className="oc-three-day-view__day-name">{format(day, "EEE", { locale })}</span>
            <span className="oc-three-day-view__day-number">{format(day, "d", { locale })}</span>
          </div>
        ))}
      </div>
      <div className="oc-three-day-view__body">
        {days.map((day) => {
          const dayEvents = events.filter((e) => {
            const eventDate = new Date(e.start);
            return eventDate.toDateString() === day.toDateString();
          });

          return (
            <div key={day.toISOString()} className="oc-three-day-view__day-column">
              {dayEvents.length === 0 ? (
                <div className="oc-three-day-view__empty">No events</div>
              ) : (
                dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="oc-three-day-view__event"
                    style={{ backgroundColor: event.color || "#3b82f6" }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <span className="oc-three-day-view__event-time">
                      {format(event.start, "HH:mm")}
                    </span>
                    <span className="oc-three-day-view__event-title">{event.title}</span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Custom view configuration
const customViews: CustomViewConfig[] = [
  {
    type: "threeDay",
    label: "3-Day",
    component: ThreeDayView,
    duration: 3,
    titleFormat: (date, locale) => `${format(date, "MMM d", { locale })} - ${format(addDays(date, 2), "MMM d, yyyy", { locale })}`,
    dateRange: (date) => ({
      start: date,
      end: addDays(date, 3)
    })
  }
];

const VIEW_OPTIONS: Array<{ label: string; value: CalendarView }> = [
  { label: "Month", value: "month" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Day", value: "timeGridDay" },
  { label: "3-Day", value: "threeDay" },
  { label: "List", value: "list" },
  { label: "DayGrid Week", value: "dayGridWeek" },
  { label: "Multi-Month", value: "multiMonthStack" },
  { label: "Multi-Month Grid", value: "multiMonthGrid" },
  { label: "Timeline", value: "timeline" },
  { label: "Resources", value: "resourceTimeGrid" }
];

const LOCALES = [
  { label: "English", value: DEFAULT_LOCALE },
  { label: "Português", value: PT_BR_LOCALE },
  { label: "Español", value: ES_LOCALE }
];

function PlaygroundApp() {
  const [message, setMessage] = useState("Click on an event or time slot.");
  const [view, setView] = useState<CalendarView>("month");
  const [locale, setLocale] = useState<CalendarLocale>(DEFAULT_LOCALE);
  const calendarRef = useRef<CalendarApi>(null);

  const handleReady = (api: CalendarApi) => {
    console.log("Calendar API ready!", api);
    console.log("Current view:", api.getView());
    console.log("Current date:", api.getDate());
  };

  const handleApiPrev = () => {
    calendarRef.current?.prev();
  };

  const handleApiNext = () => {
    calendarRef.current?.next();
  };

  const handleApiToday = () => {
    calendarRef.current?.today();
  };

  const handleApiGotoDate = () => {
    calendarRef.current?.gotoDate(new Date(2025, 5, 15)); // June 15, 2025
  };

  const handleApiGetEvents = () => {
    const events = calendarRef.current?.getEvents();
    setMessage(`Total events: ${events?.length ?? 0}`);
  };

  return (
    <main className="playground-shell">
      <section className="playground-hero">
        <h1>Open Calendar</h1>
        <p>Freemium-free modern scheduler starter.</p>
      </section>

      <div className="playground-controls">
        <div className="playground-view-picker">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`playground-view-btn ${opt.value === view ? "playground-view-btn--active" : ""}`}
              onClick={() => setView(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="playground-locale-picker">
          {LOCALES.map((loc) => (
            <button
              key={loc.value.code}
              className={`playground-view-btn ${loc.value.code === locale.code ? "playground-view-btn--active" : ""}`}
              onClick={() => setLocale(loc.value)}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="playground-api-controls">
        <button className="playground-view-btn" onClick={handleApiPrev}>Prev</button>
        <button className="playground-view-btn" onClick={handleApiToday}>Today</button>
        <button className="playground-view-btn" onClick={handleApiNext}>Next</button>
        <button className="playground-view-btn" onClick={handleApiGotoDate}>Go to June 15, 2025</button>
        <button className="playground-view-btn" onClick={handleApiGetEvents}>Get Events</button>
      </div>

      <Calendar
        ref={calendarRef}
        events={demoEvents}
        resources={demoResources}
        initialView={view}
        key={`${view}-${locale.code}`}
        locale={locale}
        customViews={customViews}
        editable
        selectable
        nowIndicator
        navLinks
        weekNumbers
        businessHours={[
          { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" }
        ]}
        onReady={handleReady}
        onEventClick={(event) => setMessage(`Event: ${event.title}`)}
        onDateClick={(date) => setMessage(`Date click: ${date.toLocaleString()}`)}
        onEventDrop={(info) =>
          setMessage(`Dropped "${info.event.title}" to ${info.newStart.toLocaleString()}`)
        }
        onEventResize={(info) =>
          setMessage(`Resized "${info.event.title}" to ${info.newEnd.toLocaleString()}`)
        }
        onSelect={(info) =>
          setMessage(`Selected: ${info.start.toLocaleString()} — ${info.end.toLocaleString()}`)
        }
      />

      <aside className="playground-status">{message}</aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PlaygroundApp />);
