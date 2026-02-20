import { format, startOfDay } from "date-fns";
import type { Locale } from "date-fns";
import type { CalendarEvent, EventMouseInfo, Resource } from "../types";
import { flattenResources } from "../core/resources";

interface TimelineViewProps {
  date: Date;
  events: CalendarEvent[];
  resources: Resource[];
  locale?: Locale;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const TOTAL_MINUTES = 24 * 60;

function getDepth(resource: Resource, all: Resource[], resources: Resource[]): number {
  for (const r of resources) {
    if (r === resource) return 0;
    if (r.children) {
      const childDepth = getDepth(resource, all, r.children);
      if (childDepth >= 0) return childDepth + 1;
    }
  }
  return -1;
}

export function TimelineView({
  date,
  events,
  resources,
  locale,
  onDateClick,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave
}: TimelineViewProps) {
  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart.getTime() + TOTAL_MINUTES * 60_000);
  const flat = flattenResources(resources);

  return (
    <section className="oc-timeline">
      <div className="oc-timeline__header" style={{ display: "flex" }}>
        <div className="oc-timeline__sidebar-header" style={{ width: 150, flexShrink: 0 }} />
        <div className="oc-timeline__hours" style={{ display: "flex", flex: 1 }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="oc-timeline__hour-header"
              style={{ flex: 1, textAlign: "center" }}
            >
              {format(new Date(dayStart.getTime() + hour * 60 * 60_000), "HH':00'", { locale })}
            </div>
          ))}
        </div>
      </div>

      <div className="oc-timeline__body">
        {flat.map((resource) => {
          const depth = getDepth(resource, flat, resources);
          const resourceEvents = events.filter(
            (event) => event.resourceId === resource.id && !event.allDay && event.display !== "background"
          );

          return (
            <div key={resource.id} className="oc-timeline__row" style={{ display: "flex", height: 48 }}>
              <div
                className="oc-timeline__resource-label"
                style={{ width: 150, flexShrink: 0, paddingLeft: depth * 16 }}
              >
                {resource.title}
              </div>
              <div
                className="oc-timeline__lane"
                style={{ flex: 1, position: "relative" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                  const minutes = Math.floor(ratio * TOTAL_MINUTES);
                  onDateClick?.(new Date(dayStart.getTime() + minutes * 60_000));
                }}
              >
                {resourceEvents.map((event) => {
                  const startMinutes = Math.max(
                    (event.start.getTime() - dayStart.getTime()) / 60_000,
                    0
                  );
                  const endMinutes = Math.min(
                    (event.end.getTime() - dayStart.getTime()) / 60_000,
                    TOTAL_MINUTES
                  );

                  if (endMinutes <= startMinutes) return null;

                  const left = (startMinutes / TOTAL_MINUTES) * 100;
                  const width = ((endMinutes - startMinutes) / TOTAL_MINUTES) * 100;

                  return (
                    <button
                      key={`${event.id}-${event.start.toISOString()}`}
                      type="button"
                      className={`oc-timeline__event ${event.className ?? ""}`}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 4,
                        bottom: 4,
                        backgroundColor: event.color
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      onMouseEnter={(e) => onEventMouseEnter?.({ event, domEvent: e })}
                      onMouseLeave={(e) => onEventMouseLeave?.({ event, domEvent: e })}
                    >
                      {event.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
