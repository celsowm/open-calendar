import { format } from "date-fns";
import type { CalendarEvent, EventMouseInfo } from "../types";

interface EventItemProps {
  event: CalendarEvent;
  prefix?: string;
  onClick?: (event: CalendarEvent) => void;
  onMouseEnter?: (info: EventMouseInfo) => void;
  onMouseLeave?: (info: EventMouseInfo) => void;
}

export function EventItem({ event, prefix, onClick, onMouseEnter, onMouseLeave }: EventItemProps) {
  const display = event.display;

  if (display === "dot") {
    return (
      <button
        type="button"
        className={`oc-event-dot ${event.className ?? ""}`}
        onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
        onMouseEnter={(e) => onMouseEnter?.({ event, domEvent: e })}
        onMouseLeave={(e) => onMouseLeave?.({ event, domEvent: e })}
      >
        <span className="oc-event-dot__indicator" style={{ backgroundColor: event.color }} />
        <span className="oc-event-dot__title">{event.title}</span>
      </button>
    );
  }

  if (display === "list-item") {
    return (
      <button
        type="button"
        className={`oc-event-list-item ${event.className ?? ""}`}
        style={{ borderLeftColor: event.color }}
        onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
        onMouseEnter={(e) => onMouseEnter?.({ event, domEvent: e })}
        onMouseLeave={(e) => onMouseLeave?.({ event, domEvent: e })}
      >
        <span className="oc-event-list-item__time">
          {event.allDay ? "All-day" : format(event.start, "HH:mm")}
        </span>
        <span className="oc-event-list-item__title">{event.title}</span>
      </button>
    );
  }

  const chipClass = display === "compact" ? "oc-event-chip oc-event-chip--compact" : "oc-event-chip";

  return (
    <button
      type="button"
      className={`${chipClass} ${event.className ?? ""}`}
      style={{ backgroundColor: event.color }}
      onClick={(e) => { e.stopPropagation(); onClick?.(event); }}
      onMouseEnter={(e) => onMouseEnter?.({ event, domEvent: e })}
      onMouseLeave={(e) => onMouseLeave?.({ event, domEvent: e })}
    >
      {prefix}{event.title}
    </button>
  );
}
