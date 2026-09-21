import { ApiError, apiFetch, handleResponse } from "@/lib/api/client";
import type { LeaderboardPayload } from "@/lib/leaderboard/data";
import {
  normalizeCurrentLeaderboard,
  normalizePastLeaderboard,
} from "@/lib/leaderboard/normalize";

/** Fixed page size for `/api/leaderboard/current`. */
export const LEADERBOARD_PAGE_SIZE = 20;

/** Client window cap (2 pages), matches reference. */
export const LEADERBOARD_MAX_ENTRIES = 40;

/** Past leaderboard fetch size. */
export const PAST_LEADERBOARD_LIMIT = 40;

export type FetchCurrentLeaderboardOptions = {
  limit?: number;
  offset?: number;
  /** Server-only Next.js cache hints. */
  revalidate?: number | false;
};

/**
 * `GET /api/leaderboard/current?limit=20&offset=`
 * Server: hits API host via `apiFetch`.
 */
export async function fetchCurrentLeaderboard(
  options: FetchCurrentLeaderboardOptions = {},
): Promise<LeaderboardPayload> {
  const limit = LEADERBOARD_PAGE_SIZE;
  const offset = Math.max(0, Math.trunc(options.offset ?? 0));
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const payload = await apiFetch<unknown>(
    `/api/leaderboard/current?${params}`,
    {
      method: "GET",
      next:
        options.revalidate === undefined
          ? { revalidate: 30, tags: ["leaderboard"] }
          : options.revalidate === false
            ? { revalidate: false }
            : { revalidate: options.revalidate, tags: ["leaderboard"] },
    },
  );

  const data = normalizeCurrentLeaderboard(payload);
  if (!data) {
    throw new ApiError("Invalid leaderboard payload", 500, payload);
  }
  return data;
}

/**
 * Browser fetch via Next rewrite (`/api/...` → api.fairgambling.com).
 * Uses credentials so `currentUser` can populate when logged in.
 */
export async function fetchCurrentLeaderboardClient(
  offset = 0,
): Promise<LeaderboardPayload> {
  const params = new URLSearchParams({
    limit: String(LEADERBOARD_PAGE_SIZE),
    offset: String(Math.max(0, Math.trunc(offset))),
  });

  const response = await fetch(`/api/leaderboard/current?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await handleResponse<unknown>(response);
  const data = normalizeCurrentLeaderboard(payload);
  if (!data) {
    throw new Error("Invalid leaderboard payload");
  }
  return data;
}

export function canLoadMore(
  loadedCount: number,
  lastPageSize: number,
): boolean {
  return (
    lastPageSize === LEADERBOARD_PAGE_SIZE &&
    loadedCount < LEADERBOARD_MAX_ENTRIES
  );
}

/**
 * `GET /api/leaderboard/past?limit=40` (browser, via Next rewrite).
 */
export async function fetchPastLeaderboardClient(
  limit = PAST_LEADERBOARD_LIMIT,
): Promise<LeaderboardPayload> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const params = new URLSearchParams({ limit: String(safeLimit) });

  const response = await fetch(`/api/leaderboard/past?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await handleResponse<unknown>(response);
  const data = normalizePastLeaderboard(payload);
  if (!data) {
    throw new Error("Invalid past leaderboard payload");
  }
  return data;
}
