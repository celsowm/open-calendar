import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "../src";
import type { CalendarEventInput } from "../src/types";

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
});
