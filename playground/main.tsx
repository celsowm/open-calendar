import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Calendar } from "../src";
import { demoEvents } from "./demo-events";
import "../src/styles/open-calendar.css";
import "./styles.css";

function PlaygroundApp() {
  const [message, setMessage] = useState("Click on an event or time slot.");

  return (
    <main className="playground-shell">
      <section className="playground-hero">
        <h1>Open Calendar</h1>
        <p>Freemium-free modern scheduler starter.</p>
      </section>

      <Calendar
        events={demoEvents}
        initialView="month"
        nowIndicator
        navLinks
        businessHours={[
          { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "18:00" }
        ]}
        onEventClick={(event) => setMessage(`Event: ${event.title}`)}
        onDateClick={(date) => setMessage(`Date click: ${date.toLocaleString()}`)}
      />

      <aside className="playground-status">{message}</aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PlaygroundApp />);
