import { useCallback, useRef, useState } from "react";
import { addMinutes, startOfDay } from "date-fns";
import type { CalendarEvent, EventDropInfo } from "../types";

export interface DragState {
  event: CalendarEvent;
  originalStart: Date;
  originalEnd: Date;
  currentStart: Date;
  currentEnd: Date;
}

interface UseDragOptions {
  enabled: boolean;
  onEventDrop?: (info: EventDropInfo) => void;
}

export function useDrag({ enabled, onEventDrop }: UseDragOptions) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const startY = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, event: CalendarEvent, container: HTMLElement) => {
      if (!enabled) return;
      e.stopPropagation();
      e.preventDefault();
      startY.current = e.clientY;
      containerRef.current = container;
      const duration = event.end.getTime() - event.start.getTime();

      setDragState({
        event,
        originalStart: event.start,
        originalEnd: event.end,
        currentStart: event.start,
        currentEnd: event.end
      });

      const onMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const deltaY = moveEvent.clientY - startY.current;
        const deltaMinutes = Math.round((deltaY / rect.height) * 24 * 60 / 15) * 15;
        const newStart = addMinutes(event.start, deltaMinutes);
        const newEnd = new Date(newStart.getTime() + duration);

        setDragState((prev) =>
          prev ? { ...prev, currentStart: newStart, currentEnd: newEnd } : null
        );
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        setDragState((current) => {
          if (current && current.currentStart.getTime() !== current.originalStart.getTime()) {
            onEventDrop?.({
              event: current.event,
              oldStart: current.originalStart,
              oldEnd: current.originalEnd,
              newStart: current.currentStart,
              newEnd: current.currentEnd,
              revert: () => {}
            });
          }
          return null;
        });
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [enabled, onEventDrop]
  );

  const handleMonthDragStart = useCallback(
    (e: React.PointerEvent, event: CalendarEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      startY.current = e.clientY;

      setDragState({
        event,
        originalStart: event.start,
        originalEnd: event.end,
        currentStart: event.start,
        currentEnd: event.end
      });

      const onUp = () => {
        document.removeEventListener("pointerup", onUp);
        setDragState(null);
      };

      document.addEventListener("pointerup", onUp);
    },
    [enabled]
  );

  return { dragState, handlePointerDown, handleMonthDragStart };
}
