import { format, isToday, startOfWeek, addDays } from "date-fns";
import type { Locale } from "date-fns";
import type { CSSProperties } from "react";
import { eventIntersectsDay } from "../core/events";
import type { CalendarEvent } from "../types";

interface DayGridViewProps {
  date: Date;
  events: CalendarEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  view: "dayGridWeek" | "dayGridDay";
  navLinks: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onNavLinkClick?: (date: Date) => void;
}

const MAX_VISIBLE_EVENTS = 4;

export function DayGridView({
  date,
  events,
  locale,
  weekStartsOn,
  view,
  navLinks,
  onDateClick,
  onEventClick,
  onNavLinkClick
}: DayGridViewProps) {
  const days =
    view === "dayGridWeek"
      ? Array.from({ length: 7 }, (_, index) =>
          addDays(startOfWeek(date, { weekStartsOn }), index)
        )
      : [date];

  return (
    <section className="oc-daygrid" style={{ "--oc-daygrid-cols": String(days.length) } as CSSProperties}>
      <div className="oc-daygrid__header">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`oc-daygrid__header-cell ${isToday(day) ? "oc-daygrid__header-cell--today" : ""}`}
          >
            {navLinks ? (
              <button
                type="button"
                className="oc-daygrid__header-label oc-link-reset"
                onClick={() => onNavLinkClick?.(day)}
              >
                {format(day, "EEE d", { locale })}
              </button>
            ) : (
              <span className="oc-daygrid__header-label">
                {format(day, "EEE d", { locale })}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="oc-daygrid__grid">
        {days.map((day) => {
          const dayEvents = events.filter(
            (event) => event.display !== "background" && eventIntersectsDay(event, day)
          );
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const overflowCount = Math.max(dayEvents.length - visibleEvents.length, 0);

          return (
            <div
              key={day.toISOString()}
              className={`oc-daygrid__col ${isToday(day) ? "oc-daygrid__col--today" : ""}`}
              onClick={() => onDateClick?.(day)}
            >
              <div className="oc-daygrid__events">
                {visibleEvents.map((event) => (
                  <button
                    key={`${event.id}-${event.start.toISOString()}`}
                    type="button"
                    className={`oc-event-chip ${event.className ?? ""}`}
                    style={{ backgroundColor: event.color }}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    {event.title}
                  </button>
                ))}

                {overflowCount > 0 ? (
                  <span className="oc-more-label">+{overflowCount} more</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
