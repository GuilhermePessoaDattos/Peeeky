import type { PeeekyConfig, TrackEvent, TrackResponse } from "./types";

export type { PeeekyConfig, TrackEvent, TrackResponse };

const DEFAULT_ENDPOINT = "https://peeeky.com/api/track";

let _config: PeeekyConfig | null = null;
let _currentViewId: string | null = null;
let _pageStartTime: number | null = null;

export const Peeeky = {
  init(config: PeeekyConfig): void {
    if (!config.apiKey) {
      throw new Error("Peeeky: apiKey is required");
    }
    _config = {
      endpoint: DEFAULT_ENDPOINT,
      debug: false,
      ...config,
    };
    if (_config.debug) {
      console.log("[Peeeky] Initialized with endpoint:", _config.endpoint);
    }
  },

  async track(event: TrackEvent): Promise<TrackResponse | null> {
    if (!_config) {
      console.warn("Peeeky: call Peeeky.init() before tracking");
      return null;
    }

    const action = event.action || "page_view";
    const payload = {
      action,
      linkId: event.documentId,
      viewId: _currentViewId,
      pageNumber: event.page,
      duration: event.duration,
      viewerEmail: event.viewerEmail,
      metadata: event.metadata,
      _apiKey: _config.apiKey,
    };

    if (_config.debug) {
      console.log("[Peeeky] Track:", payload);
    }

    try {
      const res = await fetch(_config.endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (!res.ok) {
        if (_config.debug) console.error("[Peeeky] Track failed:", res.status);
        return null;
      }

      const data = await res.json();

      if (action === "view_start" && data.viewId) {
        _currentViewId = data.viewId;
      }

      return data;
    } catch (err) {
      if (_config.debug) console.error("[Peeeky] Track error:", err);
      return null;
    }
  },

  startPageTimer(): void {
    _pageStartTime = Date.now();
  },

  stopPageTimer(page: number): number {
    if (!_pageStartTime) return 0;
    const duration = Math.round((Date.now() - _pageStartTime) / 1000);
    _pageStartTime = null;
    this.track({ documentId: "", page, duration, action: "page_view" });
    return duration;
  },

  async startView(documentId: string, viewerEmail?: string): Promise<string | null> {
    const result = await this.track({
      documentId,
      viewerEmail,
      action: "view_start",
    });
    return result?.viewId || null;
  },

  async endView(documentId: string, duration: number): Promise<void> {
    await this.track({
      documentId,
      duration,
      action: "view_end",
    });
    _currentViewId = null;
  },

  getViewId(): string | null {
    return _currentViewId;
  },

  reset(): void {
    _config = null;
    _currentViewId = null;
    _pageStartTime = null;
  },
};

export default Peeeky;
