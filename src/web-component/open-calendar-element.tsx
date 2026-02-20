import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { Calendar } from "../components/Calendar";
import type { CalendarEventInput, CalendarView } from "../types";

const VALID_VIEWS: CalendarView[] = ["month", "timeGridWeek", "timeGridDay"];

function parseEvents(raw: string | null): CalendarEventInput[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CalendarEventInput[]) : [];
  } catch {
    return [];
  }
}

function parseView(raw: string | null): CalendarView {
  if (!raw) {
    return "month";
  }
  return VALID_VIEWS.includes(raw as CalendarView) ? (raw as CalendarView) : "month";
}

export class OpenCalendarElement extends HTMLElement {
  private root?: Root;
  private mountPoint?: HTMLDivElement;

  static get observedAttributes(): string[] {
    return ["events", "view", "date"];
  }

  connectedCallback(): void {
    if (!this.mountPoint) {
      this.mountPoint = document.createElement("div");
      this.append(this.mountPoint);
      this.root = createRoot(this.mountPoint);
    }

    this.renderCalendar();
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = undefined;
    this.mountPoint = undefined;
  }

  attributeChangedCallback(): void {
    this.renderCalendar();
  }

  private renderCalendar(): void {
    if (!this.root) {
      return;
    }

    const events = parseEvents(this.getAttribute("events"));
    const initialView = parseView(this.getAttribute("view"));
    const dateAttribute = this.getAttribute("date");

    this.root.render(
      <Calendar
        events={events}
        initialView={initialView}
        initialDate={dateAttribute ?? undefined}
        height={this.getAttribute("height") ?? 760}
      />
    );
  }
}

export function defineOpenCalendarElement(tagName = "open-calendar"): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, OpenCalendarElement);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "open-calendar": OpenCalendarElement;
  }
}
