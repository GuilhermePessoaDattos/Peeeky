import { useRef, useCallback, useEffect } from "react";

interface TrackingConfig {
  apiKey?: string;
  endpoint?: string;
  viewerEmail?: string;
  onPageView?: (page: number, timeSpent: number) => void;
  onViewStart?: (viewId: string) => void;
  onViewEnd?: (totalDuration: number) => void;
}

export function useTracking(config: TrackingConfig) {
  const viewIdRef = useRef<string | null>(null);
  const pageStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());
  const currentPageRef = useRef<number>(1);

  const sendEvent = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!config.apiKey) return null;
      try {
        const res = await fetch(config.endpoint || "https://peeeky.com/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, _apiKey: config.apiKey }),
          keepalive: true,
        });
        if (res.ok) return res.json();
      } catch {
        // Silently fail — tracking should never break the viewer
      }
      return null;
    },
    [config.apiKey, config.endpoint]
  );

  const startView = useCallback(async () => {
    totalStartRef.current = Date.now();
    pageStartRef.current = Date.now();
    const data = await sendEvent({
      action: "view_start",
      viewerEmail: config.viewerEmail,
    });
    if (data?.viewId) {
      viewIdRef.current = data.viewId;
      config.onViewStart?.(data.viewId);
    }
  }, [sendEvent, config]);

  const trackPageChange = useCallback(
    async (newPage: number) => {
      const timeSpent = Math.round((Date.now() - pageStartRef.current) / 1000);
      const prevPage = currentPageRef.current;

      if (viewIdRef.current && timeSpent > 0) {
        await sendEvent({
          action: "page_view",
          viewId: viewIdRef.current,
          pageNumber: prevPage,
          duration: timeSpent,
        });
      }

      config.onPageView?.(prevPage, timeSpent);
      currentPageRef.current = newPage;
      pageStartRef.current = Date.now();
    },
    [sendEvent, config]
  );

  const endView = useCallback(async () => {
    await trackPageChange(currentPageRef.current);

    const totalDuration = Math.round((Date.now() - totalStartRef.current) / 1000);
    if (viewIdRef.current) {
      await sendEvent({
        action: "view_end",
        viewId: viewIdRef.current,
        duration: totalDuration,
      });
    }
    config.onViewEnd?.(totalDuration);
    viewIdRef.current = null;
  }, [sendEvent, trackPageChange, config]);

  useEffect(() => {
    startView();
    return () => {
      endView();
    };
  }, [startView, endView]);

  return { trackPageChange, viewId: viewIdRef };
}
