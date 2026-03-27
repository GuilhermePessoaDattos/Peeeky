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
  allowDownload?: boolean;
  viewerEmail?: string;
  enableAIChat?: boolean;
}

const MAX_CHAT_MESSAGES = 20;

export function ViewerClient({ signedUrl, documentName, linkId, totalPages, allowDownload, viewerEmail, enableAIChat }: ViewerClientProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const pageStartTime = useRef(Date.now());
  const totalDuration = useRef(0);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Start view tracking
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_start", linkId, viewerEmail }),
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
      // Don't navigate pages when typing in chat
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPage, nextPage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Send chat message
  const sendMessage = useCallback(async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    if (messages.length >= MAX_CHAT_MESSAGES) return;

    setChatInput("");
    const newMessages: { role: "user" | "assistant"; content: string }[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          question,
          conversationHistory: messages,
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages([...newMessages, { role: "assistant", content: data.answer }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.error || "Sorry, something went wrong." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Failed to connect. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, messages, linkId]);

  const userMessageCount = messages.filter(m => m.role === "user").length;

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
          {allowDownload && (
            <a href={signedUrl} download className="rounded px-2 py-1 text-xs text-white/60 hover:bg-white/10">
              &#11015; Download
            </a>
          )}
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
          href="https://peeeky.com?utm_source=viewer&utm_medium=badge&utm_campaign=viral"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/20 hover:text-white/40 transition"
        >
          Secured by Peeeky — Track your documents free &rarr;
        </a>
      </div>

      {/* AI Chat Widget */}
      {enableAIChat && (
        <>
          {/* Chat Toggle Button */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#6C5CE7] shadow-lg shadow-[#6C5CE7]/30 hover:bg-[#5A4BD1] transition-all hover:scale-105"
              aria-label="Open AI Chat"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}

          {/* Chat Panel */}
          {chatOpen && (
            <div className="fixed bottom-0 right-0 z-50 flex h-[500px] w-[380px] flex-col rounded-tl-2xl border-l border-t border-white/10 bg-[#16162A] shadow-2xl sm:bottom-4 sm:right-4 sm:rounded-2xl sm:border">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6C5CE7]/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white/90">Ask about this document</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
                  aria-label="Close chat"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#6C5CE7]/10">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <p className="text-sm text-white/50">Ask any question about this document</p>
                    <p className="mt-1 text-xs text-white/30">AI will answer based on the document content</p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#6C5CE7] text-white"
                          : "bg-white/8 text-white/85 border border-white/5"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/8 border border-white/5 px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-3 py-3">
                {userMessageCount >= MAX_CHAT_MESSAGES ? (
                  <p className="text-center text-xs text-white/40">Message limit reached ({MAX_CHAT_MESSAGES} questions)</p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question..."
                      maxLength={500}
                      disabled={chatLoading}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#6C5CE7]/50 focus:ring-1 focus:ring-[#6C5CE7]/30 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C5CE7] text-white hover:bg-[#5A4BD1] disabled:opacity-30 transition"
                      aria-label="Send message"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </form>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-white/20">Powered by AI</span>
                  <span className="text-[10px] text-white/20">{userMessageCount}/{MAX_CHAT_MESSAGES}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
