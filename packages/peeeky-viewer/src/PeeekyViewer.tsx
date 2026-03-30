import { useState, useRef, useEffect, useCallback } from "react";
import { usePdf } from "./use-pdf";
import { useTracking } from "./use-tracking";
import type { PeeekyViewerProps } from "./types";

export function PeeekyViewer({
  src,
  apiKey,
  endpoint,
  viewerEmail,
  width = "100%",
  height = "600px",
  className = "",
  showToolbar = true,
  showPageNumbers = true,
  theme = "light",
  onPageView,
  onViewStart,
  onViewEnd,
  onError,
}: PeeekyViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { numPages, loading, error, renderPage } = usePdf(src);
  const { trackPageChange } = useTracking({
    apiKey,
    endpoint,
    viewerEmail,
    onPageView,
    onViewStart,
    onViewEnd,
  });

  useEffect(() => {
    if (error && onError) onError(error);
  }, [error, onError]);

  useEffect(() => {
    if (!loading && canvasRef.current && numPages > 0) {
      renderPage(currentPage, canvasRef.current, scale);
    }
  }, [currentPage, loading, numPages, scale, renderPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > numPages) return;
      trackPageChange(page);
      setCurrentPage(page);
    },
    [numPages, trackPageChange]
  );

  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#000000";
  const border = isDark ? "#333" : "#e5e7eb";

  if (loading) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <span style={{ color: fg }}>Loading document...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <span style={{ color: "#ef4444" }}>Failed to load document</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {showToolbar && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: `1px solid ${border}`,
            background: isDark ? "#222" : "#f9fafb",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{ padding: "4px 12px", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.4 : 1 }}
            >
              Prev
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              style={{ padding: "4px 12px", cursor: currentPage >= numPages ? "not-allowed" : "pointer", opacity: currentPage >= numPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
          {showPageNumbers && (
            <span style={{ color: fg, fontSize: "14px" }}>
              {currentPage} / {numPages}
            </span>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} style={{ padding: "4px 12px" }}>
              -
            </button>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} style={{ padding: "4px 12px" }}>
              +
            </button>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "16px" }}>
        <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />
      </div>
    </div>
  );
}
