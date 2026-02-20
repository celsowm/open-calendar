import { useCallback, useEffect, useRef, useState } from "react";
import { clearCache as clearSourcesCache, fetchFromSources } from "../core/event-sources";
import type { CalendarEventInput, EventSource, EventSourceFetchParams } from "../types";

export interface UseEventSourcesOptions {
  /** Event sources to fetch from */
  sources?: EventSource[];
  /** Static events to include (merged with source events) */
  initialEvents?: CalendarEventInput[];
  /** Called when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

export interface UseEventSourcesResult {
  /** All events (from sources + initial events) */
  events: CalendarEventInput[];
  /** Whether events are currently being fetched */
  isLoading: boolean;
  /** Any error that occurred during fetching */
  error: Error | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
  /** Clear the event sources cache */
  clearCache: () => void;
  /** Fetch events for a specific date range (used by Calendar component) */
  fetchForRange: (start: Date, end: Date) => Promise<void>;
}

/**
 * Hook for managing event sources with caching and lazy range fetching.
 * 
 * @example
 * ```tsx
 * const { events, isLoading, error } = useEventSources({
 *   sources: [
 *     createHttpSource({
 *       url: (params) => `/api/events?start=${params.start.toISOString()}&end=${params.end.toISOString()}`,
 *     })
 *   ],
 *   initialEvents: staticEvents,
 * });
 * ```
 */
export function useEventSources(options: UseEventSourcesOptions): UseEventSourcesResult {
  const { sources = [], initialEvents = [], onLoadingChange, onError } = options;

  const [events, setEvents] = useState<CalendarEventInput[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Track the current fetch to avoid race conditions
  const fetchIdRef = useRef(0);
  // Current range being displayed
  const currentRangeRef = useRef<{ start: Date; end: Date } | null>(null);

  // Update loading state and notify callback
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // Update error state and notify callback
  const handleError = useCallback((err: Error) => {
    setError(err);
    onError?.(err);
  }, [onError]);

  // Fetch events from sources for a given range
  const fetchEvents = useCallback(async (params: EventSourceFetchParams) => {
    // If no sources, just use initial events
    if (sources.length === 0) {
      setEvents(initialEvents);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const fetchedEvents = await fetchFromSources(sources, params);
      
      // Avoid race conditions - only update if this is the latest fetch
      if (currentFetchId === fetchIdRef.current) {
        setEvents([...initialEvents, ...fetchedEvents]);
        setLoading(false);
      }
    } catch (err) {
      if (currentFetchId === fetchIdRef.current) {
        handleError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }
  }, [sources, initialEvents, setLoading, handleError]);

  // Fetch events for a specific range (public API)
  const fetchForRange = useCallback(async (start: Date, end: Date) => {
    currentRangeRef.current = { start, end };
    await fetchEvents({ start, end });
  }, [fetchEvents]);

  // Refetch for the current range
  const refetch = useCallback(async () => {
    if (currentRangeRef.current) {
      await fetchEvents(currentRangeRef.current);
    }
  }, [fetchEvents]);

  // Clear cache
  const clearCache = useCallback(() => {
    clearSourcesCache();
  }, []);

  // Reset when sources or initialEvents change
  useEffect(() => {
    if (sources.length === 0) {
      setEvents(initialEvents);
    }
  }, [sources, initialEvents]);

  return {
    events,
    isLoading,
    error,
    refetch,
    clearCache,
    fetchForRange
  };
}
