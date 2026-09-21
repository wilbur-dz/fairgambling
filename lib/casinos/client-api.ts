"use client";

import {
  MOCK_CASINOS_BUNDLE,
  type CasinosBundle,
  type RatingsDetailMap,
  slugsMissingFromRatingsMap,
} from "@/lib/casinos/data";
import {
  normalizeCasinoRatingDetail,
  normalizeCasinosBundle,
  normalizeCasinosList,
  normalizeMarketBreakdown,
  normalizeRatingsDetailMap,
} from "@/lib/casinos/normalize";

function useMockFallback(): boolean {
  if (process.env.NEXT_PUBLIC_CASINOS_API_FALLBACK_MOCK === "0") return false;
  if (process.env.NEXT_PUBLIC_CASINOS_API_FALLBACK_MOCK === "1") return true;
  return process.env.NEXT_PUBLIC_HOME_API_FALLBACK_MOCK !== "0";
}

/** Same-origin `/api/*` → Next rewrite proxy (no API host in browser). */
async function clientJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const url = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Browser: `GET /api/analytics/casinos-bundle`. */
export async function clientGetCasinosBundle(
  signal?: AbortSignal,
): Promise<CasinosBundle | null> {
  try {
    const payload = await clientJson("/api/analytics/casinos-bundle", signal);
    const bundle = normalizeCasinosBundle(payload);
    if (bundle) return bundle;
    throw new Error("empty bundle");
  } catch {
    return useMockFallback() ? MOCK_CASINOS_BUNDLE : null;
  }
}

/** Browser: `GET /api/analytics/market-breakdown?period=`. */
export async function clientGetMarketBreakdown(
  period: "7D" | "30D" | "90D" | "365D",
) {
  try {
    const params = new URLSearchParams({ period });
    const payload = await clientJson(
      `/api/analytics/market-breakdown?${params}`,
    );
    return normalizeMarketBreakdown(payload);
  } catch {
    return [];
  }
}

/** Browser: `GET /api/casinos?limit=`. */
export async function clientGetCasinosList(limit = 100) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    const payload = await clientJson(`/api/casinos?${params}`);
    return normalizeCasinosList(payload);
  } catch {
    return useMockFallback() ? MOCK_CASINOS_BUNDLE.casinos : [];
  }
}

/** Browser: fill missing ratings. */
export async function clientFetchCasinoRatingsMap(
  slugs: string[],
  existing: RatingsDetailMap = {},
): Promise<RatingsDetailMap> {
  const missing = slugsMissingFromRatingsMap(slugs, existing).slice(0, 40);
  if (missing.length === 0) return existing;

  const settled = await Promise.all(
    missing.map(async (slug) => {
      try {
        const payload = await clientJson(
          `/api/casinos/${encodeURIComponent(slug)}/rating`,
        );
        return { slug, rating: normalizeCasinoRatingDetail(payload) };
      } catch {
        return { slug, rating: null };
      }
    }),
  );

  return { ...existing, ...normalizeRatingsDetailMap(settled) };
}
