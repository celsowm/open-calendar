import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Calendar, DEFAULT_LOCALE } from "../src";
import type { CalendarApi } from "../src/types";
import { demoEvents } from "./demo-events";
import "../src/styles/open-calendar.css";
import "./styles.css";

const DEMO_MENU = [
  "Drag-n-Drop Events",
  "Resource Timeline",
  "Resource Time Grid",
  "Year Views",
  "Selectable Dates",
  "Background Events",
  "Theming",
  "Locales",
  "Time Zones"
];

function PlaygroundApp() {
  const [message, setMessage] = useState("Click on an event or a date slot.");
  const calendarRef = useRef<CalendarApi>(null);

  return (
    <main className="fc-playground">
      <aside className="fc-demos">
        <h1 className="fc-demos__title">Demos</h1>
        <nav className="fc-demos__nav" aria-label="Demo sections">
          {DEMO_MENU.map((label) => (
            <button key={label} type="button" className="fc-demos__item">
              <span>{label}</span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="fc-calendar-pane">
        <Calendar
          ref={calendarRef}
          className="fc-calendar-skin"
          events={demoEvents}
          initialDate={new Date(2026, 1, 1)}
          initialView="month"
          locale={DEFAULT_LOCALE}
          editable
          selectable
          navLinks
          onEventClick={(event) => setMessage(`Event: ${event.title}`)}
          onDateClick={(date) => setMessage(`Date click: ${date.toLocaleString()}`)}
          onEventDrop={(info) =>
            setMessage(`Dropped "${info.event.title}" to ${info.newStart.toLocaleString()}`)
          }
          onEventResize={(info) =>
            setMessage(`Resized "${info.event.title}" to ${info.newEnd.toLocaleString()}`)
          }
          onSelect={(info) =>
            setMessage(`Selected: ${info.start.toLocaleString()} - ${info.end.toLocaleString()}`)
          }
        />

        <div className="fc-playground-hints">
          <span className="fc-playground-status">{message}</span>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PlaygroundApp />);
