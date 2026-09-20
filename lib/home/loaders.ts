import { ApiError, apiFetch } from "@/lib/api/client";
import {
  MOCK_CODE_DROPS,
  MOCK_COMPLAINT_STATS,
  MOCK_HOME_BUNDLE,
  MOCK_LEADERBOARD,
  MOCK_LIVE_BETS,
  MOCK_DEPOSIT_FEED,
  MOCK_RATINGS_MAP,
  MOCK_REVIEWS,
  type CodeDropOffer,
  type ComplaintGlobalStats,
  type DepositFeedRow,
  type HomeBundle,
  type HomeReview,
  type LeaderboardPayload,
  type LiveBetRow,
  type RatingsMap,
} from "@/lib/home/data";
import {
  normalizeCasinoRating,
  normalizeCodeDrops,
  normalizeComplaintStats,
  normalizeDepositFeed,
  normalizeHomeBundle,
  normalizeLeaderboard,
  normalizeLiveBets,
  normalizeRatingsMap,
  normalizeReviews,
} from "@/lib/home/normalize";

const DEFAULT_REVALIDATE = 60;

function useMockFallback(): boolean {
  return process.env.HOME_API_FALLBACK_MOCK !== "0";
}

function logHomeError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[home] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[home] ${scope}: ${message}`);
}

/** `GET /api/analytics/home-bundle` */
export async function getHomeBundle(): Promise<HomeBundle | null> {
  try {
    const payload = await apiFetch<unknown>("/api/analytics/home-bundle", {
      method: "GET",
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["home-bundle"] },
    });
    const bundle = normalizeHomeBundle(payload);
    if (bundle) return bundle;
    throw new Error("home-bundle payload missing data");
  } catch (err) {
    logHomeError("getHomeBundle", err);
    return useMockFallback() ? MOCK_HOME_BUNDLE : null;
  }
}

/** `GET /api/reviews/?limit=&sort=newest` */
export async function getLatestReviews(
  limit = 9,
): Promise<HomeReview[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 50)
    : 9;

  try {
    const params = new URLSearchParams({
      limit: String(safeLimit),
      offset: "0",
      sort: "newest",
    });
    const payload = await apiFetch<unknown>(`/api/reviews/?${params}`, {
      method: "GET",
      next: { revalidate: 30, tags: ["reviews"] },
    });
    const reviews = normalizeReviews(payload);
    if (reviews.length > 0) return reviews.slice(0, safeLimit);
    throw new Error("reviews list empty");
  } catch (err) {
    logHomeError("getLatestReviews", err);
    return useMockFallback() ? MOCK_REVIEWS : [];
  }
}

/** `GET /api/leaderboard/current?limit=&offset=` */
export async function getCurrentLeaderboard(
  limit = 5,
): Promise<LeaderboardPayload | null> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 5;

  try {
    const params = new URLSearchParams({
      limit: String(safeLimit),
      offset: "0",
    });
    const payload = await apiFetch<unknown>(
      `/api/leaderboard/current?${params}`,
      {
        method: "GET",
        next: { revalidate: 30, tags: ["leaderboard"] },
      },
    );
    const leaderboard = normalizeLeaderboard(payload);
    if (leaderboard && leaderboard.entries.length > 0) {
      return {
        entries: leaderboard.entries.slice(0, safeLimit),
      };
    }
    throw new Error("leaderboard entries empty");
  } catch (err) {
    logHomeError("getCurrentLeaderboard", err);
    return useMockFallback() ? MOCK_LEADERBOARD : null;
  }
}

/** `GET /api/casinos/:slug/rating` for a set of slugs. */
export async function getRatingsMap(
  slugs: string[],
  max = 20,
): Promise<RatingsMap> {
  const unique = [
    ...new Set(
      slugs
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[a-z0-9-]+$/.test(s)),
    ),
  ].slice(0, Math.max(0, max));

  if (unique.length === 0) {
    return useMockFallback() ? MOCK_RATINGS_MAP : {};
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
          return { slug, rating: normalizeCasinoRating(payload) };
        } catch (err) {
          logHomeError(`getRatingsMap:${slug}`, err);
          return { slug, rating: null };
        }
      }),
    );

    const map = normalizeRatingsMap(settled);
    if (Object.keys(map).length > 0) return map;
    return useMockFallback() ? MOCK_RATINGS_MAP : {};
  } catch (err) {
    logHomeError("getRatingsMap", err);
    return useMockFallback() ? MOCK_RATINGS_MAP : {};
  }
}

/**
 * Prefer dispute-shaped stats when present; otherwise keep mock
 * (live `global-stats` currently returns deposit analytics only).
 */
export async function getComplaintStats(
  period = "365d",
): Promise<ComplaintGlobalStats | null> {
  const safePeriod = /^[0-9]+d$/.test(period) ? period : "365d";

  try {
    const payload = await apiFetch<unknown>(
      `/api/analytics/global-stats?period=${encodeURIComponent(safePeriod)}`,
      {
        method: "GET",
        next: { revalidate: 300, tags: ["global-stats"] },
      },
    );
    const stats = normalizeComplaintStats(payload);
    if (stats) return stats;
    return useMockFallback() ? MOCK_COMPLAINT_STATS : null;
  } catch (err) {
    logHomeError("getComplaintStats", err);
    return useMockFallback() ? MOCK_COMPLAINT_STATS : null;
  }
}

/** `GET /api/codes` — initial code-drop list (SSE may refresh client-side). */
export async function getCodeDrops(limit = 10): Promise<CodeDropOffer[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 40)
    : 10;

  try {
    const params = new URLSearchParams({ limit: String(safeLimit) });
    const payload = await apiFetch<unknown>(`/api/codes?${params}`, {
      method: "GET",
      next: { revalidate: 15, tags: ["codes"] },
    });
    const codes = normalizeCodeDrops(payload);
    if (codes.length > 0) return codes.slice(0, safeLimit);
    throw new Error("codes list empty");
  } catch (err) {
    logHomeError("getCodeDrops", err);
    return useMockFallback() ? MOCK_CODE_DROPS : [];
  }
}

export type FeedRecentType = "bets" | "deposits";

/** `GET /api/analytics/feed-recent?type=&limit=` */
export async function getFeedRecent(
  type: FeedRecentType,
  limit = 20,
): Promise<LiveBetRow[] | DepositFeedRow[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 20;

  if (type !== "bets" && type !== "deposits") {
    throw new Error(`Invalid feed type: ${String(type)}`);
  }

  try {
    const params = new URLSearchParams({
      type,
      limit: String(safeLimit),
    });
    const payload = await apiFetch<unknown>(
      `/api/analytics/feed-recent?${params}`,
      {
        method: "GET",
        next: { revalidate: 15, tags: [`feed-${type}`] },
      },
    );

    if (type === "bets") {
      const bets = normalizeLiveBets(payload);
      if (bets.length > 0) return bets.slice(0, safeLimit);
      throw new Error("bets feed empty");
    }

    const deposits = normalizeDepositFeed(payload);
    if (deposits.length > 0) return deposits.slice(0, safeLimit);
    throw new Error("deposits feed empty");
  } catch (err) {
    logHomeError(`getFeedRecent:${type}`, err);
    if (!useMockFallback()) return [];
    return type === "bets" ? MOCK_LIVE_BETS : MOCK_DEPOSIT_FEED;
  }
}

export async function getLiveBets(limit = 20): Promise<LiveBetRow[]> {
  return (await getFeedRecent("bets", limit)) as LiveBetRow[];
}

export async function getDepositFeed(limit = 20): Promise<DepositFeedRow[]> {
  return (await getFeedRecent("deposits", limit)) as DepositFeedRow[];
}

/** Parallel home page loader — replaces page-level mocks. */
export async function loadHomePageData() {
  const [bundle, reviews, leaderboard, codes, complaintStats, liveBets, deposits] =
    await Promise.all([
      getHomeBundle(),
      getLatestReviews(9),
      getCurrentLeaderboard(20),
      getCodeDrops(10),
      getComplaintStats("365d"),
      getLiveBets(20),
      getDepositFeed(20),
    ]);

  const ratingSlugs = (bundle?.casinos ?? [])
    .slice()
    .sort((a, b) => {
      const ta = Number.parseFloat(a.trustScore ?? "0") || 0;
      const tb = Number.parseFloat(b.trustScore ?? "0") || 0;
      return tb - ta;
    })
    .map((c) => c.slug);

  const ratingsMap = await getRatingsMap(ratingSlugs, 20);

  return {
    bundle,
    reviews,
    leaderboard,
    ratingsMap,
    codes,
    complaintStats,
    liveBets,
    deposits,
  };
}
