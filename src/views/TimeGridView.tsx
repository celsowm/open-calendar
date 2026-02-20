import { addDays, addMinutes, format, isToday, startOfDay, startOfWeek } from "date-fns";
import type { Locale } from "date-fns";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { layoutTimedEvents } from "../core/event-layout";
import { eventIntersectsDay } from "../core/events";
import { parseTimeToMinutes } from "../core/date";
import type { BusinessHoursInput, BuiltInViewType, CalendarEvent } from "../types";
import type { DragState } from "../hooks/useDrag";
import type { ResizeState } from "../hooks/useResize";
import type { SelectionState } from "../hooks/useSelection";

interface TimeGridViewProps {
  date: Date;
  events: CalendarEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  view: Extract<BuiltInViewType, "timeGridWeek" | "timeGridDay">;
  nowIndicator: boolean;
  navLinks: boolean;
  businessHours?: BusinessHoursInput[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onNavLinkClick?: (date: Date) => void;
  editable?: boolean;
  selectable?: boolean;
  dragState?: DragState | null;
  resizeState?: ResizeState | null;
  selectionState?: SelectionState | null;
  onDragStart?: (e: React.PointerEvent, event: CalendarEvent, container: HTMLElement) => void;
  onResizeStart?: (e: React.PointerEvent, event: CalendarEvent, container: HTMLElement) => void;
  onSelectionStart?: (e: React.PointerEvent, day: Date, container: HTMLElement) => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function buildBusinessHourBlocks(day: Date, rules: BusinessHoursInput[]): Array<{ top: number; height: number }> {
  const dayOfWeek = day.getDay();
  return rules
    .filter((rule) => rule.daysOfWeek.includes(dayOfWeek))
    .map((rule) => {
      const start = parseTimeToMinutes(rule.startTime);
      const end = parseTimeToMinutes(rule.endTime);
      return { top: (start / (24 * 60)) * 100, height: ((end - start) / (24 * 60)) * 100 };
    })
    .filter((block) => block.height > 0);
}

export function TimeGridView({
  date,
  events,
  locale,
  weekStartsOn,
  view,
  nowIndicator,
  navLinks,
  businessHours = [],
  onDateClick,
  onEventClick,
  onNavLinkClick,
  editable = false,
  selectable = false,
  dragState,
  resizeState,
  selectionState,
  onDragStart,
  onResizeStart,
  onSelectionStart
}: TimeGridViewProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!nowIndicator) {
      return undefined;
    }

    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [nowIndicator]);

