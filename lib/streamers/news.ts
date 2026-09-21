import { apiFetch } from "@/lib/api/client";
import type { StreamerNewsArticle } from "@/lib/streamers/types";

export const CATEGORY_ACCENT: Record<string, string> = {
  Deal: "#8874ff",
  Leaderboard: "#3ddc97",
  "Big Win": "#f5b83d",
  "Big Loss": "#f7575f",
  Drama: "#ff7ab6",
  Ban: "#ef4444",
  Milestone: "#38bdf8",
  Charity: "#34d399",
  Return: "#a78bfa",
  Rumor: "#94a3b8",
  Event: "#fb923c",
  Announcement: "#22d3ee",
  General: "#8874ff",
};

type StreamerNewsEnvelope = {
  status?: string;
  data?: { articles?: StreamerNewsArticle[] };
  articles?: StreamerNewsArticle[];
};

/**
 * Server only (RSC / Route Handlers). Uses `apiFetch` + `getApiUrl()`.
 * Client components must use `clientGetStreamerNews` from `@/lib/streamers/client-api`.
 */
export async function getStreamerNews(): Promise<StreamerNewsArticle[]> {
  try {
    const payload = await apiFetch<StreamerNewsEnvelope>("/api/streamer-news", {
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(5_000),
    });
    return payload.data?.articles ?? payload.articles ?? [];
  } catch {
    return [];
  }
}
