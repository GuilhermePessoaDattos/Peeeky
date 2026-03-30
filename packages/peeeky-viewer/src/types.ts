export interface PeeekyViewerProps {
  src: string;
  apiKey?: string;
  endpoint?: string;
  viewerEmail?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  showToolbar?: boolean;
  showPageNumbers?: boolean;
  theme?: "light" | "dark";
  onPageView?: (page: number, timeSpent: number) => void;
  onViewStart?: (viewId: string) => void;
  onViewEnd?: (totalDuration: number) => void;
  onError?: (error: Error) => void;
}
