import type {
  CalendarEventInput,
  EventSource,
  EventSourceFetchParams,
  HttpEventSourceConfig,
  FunctionEventSourceConfig,
  JsonFeedEventSourceConfig
} from "../types";

/** Cache entry for storing fetched events */
interface CacheEntry {
  events: CalendarEventInput[];
  timestamp: number;
  rangeStart: Date;
  rangeEnd: Date;
}

/** Default cache duration: 10 minutes */
const DEFAULT_CACHE_DURATION = 10 * 60 * 1000;

/** Event sources cache */
const eventCache = new Map<string, CacheEntry>();

/** Generate a cache key for an event source */
function getCacheKey(source: EventSource, params: EventSourceFetchParams): string {
  const start = params.start.getTime();
  const end = params.end.getTime();
  
  switch (source.type) {
    case "http": {
      const url = typeof source.config.url === "function" 
        ? source.config.url(params) 
        : source.config.url;
      return `http:${url}:${start}:${end}`;
    }
    case "jsonFeed": {
      const url = typeof source.config.url === "function" 
        ? source.config.url(params) 
        : source.config.url;
      return `jsonFeed:${url}:${start}:${end}`;
    }
    case "function":
      return `function:${start}:${end}`;
    case "static":
      return `static:${start}:${end}`;
    default:
      return `${start}:${end}`;
  }
}

/** Check if a cache entry is still valid */
function isCacheValid(entry: CacheEntry, duration: number): boolean {
  return Date.now() - entry.timestamp < duration;
}

/** Check if cached range covers the requested range */
function rangeCoversCache(cachedStart: Date, cachedEnd: Date, requestedStart: Date, requestedEnd: Date): boolean {
  return cachedStart <= requestedStart && cachedEnd >= requestedEnd;
}

/** Clear the entire cache or cache for a specific source */
export function clearCache(sourceId?: string): void {
  if (sourceId) {
    // Clear cache entries matching the source ID prefix
    for (const key of eventCache.keys()) {
      if (key.startsWith(sourceId)) {
        eventCache.delete(key);
      }
    }
  } else {
    eventCache.clear();
  }
}

/** Fetch events from an HTTP source */
async function fetchHttpSource(
  config: HttpEventSourceConfig,
  params: EventSourceFetchParams
): Promise<CalendarEventInput[]> {
  const url = typeof config.url === "function" ? config.url(params) : config.url;
  const method = config.method ?? "GET";
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...config.headers
    },
    credentials: config.credentials
  };

  if (config.body && method !== "GET") {
    const body = typeof config.body === "function" ? config.body(params) : config.body;
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (config.eventDataTransform) {
    return config.eventDataTransform(data);
  }

  // Default: assume data is an array of events
  if (Array.isArray(data)) {
    return data as CalendarEventInput[];
  }

  // Try common response structures
  if (data.events && Array.isArray(data.events)) {
    return data.events as CalendarEventInput[];
  }

  if (data.data && Array.isArray(data.data)) {
    return data.data as CalendarEventInput[];
  }

  throw new Error("Unable to extract events from response. Please provide an eventDataTransform function.");
}

/** Fetch events from a JSON feed source */
async function fetchJsonFeedSource(
  config: JsonFeedEventSourceConfig,
  params: EventSourceFetchParams
): Promise<CalendarEventInput[]> {
  const url = typeof config.url === "function" ? config.url(params) : config.url;
  
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...config.headers
    },
    credentials: config.credentials
  };

  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (config.eventDataTransform) {
    return config.eventDataTransform(data);
  }

  // Default: assume data is an array of events
  if (Array.isArray(data)) {
    return data as CalendarEventInput[];
  }

  if (data.events && Array.isArray(data.events)) {
    return data.events as CalendarEventInput[];
  }

  if (data.data && Array.isArray(data.data)) {
    return data.data as CalendarEventInput[];
  }

  throw new Error("Unable to extract events from response. Please provide an eventDataTransform function.");
}

/** Fetch events from a function source */
async function fetchFunctionSource(
  config: FunctionEventSourceConfig,
  params: EventSourceFetchParams
): Promise<CalendarEventInput[]> {
  const result = config.events(params);
  
  if (result instanceof Promise) {
    return result;
  }
  
  return result;
}

/** Fetch events from a single source with caching */
export async function fetchFromSource(
  source: EventSource,
  params: EventSourceFetchParams
): Promise<CalendarEventInput[]> {
  // Handle static source - no caching needed
  if (source.type === "static") {
    return source.events;
  }

  // Determine cache settings based on source type
  let cacheEnabled = true;
  let cacheDuration = DEFAULT_CACHE_DURATION;
  let lazyEnabled = false;

  switch (source.type) {
    case "http":
      cacheEnabled = source.config.cache ?? true;
      cacheDuration = source.config.cacheDuration ?? DEFAULT_CACHE_DURATION;
      lazyEnabled = source.config.lazy ?? false;
      break;
    case "function":
      cacheEnabled = source.config.cache ?? true;
      cacheDuration = source.config.cacheDuration ?? DEFAULT_CACHE_DURATION;
      lazyEnabled = source.config.lazy ?? false;
      break;
    case "jsonFeed":
      cacheEnabled = source.config.cache ?? true;
      cacheDuration = source.config.cacheDuration ?? DEFAULT_CACHE_DURATION;
      lazyEnabled = source.config.lazy ?? false;
      break;
  }

  const cacheKey = getCacheKey(source, params);

  // Check cache if enabled
  if (cacheEnabled) {
    const cached = eventCache.get(cacheKey);
    if (cached && isCacheValid(cached, cacheDuration)) {
      // Check if the cached range covers our requested range
      if (rangeCoversCache(cached.rangeStart, cached.rangeEnd, params.start, params.end)) {
        return cached.events;
      }
    }
  }

  // Fetch from the appropriate source
  let events: CalendarEventInput[];
  
  switch (source.type) {
    case "http":
      events = await fetchHttpSource(source.config, params);
      break;
    case "function":
      events = await fetchFunctionSource(source.config, params);
      break;
    case "jsonFeed":
      events = await fetchJsonFeedSource(source.config, params);
      break;
    default:
      events = [];
  }

  // Store in cache if enabled
  if (cacheEnabled) {
    eventCache.set(cacheKey, {
      events,
      timestamp: Date.now(),
      rangeStart: params.start,
      rangeEnd: params.end
    });
  }

  return events;
}

/** Fetch events from multiple sources */
export async function fetchFromSources(
  sources: EventSource[],
  params: EventSourceFetchParams
): Promise<CalendarEventInput[]> {
  const results = await Promise.all(
    sources.map(source => fetchFromSource(source, params))
  );
  
  // Flatten all events from all sources
  return results.flat();
}

/** Create an HTTP event source */
export function createHttpSource(config: HttpEventSourceConfig): EventSource {
  return { type: "http", config };
}

/** Create a function event source */
export function createFunctionSource(config: FunctionEventSourceConfig): EventSource {
  return { type: "function", config };
}

/** Create a JSON feed event source */
export function createJsonFeedSource(config: JsonFeedEventSourceConfig): EventSource {
  return { type: "jsonFeed", config };
}

/** Create a static event source */
export function createStaticSource(events: CalendarEventInput[]): EventSource {
  return { type: "static", events };
}

/** Hook for managing event sources in React components */
export interface UseEventSourcesOptions {
  sources: EventSource[];
  initialEvents?: CalendarEventInput[];
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (error: Error) => void;
}

export interface UseEventSourcesResult {
  events: CalendarEventInput[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}