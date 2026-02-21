import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../src";
import type { CalendarApi, CalendarEventInput, EventSource } from "../src/types";

const events: CalendarEventInput[] = [
  {
    id: "1",
    title: "Sprint Planning",
    start: new Date(2026, 1, 10, 9, 0),
    end: new Date(2026, 1, 10, 10, 0)
  }
];

describe("Calendar", () => {
  it("renders event title in month view", () => {
    render(<Calendar events={events} initialDate={new Date(2026, 1, 1)} initialView="month" />);
    expect(screen.getByText("Sprint Planning")).toBeTruthy();
  });

  it("switches to week view", async () => {
    const user = userEvent.setup();
    render(<Calendar events={events} initialDate={new Date(2026, 1, 1)} initialView="month" />);

    const weekButton = screen.getByRole("button", { name: "Week" });
    await user.click(weekButton);
    expect(weekButton.className.includes("oc-btn--active")).toBe(true);
  });

  it("keeps onReady API view state updated after navigation", async () => {
    const user = userEvent.setup();
    let api: CalendarApi | undefined;

    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="month"
        onReady={(readyApi) => {
          api = readyApi;
        }}
      />
    );

    await waitFor(() => expect(api).toBeDefined());
    expect(api!.getView().type).toBe("month");

    const weekButton = screen.getByRole("button", { name: "Week" });
    await user.click(weekButton);

    await waitFor(() => expect(api!.getView().type).toBe("timeGridWeek"));
  });

  it("removes the exact event source instance", async () => {
    let api: CalendarApi | undefined;

    render(
      <Calendar
        events={events}
        initialDate={new Date(2026, 1, 1)}
        initialView="month"
        onReady={(readyApi) => {
          api = readyApi;
        }}
      />
    );

    await waitFor(() => expect(api).toBeDefined());

    const sourceA: EventSource = {
      type: "function",
      config: { events: () => [{ id: "a", title: "A", start: new Date(2026, 1, 1, 9, 0) }] }
    };
    const sourceB: EventSource = {
      type: "function",
      config: { events: () => [{ id: "b", title: "B", start: new Date(2026, 1, 1, 10, 0) }] }
    };

    await act(async () => {
      api!.addEventSource(sourceA);
      api!.addEventSource(sourceB);
    });

    await waitFor(() => expect(api!.getEventSources()).toHaveLength(2));

    await act(async () => {
      api!.removeEventSource(sourceB);
    });

    await waitFor(() => expect(api!.getEventSources()).toHaveLength(1));
    expect(api!.getEventSources()[0]).toBe(sourceA);
  });
});
