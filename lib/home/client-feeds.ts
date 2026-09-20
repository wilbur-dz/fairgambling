"use client";

import { getPublicApiUrl } from "@/lib/api/config";
import type { DepositFeedRow, LiveBetRow } from "@/lib/home/data";
import {
  normalizeDepositFeed,
  normalizeLiveBets,
} from "@/lib/home/normalize";

async function fetchJson(path: string): Promise<unknown> {
  if (!path.startsWith("/")) {
    throw new Error(`path must start with "/": ${path}`);
  }
  const response = await fetch(`${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }
  return response.json();
}

/** Client refresh for Live Bets tab. */
export async function fetchLiveBetsClient(
  limit = 20,
): Promise<LiveBetRow[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const params = new URLSearchParams({
    type: "bets",
    limit: String(safeLimit),
  });
  const payload = await fetchJson(`/api/analytics/feed-recent?${params}`);
  return normalizeLiveBets(payload).slice(0, safeLimit);
}

/** Client refresh for Deposit Feed tab. */
export async function fetchDepositsClient(
  limit = 20,
): Promise<DepositFeedRow[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const params = new URLSearchParams({
    type: "deposits",
    limit: String(safeLimit),
  });
  const payload = await fetchJson(`/api/analytics/feed-recent?${params}`);
  return normalizeDepositFeed(payload).slice(0, safeLimit);
}
