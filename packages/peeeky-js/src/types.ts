export interface PeeekyConfig {
  apiKey: string;
  endpoint?: string;
  debug?: boolean;
}

export interface TrackEvent {
  documentId: string;
  viewerEmail?: string;
  page?: number;
  duration?: number;
  action?: "view_start" | "page_view" | "view_end";
  metadata?: Record<string, string>;
}

export interface TrackResponse {
  viewId: string;
  isForwarded?: boolean;
}
