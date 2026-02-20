import { format, isToday, isSameMonth, startOfMonth, startOfWeek, addDays, addMonths } from "date-fns";
import type { Locale } from "date-fns";
import { eventIntersectsDay } from "../core/events";
import type { CalendarEvent, EventMouseInfo } from "../types";

interface MultiMonthViewProps {
  date: Date;
  events: CalendarEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  mode: "stack" | "grid";
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
}

function MiniMonth({
  monthDate,
  events,
  locale,
  weekStartsOn,
  onDateClick,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave
}: {
  monthDate: Date;
  events: CalendarEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMouseEnter?: (info: EventMouseInfo) => void;
  onEventMouseLeave?: (info: EventMouseInfo) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const firstCell = startOfWeek(monthStart, { weekStartsOn });
  const dayLabels = Array.from({ length: 7 }, (_, index) =>
    format(addDays(firstCell, index), "EEE", { locale })
  );
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(firstCell, index));

  return (
    <div className="oc-multi-month__month">
      <div className="oc-multi-month__title">{format(monthStart, "MMMM yyyy", { locale })}</div>

      <div className="oc-multi-month__header">
        {dayLabels.map((label, index) => (
          <div key={`${label}-${index}`} className="oc-multi-month__header-cell">
            {label}
          </div>
        ))}
      </div>

      <div className="oc-multi-month__grid">
        {monthDays.map((day) => {
          const dayEvents = events.filter((event) => eventIntersectsDay(event, day));
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={day.toISOString()}
              className={`oc-multi-month__cell ${isCurrentMonth ? "" : "oc-multi-month__cell--muted"} ${
                isToday(day) ? "oc-multi-month__cell--today" : ""
              }`}
              onClick={() => onDateClick?.(day)}
            >
              <span className="oc-multi-month__day">{format(day, "d")}</span>
              {dayEvents.length > 0 && (
                <span
                  className="oc-multi-month__dot"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(dayEvents[0]);
                  }}
                  onMouseEnter={(e) => onEventMouseEnter?.({ event: dayEvents[0], domEvent: e })}
                  onMouseLeave={(e) => onEventMouseLeave?.({ event: dayEvents[0], domEvent: e })}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MultiMonthView({
  date,
  events,
  locale,
  weekStartsOn,
  mode,
  onDateClick,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave
}: MultiMonthViewProps) {
  const base = startOfMonth(date);
  const months = Array.from({ length: 3 }, (_, i) => addMonths(base, i));

  return (
    <section className={`oc-multi-month oc-multi-month--${mode}`}>
      {months.map((monthDate) => (
        <MiniMonth
          key={monthDate.toISOString()}
          monthDate={monthDate}
          events={events}
          locale={locale}
          weekStartsOn={weekStartsOn}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
          onEventMouseEnter={onEventMouseEnter}
          onEventMouseLeave={onEventMouseLeave}
        />
      ))}
    </section>
  );
}
