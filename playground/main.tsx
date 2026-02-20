import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Calendar } from "../src";
import type { CalendarView } from "../src/types";
import { demoEvents, demoResources } from "./demo-events";
import "../src/styles/open-calendar.css";
import "./styles.css";

const VIEW_OPTIONS: Array<{ label: string; value: CalendarView }> = [
  { label: "Month", value: "month" },
  { label: "Week", value: "timeGridWeek" },
  { label: "Day", value: "timeGridDay" },
  { label: "List", value: "list" },
  { label: "DayGrid Week", value: "dayGridWeek" },
  { label: "Multi-Month", value: "multiMonthStack" },
  { label: "Multi-Month Grid", value: "multiMonthGrid" },
  { label: "Timeline", value: "timeline" },
  { label: "Resources", value: "resourceTimeGrid" }
];

function PlaygroundApp() {
  const [message, setMessage] = useState("Click on an event or time slot.");
  const [view, setView] = useState<CalendarView>("month");

  return (
    <main className="playground-shell">
      <section className="playground-hero">
        <h1>Open Calendar</h1>
        <p>Freemium-free modern scheduler starter.</p>
      </section>

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

      <Calendar
        events={demoEvents}
        resources={demoResources}
        initialView={view}
        key={view}
        editable
        selectable
        nowIndicator
        navLinks
        weekNumbers
        businessHours={[
          { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" }
        ]}
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
