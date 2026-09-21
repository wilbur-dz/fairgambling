import { apiFetch } from "@/lib/api/client";

export type StreamDetailSummary = {
  thumb_url?: string | null;
  vod_url?: string | null;
  title?: string | null;
  started_at?: string;
  ended_at?: string | null;
  peak_viewers?: number;
  avg_viewers?: number;
  hours_watched?: number;
  airtime_m?: number;
  followers_gain?: number;
  total_messages?: number;
  unique_chatters?: number;
  msgs_per_chatter?: number;
};

export type StreamDetailPoint = {
  t: string;
  viewers?: number;
  messages?: number;
  chatters?: number;
};

export type StreamDetailPayload = {
  summary?: StreamDetailSummary;
  series?: StreamDetailPoint[];
};

/** Port of reference `getStreamDetail` (module 845212). */
export async function getStreamDetail(
  slug: string,
  startedAt: string,
  bucket = 5,
): Promise<StreamDetailPayload | null> {
  try {
    const path = `/api/streamers/${encodeURIComponent(slug.trim().toLowerCase())}/stream?start=${encodeURIComponent(startedAt)}&bucket=${bucket}`;
    const payload = await apiFetch<StreamDetailPayload | { data?: StreamDetailPayload }>(
      path,
    );
    const data: StreamDetailPayload | undefined =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: StreamDetailPayload }).data
        : (payload as StreamDetailPayload);
    return data?.summary ? data : null;
  } catch {
    return null;
  }
}
