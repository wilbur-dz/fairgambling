import { ApiError, apiFetch } from "@/lib/api/client";
import {
  MOCK_CASINOS_BUNDLE,
  MOCK_RATINGS_DETAIL_MAP,
  type CasinosBundle,
  type RatingsDetailMap,
} from "@/lib/casinos/data";
import {
  normalizeCasinoRatingDetail,
  normalizeCasinosBundle,
  normalizeCasinosList,
  normalizeMarketBreakdown,
  normalizeRatingsDetailMap,
} from "@/lib/casinos/normalize";

const DEFAULT_REVALIDATE = 60;

function useMockFallback(): boolean {
  if (process.env.CASINOS_API_FALLBACK_MOCK === "0") return false;
  if (process.env.CASINOS_API_FALLBACK_MOCK === "1") return true;
  return process.env.HOME_API_FALLBACK_MOCK !== "0";
}

function logCasinosError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[casinos] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[casinos] ${scope}: ${message}`);
}

/** `GET /api/analytics/casinos-bundle` */
export async function getCasinosBundle(
  signal?: AbortSignal,
): Promise<CasinosBundle | null> {
  try {
    const payload = await apiFetch<unknown>("/api/analytics/casinos-bundle", {
      method: "GET",
      signal,
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["casinos-bundle"] },
    });
    const bundle = normalizeCasinosBundle(payload);
    if (bundle) return bundle;
    throw new Error("casinos-bundle payload missing data");
  } catch (err) {
    logCasinosError("getCasinosBundle", err);
    return useMockFallback() ? MOCK_CASINOS_BUNDLE : null;
  }
}

/** `GET /api/analytics/market-breakdown?period=` */
export async function getMarketBreakdown(
  period: "7D" | "30D" | "90D" | "365D",
): Promise<CasinosBundle["breakdown30d"]> {
  const safe = /^(7|30|90|365)D$/.test(period) ? period : "30D";
  try {
    const params = new URLSearchParams({ period: safe });
    const payload = await apiFetch<unknown>(
      `/api/analytics/market-breakdown?${params}`,
      {
        method: "GET",
        next: { revalidate: DEFAULT_REVALIDATE, tags: [`market-${safe}`] },
      },
    );
    return normalizeMarketBreakdown(payload);
  } catch (err) {
    logCasinosError(`getMarketBreakdown:${safe}`, err);
    return [];
  }
}

/** `GET /api/casinos?limit=` */
export async function getCasinosList(limit = 100) {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 200)
    : 100;
  try {
    const params = new URLSearchParams({ limit: String(safeLimit) });
    const payload = await apiFetch<unknown>(`/api/casinos?${params}`, {
      method: "GET",
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["casinos-list"] },
    });
    return normalizeCasinosList(payload);
  } catch (err) {
    logCasinosError("getCasinosList", err);
    return useMockFallback() ? MOCK_CASINOS_BUNDLE.casinos : [];
  }
}

/** `GET /api/casinos/:slug/rating` for a set of slugs (SSR). */
export async function getRatingsDetailMap(
  slugs: string[],
  max = 40,
): Promise<RatingsDetailMap> {
  const unique = [
    ...new Set(
      slugs
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[a-z0-9-]+$/.test(s)),
    ),
  ].slice(0, Math.max(0, max));

  if (unique.length === 0) {
    return useMockFallback() ? MOCK_RATINGS_DETAIL_MAP : {};
  }

  try {
    const settled = await Promise.all(
      unique.map(async (slug) => {
        try {
          const payload = await apiFetch<unknown>(
            `/api/casinos/${encodeURIComponent(slug)}/rating`,
            {
              method: "GET",
              next: { revalidate: 300, tags: [`casino-rating-${slug}`] },
            },
          );
          return { slug, rating: normalizeCasinoRatingDetail(payload) };
        } catch (err) {
          logCasinosError(`getRatingsDetailMap:${slug}`, err);
          return { slug, rating: null };
        }
      }),
    );

    const map = normalizeRatingsDetailMap(settled);
    if (Object.keys(map).length > 0) return map;
    return useMockFallback() ? MOCK_RATINGS_DETAIL_MAP : {};
  } catch (err) {
    logCasinosError("getRatingsDetailMap", err);
    return useMockFallback() ? MOCK_RATINGS_DETAIL_MAP : {};
  }
}

/** Parallel casinos page loader. */
export async function loadCasinosPageData() {
  const bundle = await getCasinosBundle();
  const ratingSlugs = (bundle?.casinos ?? [])
    .slice()
    .sort((a, b) => {
      const ta = Number.parseFloat(a.trustScore ?? "0") || 0;
      const tb = Number.parseFloat(b.trustScore ?? "0") || 0;
      return tb - ta;
    })
    .map((c) => c.slug);

  const ratingsMap = await getRatingsDetailMap(ratingSlugs, 40);

  return { bundle, ratingsMap };
}
