import { ApiError, apiFetch } from "@/lib/api/client";
import {
  getCasinosBundle,
  getCasinosList,
  getMarketBreakdown,
} from "@/lib/casinos/loaders";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";
import {
  MOCK_REVIEW_STATS,
  MOCK_TOPIC_INSIGHTS,
  type ReviewCasino,
  type ReviewItem,
  type ReviewMarketRow,
  type ReviewStats,
  type TopicInsightsPayload,
} from "@/lib/reviews/data";
import {
  normalizeReviewCasinos,
  normalizeReviewItems,
  normalizeReviewMarketRows,
  normalizeReviewStats,
  normalizeTopicInsights,
} from "@/lib/reviews/normalize";
import { MOCK_REVIEWS } from "@/lib/home/data";
import { normalizeReviews } from "@/lib/home/normalize";

const DEFAULT_REVALIDATE = 60;

function useMockFallback(): boolean {
  if (process.env.REVIEWS_API_FALLBACK_MOCK === "0") return false;
  if (process.env.REVIEWS_API_FALLBACK_MOCK === "1") return true;
  return process.env.HOME_API_FALLBACK_MOCK !== "0";
}

function logReviewsError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[reviews] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[reviews] ${scope}: ${message}`);
}

function homeReviewsToItems(reviews: ReturnType<typeof normalizeReviews>): ReviewItem[] {
  return reviews.map((r) => ({
    id: r.id,
    casinoName: r.casinoName,
    casinoSlug: r.casinoSlug,
    author: r.author,
    rating: r.rating,
    excerpt: r.excerpt,
    createdAt: r.createdAt,
    title: r.title,
    body: r.body,
    votes: r.votes,
    helpfulCount: r.votes?.helpful ?? 0,
    notHelpfulCount: r.votes?.notHelpful ?? 0,
  }));
}

/** `GET /api/reviews/?limit=&sortBy=&sortOrder=` */
export async function getReviewsList(options: {
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  /** Legacy query still accepted by API. */
  sort?: string;
}): Promise<ReviewItem[]> {
  const limit = Number.isFinite(options.limit)
    ? Math.min(Math.max(Math.trunc(options.limit!), 1), 100)
    : 24;

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      page: "1",
    });
    if (options.sortBy) params.set("sortBy", options.sortBy);
    if (options.sortOrder) params.set("sortOrder", options.sortOrder);
    if (options.sort) params.set("sort", options.sort);

    const payload = await apiFetch<unknown>(`/api/reviews/?${params}`, {
      method: "GET",
      next: { revalidate: 30, tags: ["reviews"] },
    });
    const reviews = normalizeReviewItems(payload);
    if (reviews.length > 0) return reviews.slice(0, limit);
    throw new Error("reviews list empty");
  } catch (err) {
    logReviewsError("getReviewsList", err);
    if (!useMockFallback()) return [];
    return homeReviewsToItems(MOCK_REVIEWS).slice(0, limit);
  }
}

/** `GET /api/reviews/stats` — distribution may be missing; UI falls back to sample/mock. */
export async function getReviewStats(): Promise<ReviewStats | null> {
  try {
    const payload = await apiFetch<unknown>("/api/reviews/stats", {
      method: "GET",
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["review-stats"] },
    });
    const stats = normalizeReviewStats(payload);
    if (!stats) throw new Error("review stats empty");

    // Live stats endpoint currently returns avgRating (+ activity counters),
    // not totalReviews / ratingDistribution — fill those from mock when needed.
    return {
      avgRating:
        stats.avgRating > 0 ? stats.avgRating : MOCK_REVIEW_STATS.avgRating,
      totalReviews:
        stats.totalReviews > 0
          ? stats.totalReviews
          : MOCK_REVIEW_STATS.totalReviews,
      ratingDistribution:
        stats.ratingDistribution ?? MOCK_REVIEW_STATS.ratingDistribution,
    };
  } catch (err) {
    logReviewsError("getReviewStats", err);
    return useMockFallback() ? MOCK_REVIEW_STATS : null;
  }
}

/**
 * Topic / sentiment insights.
 * Dedicated public endpoint is not stable yet — try once, then mock.
 */
export async function getTopicInsights(): Promise<TopicInsightsPayload> {
  try {
    const payload = await apiFetch<unknown>("/api/reviews/insights", {
      method: "GET",
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["review-insights"] },
    });
    const normalized = normalizeTopicInsights(payload);
    if (normalized) return normalized;
  } catch (err) {
    // Expected until insights API is published with a stable contract.
    if (!(err instanceof ApiError && (err.status === 400 || err.status === 404))) {
      logReviewsError("getTopicInsights", err);
    }
  }

  return useMockFallback() ? MOCK_TOPIC_INSIGHTS : { topics: [], casinos: [] };
}

async function loadReviewCasinos(): Promise<ReviewCasino[]> {
  try {
    const bundle = await getCasinosBundle();
    if (bundle?.casinos?.length) {
      return bundle.casinos.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        logoUrl: c.logoUrl ?? getCasinoLogoUrl(c.slug, "light"),
        averageRating: c.averageRating,
        reviewCount: c.reviewCount,
      }));
    }

    const list = await getCasinosList(100);
    if (list.length > 0) {
      return list.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        logoUrl: c.logoUrl ?? getCasinoLogoUrl(c.slug, "light"),
        averageRating: c.averageRating,
        reviewCount: c.reviewCount,
      }));
    }

    const payload = await apiFetch<unknown>("/api/casinos?limit=100", {
      method: "GET",
      next: { revalidate: DEFAULT_REVALIDATE, tags: ["casinos-list"] },
    });
    return normalizeReviewCasinos(payload).map((c) => ({
      ...c,
      logoUrl: c.logoUrl ?? getCasinoLogoUrl(c.slug, "light"),
    }));
  } catch (err) {
    logReviewsError("loadReviewCasinos", err);
    return [];
  }
}

async function loadMarketData(): Promise<ReviewMarketRow[]> {
  try {
    const bundle = await getCasinosBundle();
    if (bundle?.breakdown30d?.length) {
      return bundle.breakdown30d.map((row) => ({
        casinoName: row.casinoName,
        depositVolume: row.depositVolume,
      }));
    }
    const rows = await getMarketBreakdown("30D");
    if (rows.length > 0) {
      return rows.map((row) => ({
        casinoName: row.casinoName,
        depositVolume: row.depositVolume,
      }));
    }
    return normalizeReviewMarketRows([]);
  } catch (err) {
    logReviewsError("loadMarketData", err);
    return [];
  }
}

export type ReviewsPageData = {
  casinos: ReviewCasino[];
  latestReviews: ReviewItem[];
  topReviews: ReviewItem[];
  reviewStats: ReviewStats | null;
  marketData: ReviewMarketRow[];
  reviewSample: ReviewItem[];
  topicInsights: TopicInsightsPayload;
};

/** SSR assembler for `/reviews` — mirrors `ReviewsView` initial props. */
export async function loadReviewsPageData(): Promise<ReviewsPageData> {
  const [
    casinos,
    latestReviews,
    topReviews,
    reviewStats,
    marketData,
    reviewSample,
    topicInsights,
  ] = await Promise.all([
    loadReviewCasinos(),
    getReviewsList({ limit: 24, sortBy: "newest", sortOrder: "desc" }),
    getReviewsList({ limit: 16, sortBy: "helpful", sortOrder: "desc" }),
    getReviewStats(),
    loadMarketData(),
    getReviewsList({ limit: 50, sortBy: "newest", sortOrder: "desc" }),
    getTopicInsights(),
  ]);

  return {
    casinos,
    latestReviews,
    topReviews,
    reviewStats,
    marketData,
    reviewSample,
    topicInsights,
  };
}
