import { format } from "date-fns";
import type { Locale } from "date-fns";
import { useEffect, useRef } from "react";
import { EventItem } from "./EventItem";
import type { CalendarEvent, EventMouseInfo } from "../types";

interface EventPopoverProps {
  date: Date;
  events: CalendarEvent[];
  anchorRect: DOMRect;
  locale?: Locale;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
  onClose: () => void;
}

export function EventPopover({
  date,
  events,
  anchorRect,
  locale,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onClose
}: EventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw) {
      el.style.left = `${anchorRect.left - rect.width}px`;
    }
    if (rect.bottom > vh) {
      el.style.top = `${anchorRect.top - rect.height}px`;
    }
  }, [anchorRect]);

  return (
    <div
      ref={popoverRef}
      className="oc-popover"
      style={{
        position: "fixed",
        top: anchorRect.bottom + 4,
        left: anchorRect.left
      }}
    >
      <div className="oc-popover__header">
        <span className="oc-popover__title">
          {format(date, "EEEE, MMM d", { locale })}
        </span>
        <button
          type="button"
          className="oc-popover__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="oc-popover__body">
        {events.map((event) => (
          <EventItem
            key={`${event.id}-${event.start.toISOString()}`}
            event={event}
            onClick={onEventClick}
            onMouseEnter={onEventMouseEnter}
            onMouseLeave={onEventMouseLeave}
          />
        ))}
      </div>
    </div>
  );
}
