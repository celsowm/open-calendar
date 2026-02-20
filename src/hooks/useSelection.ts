import { useCallback, useRef, useState } from "react";
import { addMinutes, startOfDay } from "date-fns";
import type { DateSelectInfo } from "../types";

export interface SelectionState {
  start: Date;
  end: Date;
  allDay: boolean;
}

interface UseSelectionOptions {
  enabled: boolean;
  onSelect?: (info: DateSelectInfo) => void;
}

export function useSelection({ enabled, onSelect }: UseSelectionOptions) {
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const anchorRef = useRef<Date | null>(null);

  const handleTimeGridSelectionStart = useCallback(
    (e: React.PointerEvent, day: Date, container: HTMLElement) => {
      if (!enabled) return;
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const relativeY = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
      const minutes = Math.round(((relativeY / rect.height) * 24 * 60) / 15) * 15;
      const anchor = addMinutes(startOfDay(day), minutes);
      anchorRef.current = anchor;

      setSelectionState({
        start: anchor,
        end: addMinutes(anchor, 30),
        allDay: false
      });

      const onMove = (moveEvent: PointerEvent) => {
        const newRelativeY = Math.min(Math.max(moveEvent.clientY - rect.top, 0), rect.height);
        const newMinutes = Math.round(((newRelativeY / rect.height) * 24 * 60) / 15) * 15;
        const current = addMinutes(startOfDay(day), newMinutes);

        if (anchorRef.current) {
          const start = current < anchorRef.current ? current : anchorRef.current;
          const end = current < anchorRef.current ? anchorRef.current : addMinutes(current, 15);
          setSelectionState({ start, end, allDay: false });
        }
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);

        setSelectionState((current) => {
          if (current) {
            onSelect?.({
              start: current.start,
              end: current.end,
              allDay: current.allDay
            });
          }
          return null;
        });
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [enabled, onSelect]
  );

  const handleDaySelection = useCallback(
    (day: Date) => {
      if (!enabled) return;
      if (!anchorRef.current) {
        anchorRef.current = startOfDay(day);
        setSelectionState({
          start: startOfDay(day),
          end: addMinutes(startOfDay(day), 24 * 60),
          allDay: true
        });
      } else {
        const anchor = anchorRef.current;
        const start = day < anchor ? startOfDay(day) : anchor;
        const end =
          day < anchor
            ? addMinutes(anchor, 24 * 60)
            : addMinutes(startOfDay(day), 24 * 60);

        onSelect?.({ start, end, allDay: true });
        setSelectionState(null);
        anchorRef.current = null;
      }
    },
    [enabled, onSelect]
  );

  const clearSelection = useCallback(() => {
    setSelectionState(null);
    anchorRef.current = null;
  }, []);

  return {
    selectionState,
    handleTimeGridSelectionStart,
    handleDaySelection,
    clearSelection
  };
}
