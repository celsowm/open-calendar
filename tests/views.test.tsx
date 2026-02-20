import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../src";
import type { CalendarEventInput, Resource } from "../src/types";

const events: CalendarEventInput[] = [
  {
    id: "1",
    title: "Sprint Planning",
    start: new Date(2026, 1, 10, 9, 0),
    end: new Date(2026, 1, 10, 10, 0),
    resourceId: "room-a"
  },
  {
    id: "2",
    title: "Lunch Break",
    start: new Date(2026, 1, 12, 12, 0),
    end: new Date(2026, 1, 12, 13, 0),
    resourceId: "room-b"
  }
];

const resources: Resource[] = [
  { id: "room-a", title: "Room A" },
  { id: "room-b", title: "Room B" }
];

describe("ListView", () => {
  it("renders events in list view", () => {
    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="list"
      />
    );
    expect(screen.getByText("Sprint Planning")).toBeTruthy();
    expect(screen.getByText("Lunch Break")).toBeTruthy();
  });
});

describe("DayGridView", () => {
  it("renders events in dayGrid week view", () => {
    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 10)}
        initialView="dayGridWeek"
      />
    );
    expect(screen.getByText("Sprint Planning")).toBeTruthy();
  });
});

describe("MultiMonthView", () => {
  it("renders multi-month stack view", () => {
    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="multiMonthStack"
      />
    );
    expect(screen.getAllByText("February 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("March 2026")).toBeTruthy();
    expect(screen.getByText("April 2026")).toBeTruthy();
  });

  it("renders multi-month grid view", () => {
    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="multiMonthGrid"
      />
    );
    expect(screen.getAllByText("February 2026").length).toBeGreaterThanOrEqual(1);
  });
});

describe("TimelineView", () => {
  it("renders resource labels in timeline view", () => {
    render(
      <Calendar
        events={events}
        resources={resources}
        initialDate={new Date(2026, 1, 10)}
        initialView="timeline"
      />
    );
    expect(screen.getByText("Room A")).toBeTruthy();
    expect(screen.getByText("Room B")).toBeTruthy();
  });
});

describe("ResourceTimeGridView", () => {
  it("renders resource columns in resource timegrid view", () => {
    render(
      <Calendar
        events={events}
        resources={resources}
        initialDate={new Date(2026, 1, 10)}
        initialView="resourceTimeGrid"
      />
    );
    expect(screen.getByText("Room A")).toBeTruthy();
    expect(screen.getByText("Room B")).toBeTruthy();
  });
});

describe("WeekNumbers", () => {
  it("renders week numbers in month view when enabled", () => {
    const { container } = render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="month"
        weekNumbers
      />
    );
    const weekCells = container.querySelectorAll(".oc-month__week-number");
    expect(weekCells.length).toBe(6);
    const weekHeader = container.querySelector(".oc-month__week-header");
    expect(weekHeader).toBeTruthy();
    expect(weekHeader!.textContent).toBe("W");
  });

  it("does not render week numbers when disabled", () => {
    const { container } = render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="month"
      />
    );
    const weekCells = container.querySelectorAll(".oc-month__week-number");
    expect(weekCells.length).toBe(0);
  });
});

describe("Interactions", () => {
  it("fires onSelect when selectable is enabled", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 10)}
        initialView="timeGridDay"
        selectable
        onSelect={onSelect}
      />
    );
    expect(screen.getByText("Sprint Planning")).toBeTruthy();
  });

  it("renders resize handles when editable", () => {
    const { container } = render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 10)}
        initialView="timeGridDay"
        editable
      />
    );
    const handles = container.querySelectorAll(".oc-timegrid__resize-handle");
    expect(handles.length).toBeGreaterThan(0);
  });
});
