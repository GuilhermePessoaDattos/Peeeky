"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ViewerClientProps {
  signedUrl: string;
  documentName: string;
  linkId: string;
  totalPages: number;
}

export function ViewerClient({ signedUrl, documentName, linkId, totalPages }: ViewerClientProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const pageStartTime = useRef(Date.now());
  const totalDuration = useRef(0);

  // Start view tracking
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_start", linkId }),
    })
      .then((r) => r.json())
      .then((data) => setViewId(data.viewId))
      .catch(console.error);
  }, [linkId]);

  // Track page view on page change
  const trackPageView = useCallback(
    (page: number, duration: number) => {
      if (!viewId) return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "page_view",
          viewId,
          pageNumber: page,
          duration: Math.round(duration / 1000),
        }),
      }).catch(console.error);
    },
    [viewId]
  );

  // Track end on unmount
  useEffect(() => {
    const currentViewId = viewId;
    const currentNumPages = numPages;
    const currentPageRef = currentPage;
    return () => {
      if (!currentViewId) return;
      const data = JSON.stringify({
        action: "view_end",
        viewId: currentViewId,
        duration: Math.round(totalDuration.current / 1000),
        completionRate: currentNumPages > 0 ? currentPageRef / currentNumPages : 0,
      });
      navigator.sendBeacon("/api/track", data);
    };
  }, [viewId, numPages, currentPage]);

  const goToPage = useCallback((page: number) => {
    const duration = Date.now() - pageStartTime.current;
    totalDuration.current += duration;
    trackPageView(currentPage, duration);
    pageStartTime.current = Date.now();
    setCurrentPage(page);
  }, [currentPage, trackPageView]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const nextPage = useCallback(() => {
    if (currentPage < numPages) goToPage(currentPage + 1);
  }, [currentPage, numPages, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPage, nextPage]);

  return (
    <div className="flex min-h-screen flex-col bg-[#1A1A2E]">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <span className="text-sm font-medium text-white/80 truncate max-w-[200px]">
          {documentName}
        </span>
        <span className="text-sm text-white/50">
          {currentPage} / {numPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="rounded px-2 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            -
          </button>
          <span className="text-xs text-white/50">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="rounded px-2 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            +
          </button>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        <Document
          file={signedUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={
            <div className="text-white/50">Loading document...</div>
          }
          error={
            <div className="text-red-400">Failed to load document.</div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* Navigation */}
      <footer className="flex h-14 items-center justify-center gap-4 border-t border-white/10">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-30"
        >
          &larr; Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(numPages, 10) }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`h-2 w-2 rounded-full transition ${
                currentPage === i + 1 ? "bg-[#6C5CE7]" : "bg-white/20"
              }`}
            />
          ))}
          {numPages > 10 && <span className="text-xs text-white/30">...</span>}
        </div>
        <button
          onClick={nextPage}
          disabled={currentPage >= numPages}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-30"
        >
          Next &rarr;
        </button>
      </footer>

      {/* Badge */}
      <div className="flex justify-center pb-2">
        <a
          href="https://peeeky.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/20 hover:text-white/40 transition"
        >
          Secured by Peeeky
        </a>
      </div>
    </div>
  );
}
