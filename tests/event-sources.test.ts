import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createHttpSource,
  createFunctionSource,
  createJsonFeedSource,
  createStaticSource,
  fetchFromSource,
  fetchFromSources,
  clearCache
} from "../src/core/event-sources";
import type { CalendarEventInput, EventSourceFetchParams } from "../src/types";

// Mock fetch for HTTP tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Event Sources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache();
  });

  describe("createHttpSource", () => {
    it("creates an HTTP event source with config", () => {
      const source = createHttpSource({
        url: "https://api.example.com/events"
      });

      expect(source.type).toBe("http");
      if (source.type === "http") {
        expect(source.config.url).toBe("https://api.example.com/events");
      }
    });

    it("supports URL as a function", () => {
      const source = createHttpSource({
        url: (params: EventSourceFetchParams) => 
          `https://api.example.com/events?start=${params.start.toISOString()}&end=${params.end.toISOString()}`
      });

      expect(source.type).toBe("http");
      if (source.type === "http") {
        expect(typeof source.config.url).toBe("function");
      }
    });
  });

  describe("createFunctionSource", () => {
    it("creates a function event source", () => {
      const source = createFunctionSource({
        events: () => [{ id: "1", title: "Test", start: new Date() }]
      });

      expect(source.type).toBe("function");
      if (source.type === "function") {
        expect(typeof source.config.events).toBe("function");
      }
    });
  });

  describe("createJsonFeedSource", () => {
    it("creates a JSON feed event source", () => {
      const source = createJsonFeedSource({
        url: "https://api.example.com/events.json"
      });

      expect(source.type).toBe("jsonFeed");
      if (source.type === "jsonFeed") {
        expect(source.config.url).toBe("https://api.example.com/events.json");
      }
    });
  });

  describe("createStaticSource", () => {
    it("creates a static event source with events", () => {
      const events: CalendarEventInput[] = [
        { id: "1", title: "Event 1", start: new Date("2024-01-15") },
        { id: "2", title: "Event 2", start: new Date("2024-01-16") }
      ];

      const source = createStaticSource(events);

      expect(source.type).toBe("static");
      if (source.type === "static") {
        expect(source.events).toHaveLength(2);
        expect(source.events[0].title).toBe("Event 1");
      }
    });
  });

  describe("fetchFromSource", () => {
    it("fetches events from static source", async () => {
      const events: CalendarEventInput[] = [
        { id: "1", title: "Static Event", start: new Date("2024-01-15") }
      ];

      const source = createStaticSource(events);
      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSource(source, params);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Static Event");
    });

    it("fetches events from function source synchronously", async () => {
      const events: CalendarEventInput[] = [
        { id: "1", title: "Function Event", start: new Date("2024-01-15") }
      ];

      const source = createFunctionSource({
        events: () => events
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSource(source, params);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Function Event");
    });

    it("fetches events from function source asynchronously", async () => {
      const events: CalendarEventInput[] = [
        { id: "1", title: "Async Event", start: new Date("2024-01-15") }
      ];

      const source = createFunctionSource({
        events: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return events;
        }
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSource(source, params);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Async Event");
    });

    it("fetches events from HTTP source", async () => {
      const mockEvents = [
        { id: "1", title: "HTTP Event", start: "2024-01-15T10:00:00Z" }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents
      });

      const source = createHttpSource({
        url: "https://api.example.com/events"
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSource(source, params);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/events",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("HTTP Event");
    });

    it("uses eventDataTransform to transform HTTP response", async () => {
      const mockResponse = {
        data: {
          items: [
            { eventId: "1", name: "Transformed Event", startDate: "2024-01-15T10:00:00Z" }
          ]
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const source = createHttpSource({
        url: "https://api.example.com/events",
        eventDataTransform: (data: unknown) => {
          const response = data as { data: { items: Array<{ eventId: string; name: string; startDate: string }> } };
          return response.data.items.map(item => ({
            id: item.eventId,
            title: item.name,
            start: item.startDate
          }));
        }
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSource(source, params);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Transformed Event");
    });

    it("throws error when HTTP request fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const source = createHttpSource({
        url: "https://api.example.com/not-found"
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      await expect(fetchFromSource(source, params)).rejects.toThrow("HTTP error! status: 404");
    });
  });

  describe("fetchFromSources", () => {
    it("fetches and merges events from multiple sources", async () => {
      const staticEvents: CalendarEventInput[] = [
        { id: "1", title: "Static Event", start: new Date("2024-01-15") }
      ];

      const sources = [
        createStaticSource(staticEvents),
        createFunctionSource({
          events: () => [
            { id: "2", title: "Function Event", start: new Date("2024-01-16") }
          ]
        })
      ];

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      const result = await fetchFromSources(sources, params);

      expect(result).toHaveLength(2);
      expect(result.find(e => e.title === "Static Event")).toBeDefined();
      expect(result.find(e => e.title === "Function Event")).toBeDefined();
    });
  });

  describe("Caching", () => {
    it("caches function source results by default", async () => {
      let callCount = 0;

      const source = createFunctionSource({
        events: () => {
          callCount++;
          return [{ id: "1", title: "Cached Event", start: new Date("2024-01-15") }];
        }
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      // First call
      await fetchFromSource(source, params);
      expect(callCount).toBe(1);

      // Second call with same params should use cache
      await fetchFromSource(source, params);
      expect(callCount).toBe(1); // Still 1, not called again
    });

    it("clears cache when clearCache is called", async () => {
      let callCount = 0;

      const source = createFunctionSource({
        events: () => {
          callCount++;
          return [{ id: "1", title: "Event", start: new Date("2024-01-15") }];
        }
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      // First call
      await fetchFromSource(source, params);
      expect(callCount).toBe(1);

      // Clear cache
      clearCache();

      // Second call should not use cache
      await fetchFromSource(source, params);
      expect(callCount).toBe(2);
    });

    it("respects cache: false option", async () => {
      let callCount = 0;

      const source = createFunctionSource({
        events: () => {
          callCount++;
          return [{ id: "1", title: "Non-Cached Event", start: new Date("2024-01-15") }];
        },
        cache: false
      });

      const params: EventSourceFetchParams = {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-31")
      };

      // First call
      await fetchFromSource(source, params);
      expect(callCount).toBe(1);

      // Second call should fetch again since cache is disabled
      await fetchFromSource(source, params);
      expect(callCount).toBe(2);
    });
  });
});