import { format, startOfDay } from "date-fns";
import type { Locale } from "date-fns";
import type { CalendarEvent, CalendarLocale, EventMouseInfo } from "../types";

interface ListViewProps {
  events: CalendarEvent[];
  locale?: CalendarLocale;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
}

export function ListView({ events, locale, onEventClick, onEventMouseEnter, onEventMouseLeave }: ListViewProps) {
  const visibleEvents = events.filter((event) => event.display !== "background");

  if (visibleEvents.length === 0) {
    return (
      <section className="oc-list">
        <p className="oc-list__empty">{locale?.messages.noEvents ?? "No events"}</p>
      </section>
    );
  }

  const sorted = [...visibleEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

  const groups = new Map<number, CalendarEvent[]>();
  for (const event of sorted) {
    const key = startOfDay(event.start).getTime();
    const group = groups.get(key);
    if (group) {
      group.push(event);
    } else {
      groups.set(key, [event]);
    }
  }

  return (
    <section className="oc-list">
      {[...groups.entries()].map(([dayKey, dayEvents]) => (
        <div key={dayKey} className="oc-list__group">
          <div className="oc-list__day-header">
            {format(new Date(dayKey), "EEEE, MMM dd yyyy", { locale: locale?.dateFnsLocale })}
          </div>

          {dayEvents.map((event) => (
            <button
              key={`${event.id}-${event.start.toISOString()}`}
              type="button"
              className={`oc-list__event ${event.className ?? ""}`}
              style={{ borderLeftColor: event.color }}
              onClick={() => onEventClick?.(event)}
              onMouseEnter={(e) => onEventMouseEnter?.({ event, domEvent: e })}
              onMouseLeave={(e) => onEventMouseLeave?.({ event, domEvent: e })}
            >
              <span className="oc-list__event-time">
                {event.allDay
                  ? (locale?.messages.allDay ?? "All-day")
                  : `${format(event.start, "HH:mm", { locale: locale?.dateFnsLocale })} - ${format(event.end, "HH:mm", { locale: locale?.dateFnsLocale })}`}
              </span>
              <span className="oc-list__event-title">{event.title}</span>
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
