import { useCallback, useRef, useState } from "react";
import { addMinutes } from "date-fns";
import type { CalendarEvent, EventResizeInfo } from "../types";

export interface ResizeState {
  event: CalendarEvent;
  originalEnd: Date;
  currentEnd: Date;
}

interface UseResizeOptions {
  enabled: boolean;
  onEventResize?: (info: EventResizeInfo) => void;
}

export function useResize({ enabled, onEventResize }: UseResizeOptions) {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const startY = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, event: CalendarEvent, container: HTMLElement) => {
      if (!enabled) return;
      e.stopPropagation();
      e.preventDefault();
      startY.current = e.clientY;
      containerRef.current = container;

      setResizeState({
        event,
        originalEnd: event.end,
        currentEnd: event.end
      });

      const onMove = (moveEvent: PointerEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const deltaY = moveEvent.clientY - startY.current;
        const deltaMinutes = Math.round((deltaY / rect.height) * 24 * 60 / 15) * 15;
        const newEnd = addMinutes(event.end, deltaMinutes);

        if (newEnd.getTime() > event.start.getTime() + 15 * 60 * 1000) {
          setResizeState((prev) => (prev ? { ...prev, currentEnd: newEnd } : null));
        }
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        setResizeState((current) => {
          if (current && current.currentEnd.getTime() !== current.originalEnd.getTime()) {
            onEventResize?.({
              event: current.event,
              oldStart: current.event.start,
              oldEnd: current.originalEnd,
              newStart: current.event.start,
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
    [enabled, onEventResize]
  );

  return { resizeState, handleResizePointerDown };
}
