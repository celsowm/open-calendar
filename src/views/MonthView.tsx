import { format, isToday, startOfMonth, startOfWeek, addDays } from "date-fns";
import type { Locale } from "date-fns";
import { Fragment, useCallback, useState } from "react";
import { areSameDay, getWeekNumber } from "../core/date";
import { eventIntersectsDay } from "../core/events";
import { EventPopover } from "../components/EventPopover";
import type { CalendarEvent, EventMouseInfo } from "../types";

interface PopoverState {
  date: Date;
  events: CalendarEvent[];
  anchorRect: DOMRect;
}

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  weekNumbers: boolean;
  navLinks: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
  onNavLinkClick?: (date: Date) => void;
}

const MAX_VISIBLE_EVENTS = 3;

export function MonthView({
  date,
  events,
  locale,
  weekStartsOn,
  weekNumbers,
  navLinks,
  onDateClick,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onNavLinkClick
}: MonthViewProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null);

  const handleMoreClick = useCallback(
    (e: React.MouseEvent, day: Date, dayEvents: CalendarEvent[]) => {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPopover({ date: day, events: dayEvents, anchorRect: rect });
    },
    []
  );

  const closePopover = useCallback(() => setPopover(null), []);
  const firstCell = startOfWeek(startOfMonth(date), { weekStartsOn });
  const dayLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(firstCell, index), "EEE", { locale })
  );
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(firstCell, index));
  const cols = weekNumbers ? 8 : 7;

  return (
    <section className="oc-month" style={{ "--oc-month-cols": String(cols) } as React.CSSProperties}>
      <div className="oc-month__header">
        {weekNumbers && <div className="oc-month__header-cell oc-month__week-header">W</div>}
        {dayLabels.map((label, index) => (
          <div key={`${label}-${index}`} className="oc-month__header-cell">
            {label}
          </div>
        ))}
      </div>

      <div className="oc-month__grid">
        {monthDays.map((day, index) => {
          const showWeekNum = weekNumbers && index % 7 === 0;
          const weekNum = showWeekNum ? getWeekNumber(day, weekStartsOn) : null;
          const dayEvents = events.filter((event) => eventIntersectsDay(event, day));
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
          const overflowCount = Math.max(dayEvents.length - visibleEvents.length, 0);
          const isCurrentMonth = day.getMonth() === date.getMonth();

          return (
            <Fragment key={day.toISOString()}>
              {weekNum !== null && (
                <div className="oc-month__week-number">
                  {weekNum}
                </div>
              )}
              <article
                className={`oc-day-cell ${isCurrentMonth ? "" : "oc-day-cell--muted"} ${
                  isToday(day) ? "oc-day-cell--today" : ""
                }`}
                onClick={() => onDateClick?.(day)}
              >
              <div className="oc-day-cell__date-wrap">
                {navLinks ? (
                  <button
                    type="button"
                    className="oc-day-cell__date oc-link-reset"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavLinkClick?.(day);
                    }}
                  >
                    {format(day, "d")}
                  </button>
                ) : (
                  <span className="oc-day-cell__date">{format(day, "d")}</span>
                )}
              </div>

              <div className="oc-day-cell__events">
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
                    onMouseEnter={(e) => onEventMouseEnter?.({ event, domEvent: e })}
                    onMouseLeave={(e) => onEventMouseLeave?.({ event, domEvent: e })}
                  >
                    {!areSameDay(event.start, day) ? "-> " : ""}
                    {event.title}
                  </button>
                ))}

                {overflowCount > 0 ? (
                  <button
                    type="button"
                    className="oc-more-label"
                    onClick={(e) => handleMoreClick(e, day, dayEvents)}
                  >
                    +{overflowCount} more
                  </button>
                ) : null}
              </div>
            </article>
            </Fragment>
          );
        })}
      </div>

      {popover && (
        <EventPopover
          date={popover.date}
          events={popover.events}
          anchorRect={popover.anchorRect}
          locale={locale}
          onEventClick={onEventClick}
          onEventMouseEnter={onEventMouseEnter}
          onEventMouseLeave={onEventMouseLeave}
          onClose={closePopover}
        />
      )}
    </section>
  );
}
