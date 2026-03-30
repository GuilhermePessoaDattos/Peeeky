import { describe, it, expect, beforeEach, vi } from "vitest";
import { Peeeky } from "../index";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Peeeky SDK", () => {
  beforeEach(() => {
    Peeeky.reset();
    mockFetch.mockReset();
  });

  describe("init", () => {
    it("throws without apiKey", () => {
      expect(() => Peeeky.init({ apiKey: "" })).toThrow("apiKey is required");
    });

    it("initializes with defaults", () => {
      Peeeky.init({ apiKey: "pk_test_123" });
    });
  });

  describe("track", () => {
    it("warns if not initialized", async () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const result = await Peeeky.track({ documentId: "doc_1" });
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledWith("Peeeky: call Peeeky.init() before tracking");
      spy.mockRestore();
    });

    it("sends track request", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_1" }),
      });

      const result = await Peeeky.track({
        documentId: "doc_1",
        action: "view_start",
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(result).toEqual({ viewId: "v_1" });
    });

    it("stores viewId from view_start", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_123" }),
      });

      await Peeeky.track({ documentId: "doc_1", action: "view_start" });
      expect(Peeeky.getViewId()).toBe("v_123");
    });

    it("handles fetch errors gracefully", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await Peeeky.track({ documentId: "doc_1" });
      expect(result).toBeNull();
    });
  });

  describe("startView / endView", () => {
    it("starts and ends a view session", async () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ viewId: "v_456" }),
      });

      const viewId = await Peeeky.startView("doc_1", "user@test.com");
      expect(viewId).toBe("v_456");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      });

      await Peeeky.endView("doc_1", 120);
      expect(Peeeky.getViewId()).toBeNull();
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      Peeeky.init({ apiKey: "pk_test_123" });
      Peeeky.reset();
      expect(Peeeky.getViewId()).toBeNull();
    });
  });
});
