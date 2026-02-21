import { format, isToday, startOfWeek, addDays } from "date-fns";
import type { Locale } from "date-fns";
import type { CSSProperties } from "react";
import { eventIntersectsDay } from "../core/events";
import { EventItem } from "../components/EventItem";
import type { CalendarEvent, CommonViewProps, EventMouseInfo } from "../types";

interface DayGridViewProps extends CommonViewProps {
  view: "dayGridWeek" | "dayGridDay";
  navLinks: boolean;
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
  onEventMouseEnter,
  onEventMouseLeave,
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
                {format(day, "EEE d", { locale: locale.dateFnsLocale })}
              </button>
            ) : (
              <span className="oc-daygrid__header-label">
                {format(day, "EEE d", { locale: locale.dateFnsLocale })}
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
                  <EventItem
                    key={`${event.id}-${event.start.toISOString()}`}
                    event={event}
                    onClick={onEventClick}
                    onMouseEnter={onEventMouseEnter}
                    onMouseLeave={onEventMouseLeave}
                  />
                ))}

                {overflowCount > 0 ? (
                  <span className="oc-more-label">+{overflowCount} {locale.messages.moreEvents}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
