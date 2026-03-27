"use client";

interface PageData {
  page: number;
  avgDuration: number;
  totalDuration: number;
}

interface HeatmapProps {
  pages: PageData[];
  totalPages: number;
}

export function Heatmap({ pages, totalPages }: HeatmapProps) {
  const maxDuration = Math.max(...pages.map(p => p.avgDuration), 1);

  // Generate all pages (some might not have data)
  const allPages = Array.from({ length: totalPages }, (_, i) => {
    const pageData = pages.find(p => p.page === i + 1);
    return {
      page: i + 1,
      avgDuration: pageData?.avgDuration || 0,
      totalDuration: pageData?.totalDuration || 0,
    };
  });

  const getColor = (duration: number) => {
    const intensity = duration / maxDuration;
    if (intensity === 0) return "bg-gray-100";
    if (intensity < 0.3) return "bg-[#6C5CE7]/20";
    if (intensity < 0.6) return "bg-[#6C5CE7]/40";
    if (intensity < 0.8) return "bg-[#6C5CE7]/60";
    return "bg-[#6C5CE7]/80";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div>
      <h3 className="mb-4 font-display text-sm font-semibold text-[#1A1A2E]">
        Page Engagement Heatmap
      </h3>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {allPages.map((p) => (
          <div
            key={p.page}
            className={`group relative flex aspect-[3/4] flex-col items-center justify-center rounded-lg border border-gray-200 transition hover:scale-105 hover:shadow-md ${getColor(p.avgDuration)}`}
          >
            <span className="text-xs font-bold text-[#1A1A2E]/70">{p.page}</span>
            {p.avgDuration > 0 && (
              <span className="text-[10px] text-[#1A1A2E]/50">{formatTime(p.avgDuration)}</span>
            )}
            {/* Tooltip on hover */}
            <div className="absolute -top-12 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-[#1A1A2E] px-3 py-2 text-xs text-white shadow-lg group-hover:block whitespace-nowrap">
              <div>Page {p.page}</div>
              <div>Avg: {formatTime(p.avgDuration)}</div>
              <div>Total: {formatTime(p.totalDuration)}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <span>Less time</span>
        <div className="flex gap-1">
          <div className="h-3 w-6 rounded bg-gray-100" />
          <div className="h-3 w-6 rounded bg-[#6C5CE7]/20" />
          <div className="h-3 w-6 rounded bg-[#6C5CE7]/40" />
          <div className="h-3 w-6 rounded bg-[#6C5CE7]/60" />
          <div className="h-3 w-6 rounded bg-[#6C5CE7]/80" />
        </div>
        <span>More time</span>
      </div>
    </div>
  );
}
