"use client";

import type { StreamerNewsArticle } from "@/lib/streamers/types";

type StreamerNewsEnvelope = {
  status?: string;
  data?: { articles?: StreamerNewsArticle[] };
  articles?: StreamerNewsArticle[];
};

function parseStreamerNewsEnvelope(
  payload: unknown,
): StreamerNewsArticle[] {
  if (!payload || typeof payload !== "object") return [];
  const env = payload as StreamerNewsEnvelope;
  return env.data?.articles ?? env.articles ?? [];
}

/** Browser: same-origin `/api/streamer-news` (Next rewrite → API). */
export async function clientGetStreamerNews(
  signal?: AbortSignal,
): Promise<StreamerNewsArticle[]> {
  try {
    const res = await fetch("/api/streamer-news", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: signal ?? AbortSignal.timeout(5_000),
    });
    if (!res.ok) return [];
    const payload: unknown = await res.json();
    return parseStreamerNewsEnvelope(payload);
  } catch {
    return [];
  }
}