  const days = useMemo(() => {
    if (view === "timeGridDay") {
      return [startOfDay(date)];
    }
    const weekStart = startOfWeek(date, { weekStartsOn });
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [date, view, weekStartsOn]);

  return (
    <section className="oc-timegrid" style={{ "--oc-columns": String(days.length) } as CSSProperties}>
      <div className="oc-timegrid__header">
        <div className="oc-timegrid__gutter" />
        {days.map((day) => {
          const label = format(day, "EEE d", { locale });
          const isCurrentDay = isToday(day);
          return navLinks ? (
            <button
              key={day.toISOString()}
              type="button"
              className={`oc-timegrid__day-label oc-link-reset ${isCurrentDay ? "oc-timegrid__day-label--today" : ""}`}
              onClick={() => onNavLinkClick?.(day)}
            >
              {label}
            </button>
          ) : (
            <span
              key={day.toISOString()}
              className={`oc-timegrid__day-label ${isCurrentDay ? "oc-timegrid__day-label--today" : ""}`}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="oc-timegrid__allday">
        <div className="oc-timegrid__gutter-label">All-day</div>
        {days.map((day) => {
          const allDayEvents = events.filter((event) => eventIntersectsDay(event, day) && event.allDay);
          return (
            <div key={day.toISOString()} className="oc-timegrid__allday-cell">
              {allDayEvents.slice(0, 2).map((event) => (
                <button
                  key={`${event.id}-${event.start.toISOString()}`}
                  type="button"
                  className={`oc-event-chip ${event.className ?? ""}`}
                  style={{ backgroundColor: event.color }}
                  onClick={() => onEventClick?.(event)}
                >
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="oc-timegrid__body">
        <div className="oc-timegrid__times">
          {HOURS.map((hour) => (
            <div key={hour} className="oc-timegrid__time-label">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="oc-timegrid__columns">
          {days.map((day) => {
            const timedLayouts = layoutTimedEvents(events, day);
            const backgroundEvents = events.filter(
              (event) => event.display === "background" && eventIntersectsDay(event, day)
            );
            const businessBlocks = buildBusinessHourBlocks(day, businessHours);

            return (
              <div
                key={day.toISOString()}
                className="oc-timegrid__column"
                onClick={(clickEvent) => {
                  if (selectable) return;
                  const rect = clickEvent.currentTarget.getBoundingClientRect();
                  const relativeY = Math.min(Math.max(clickEvent.clientY - rect.top, 0), rect.height);
                  const minutes = Math.floor((relativeY / rect.height) * 24 * 60);
                  onDateClick?.(addMinutes(startOfDay(day), minutes));
                }}
                onPointerDown={(e) => {
                  if (selectable && onSelectionStart) {
                    onSelectionStart(e, day, e.currentTarget);
                  }
                }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="oc-timegrid__hour-line"
                    style={{ top: `${(hour / 24) * 100}%` }}
                  />
                ))}

                {businessBlocks.map((block, index) => (
                  <div
                    key={`bh-${day.toISOString()}-${index}`}
                    className="oc-timegrid__business-hours"
                    style={{ top: `${block.top}%`, height: `${block.height}%` }}
                  />
                ))}

                {backgroundEvents.map((event) => {
                  const start = event.start < startOfDay(day) ? 0 : event.start.getHours() * 60 + event.start.getMinutes();
                  const end = event.end > addMinutes(startOfDay(day), 24 * 60)
                    ? 24 * 60
                    : event.end.getHours() * 60 + event.end.getMinutes();

                  return (
                    <div
                      key={`bg-${event.id}-${event.start.toISOString()}`}
                      className="oc-timegrid__background-event"
                      style={{
                        top: `${(start / (24 * 60)) * 100}%`,
                        height: `${((end - start) / (24 * 60)) * 100}%`
                      }}
                    />
                  );
                })}

                {selectionState && !selectionState.allDay ? (() => {
                  const selStart = (selectionState.start.getHours() * 60 + selectionState.start.getMinutes()) / (24 * 60) * 100;
                  const selEnd = (selectionState.end.getHours() * 60 + selectionState.end.getMinutes()) / (24 * 60) * 100;
                  return (
                    <div
                      className="oc-timegrid__selection"
                      style={{ top: `${selStart}%`, height: `${selEnd - selStart}%` }}
                    />
                  );
                })() : null}

                {timedLayouts.map((layout) => {
                  const isDragging = dragState?.event.id === layout.event.id;
                  const isResizing = resizeState?.event.id === layout.event.id;
                  let top = layout.top;
                  let eventHeight = layout.height;

                  if (isDragging && dragState) {
                    const mins = dragState.currentStart.getHours() * 60 + dragState.currentStart.getMinutes();
                    top = (mins / (24 * 60)) * 100;
                  }

                  if (isResizing && resizeState) {
                    const startMins = layout.event.start.getHours() * 60 + layout.event.start.getMinutes();
                    const endMins = resizeState.currentEnd.getHours() * 60 + resizeState.currentEnd.getMinutes();
                    eventHeight = ((endMins - startMins) / (24 * 60)) * 100;
                  }

                  return (
                    <button
                      key={`${layout.event.id}-${layout.event.start.toISOString()}`}
                      type="button"
                      className={`oc-timegrid__event ${layout.event.className ?? ""} ${isDragging ? "oc-timegrid__event--dragging" : ""} ${isResizing ? "oc-timegrid__event--resizing" : ""}`}
                      style={{
                        top: `${top}%`,
                        left: `calc(${layout.left}% + 2px)`,
                        width: `calc(${layout.width}% - 4px)`,
                        height: `${eventHeight}%`,
                        backgroundColor: layout.event.color
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEventClick?.(layout.event);
                      }}
                      onPointerDown={(e) => {
                        if (editable && onDragStart) {
                          onDragStart(e, layout.event, e.currentTarget.parentElement!);
                        }
                      }}
                    >
                      <span className="oc-timegrid__event-title">{layout.event.title}</span>
                      <span className="oc-timegrid__event-time">
                        {format(layout.event.start, "HH:mm")} - {format(layout.event.end, "HH:mm")}
                      </span>
                      {editable && onResizeStart ? (
                        <div
                          className="oc-timegrid__resize-handle"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeStart(e, layout.event, e.currentTarget.parentElement!.parentElement!);
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}

                {nowIndicator && isToday(day) ? (
                  <div
                    className="oc-timegrid__now"
                    style={{ top: `${((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100}%` }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
