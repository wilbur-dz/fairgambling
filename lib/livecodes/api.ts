import { ApiError, apiFetch, handleResponse } from "@/lib/api/client";
import type {
  CodeCasino,
  CodesListPayload,
  CodesStatsPayload,
} from "@/lib/livecodes/data";
import {
  normalizeCasinosList,
  normalizeCodesList,
  normalizeCodesStats,
} from "@/lib/livecodes/normalize";

export type FetchCodesOptions = {
  limit?: number;
  page?: number;
  casinoSlug?: string;
  revalidate?: number | false;
};

/**
 * `GET /api/codes` — server fetch.
 */
export async function fetchCodes(
  options: FetchCodesOptions = {},
): Promise<CodesListPayload> {
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? 20), 1), 100);
  const params = new URLSearchParams({ limit: String(limit) });
  if (options.page) params.set("page", String(options.page));
  if (options.casinoSlug) params.set("casinoSlug", options.casinoSlug);

  const payload = await apiFetch<unknown>(`/api/codes?${params}`, {
    method: "GET",
    next:
      options.revalidate === false
        ? { revalidate: false }
        : {
            revalidate: options.revalidate ?? 15,
            tags: ["codes", "livecodes"],
          },
  });

  const data = normalizeCodesList(payload);
  if (data.codes.length === 0) {
    throw new ApiError("Codes list empty", 404, payload);
  }
  return data;
}

/**
 * `GET /api/codes/stats` — by-casino + biggest drops for 24h / 7d / 90d.
 */
export async function fetchCodesStats(
  options: { revalidate?: number | false } = {},
): Promise<CodesStatsPayload> {
  const payload = await apiFetch<unknown>("/api/codes/stats", {
    method: "GET",
    next:
      options.revalidate === false
        ? { revalidate: false }
        : {
            revalidate: options.revalidate ?? 60,
            tags: ["codes", "livecodes", "codes-stats"],
          },
  });
  return normalizeCodesStats(payload);
}

/**
 * `GET /api/casinos?limit=100` — full casino catalog for All Casinos filter
 * and Bonus Calculator Select Casino. Do not use `/api/codes/casinos`.
 */
export async function fetchCasinos(
  options: { limit?: number; revalidate?: number | false } = {},
): Promise<CodeCasino[]> {
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? 100), 1), 100);
  const payload = await apiFetch<unknown>(`/api/casinos?limit=${limit}`, {
    method: "GET",
    next:
      options.revalidate === false
        ? { revalidate: false }
        : {
            revalidate: options.revalidate ?? 300,
            tags: ["casinos", "livecodes", "bonus-calculator"],
          },
  });
  const list = normalizeCasinosList(payload);
  if (list.length === 0) {
    throw new ApiError("Casinos list empty", 404, payload);
  }
  return list;
}

/**
 * Browser `GET /api/codes` via Next rewrite.
 */
export async function fetchCodesClient(
  options: FetchCodesOptions = {},
): Promise<CodesListPayload> {
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? 20), 1), 100);
  const params = new URLSearchParams({ limit: String(limit) });
  if (options.page) params.set("page", String(options.page));
  if (options.casinoSlug) params.set("casinoSlug", options.casinoSlug);

  const response = await fetch(`/api/codes?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await handleResponse<unknown>(response);
  return normalizeCodesList(payload);
}

/**
 * Browser `GET /api/exclusive-codes`.
 * Response shape treated the same as `/api/codes` until exclusive fields are documented.
 */
export async function fetchExclusiveCodesClient(): Promise<CodesListPayload> {
  const response = await fetch("/api/exclusive-codes", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await handleResponse<unknown>(response);
  return normalizeCodesList(payload);
}
