import { addMinutes, format, isToday, startOfDay } from "date-fns";
import type { Locale } from "date-fns";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { layoutTimedEvents } from "../core/event-layout";
import { flattenResources } from "../core/resources";
import { eventIntersectsDay } from "../core/events";
import { parseTimeToMinutes } from "../core/date";
import type { BusinessHoursInput, CalendarEvent, EventMouseInfo, Resource } from "../types";

interface ResourceTimeGridViewProps {
  date: Date;
  events: CalendarEvent[];
  resources: Resource[];
  locale?: Locale;
  nowIndicator: boolean;
  businessHours?: BusinessHoursInput[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
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

export function ResourceTimeGridView({
  date,
  events,
  resources,
  locale,
  nowIndicator,
  businessHours = [],
  onDateClick,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave
}: ResourceTimeGridViewProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!nowIndicator) {
      return undefined;
    }

    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [nowIndicator]);

  const day = useMemo(() => startOfDay(date), [date]);
  const flatResources = useMemo(() => flattenResources(resources), [resources]);
  const businessBlocks = useMemo(() => buildBusinessHourBlocks(day, businessHours), [day, businessHours]);
  const isCurrent = isToday(day);

  return (
    <section className="oc-resource-grid" style={{ "--oc-columns": String(flatResources.length) } as CSSProperties}>
      <div className="oc-resource-grid__header">
        <div className="oc-resource-grid__gutter" />
        {flatResources.map((resource) => (
          <span key={resource.id} className="oc-resource-grid__resource-label">
            {resource.title}
          </span>
        ))}
      </div>

      <div className="oc-resource-grid__body">
        <div className="oc-resource-grid__times">
          {HOURS.map((hour) => (
            <div key={hour} className="oc-resource-grid__time-label">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="oc-resource-grid__columns">
          {flatResources.map((resource) => {
            const resourceEvents = events.filter((event) => event.resourceId === resource.id);
            const timedLayouts = layoutTimedEvents(resourceEvents, day);
            const backgroundEvents = resourceEvents.filter(
              (event) => event.display === "background" && eventIntersectsDay(event, day)
            );

            return (
              <div
                key={resource.id}
                className="oc-resource-grid__column"
                onClick={(clickEvent) => {
                  const rect = clickEvent.currentTarget.getBoundingClientRect();
                  const relativeY = Math.min(Math.max(clickEvent.clientY - rect.top, 0), rect.height);
                  const minutes = Math.floor((relativeY / rect.height) * 24 * 60);
                  onDateClick?.(addMinutes(day, minutes));
                }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={`${resource.id}-${hour}`}
                    className="oc-resource-grid__hour-line"
                    style={{ top: `${(hour / 24) * 100}%` }}
                  />
                ))}

                {businessBlocks.map((block, index) => (
                  <div
                    key={`bh-${resource.id}-${index}`}
                    className="oc-resource-grid__business-hours"
                    style={{ top: `${block.top}%`, height: `${block.height}%` }}
                  />
                ))}

                {backgroundEvents.map((event) => {
                  const start = event.start < day ? 0 : event.start.getHours() * 60 + event.start.getMinutes();
                  const end = event.end > addMinutes(day, 24 * 60)
                    ? 24 * 60
                    : event.end.getHours() * 60 + event.end.getMinutes();

                  return (
                    <div
                      key={`bg-${event.id}-${event.start.toISOString()}`}
                      className="oc-resource-grid__background-event"
                      style={{
                        top: `${(start / (24 * 60)) * 100}%`,
                        height: `${((end - start) / (24 * 60)) * 100}%`
                      }}
                    />
                  );
                })}

                {timedLayouts.map((layout) => (
                  <button
                    key={`${layout.event.id}-${layout.event.start.toISOString()}`}
                    type="button"
                    className={`oc-resource-grid__event ${layout.event.className ?? ""}`}
                    style={{
                      top: `${layout.top}%`,
                      left: `calc(${layout.left}% + 2px)`,
                      width: `calc(${layout.width}% - 4px)`,
                      height: `${layout.height}%`,
                      backgroundColor: layout.event.color
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEventClick?.(layout.event);
                    }}
                    onMouseEnter={(e) => onEventMouseEnter?.({ event: layout.event, domEvent: e })}
                    onMouseLeave={(e) => onEventMouseLeave?.({ event: layout.event, domEvent: e })}
                  >
                    <span className="oc-resource-grid__event-title">{layout.event.title}</span>
                    <span className="oc-resource-grid__event-time">
                      {format(layout.event.start, "HH:mm")} - {format(layout.event.end, "HH:mm")}
                    </span>
                  </button>
                ))}

                {nowIndicator && isCurrent ? (
                  <div
                    className="oc-resource-grid__now"
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
