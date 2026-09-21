import { ApiError, apiFetch } from "@/lib/api/client";
import { loadCasinoAnalytics } from "@/lib/casinos/casino-analytics";
import { loadCasinoHotWallet } from "@/lib/casinos/casino-hot-wallet";
import {
  type CasinoDetail,
  type CasinoPageData,
  type CasinoPageStats,
  isValidCasinoSlug,
} from "@/lib/casinos/casino-page";
import {
  MOCK_CASINOS_BUNDLE,
  MOCK_RATINGS_DETAIL_MAP,
  type CasinoListItem,
  type CasinoRatingDetail,
} from "@/lib/casinos/data";
import {
  normalizeCasinoRatingDetail,
  normalizeCasinosList,
} from "@/lib/casinos/normalize";
import { loadCasinoReviewsPage } from "@/lib/reviews/casino-reviews";
import { normalizeDistribution } from "@/lib/reviews/normalize";
import { casinoRouteSlug } from "@/lib/reviews/format";

const DEFAULT_REVALIDATE = 60;

function useMockFallback(): boolean {
  if (process.env.CASINOS_API_FALLBACK_MOCK === "0") return false;
  if (process.env.CASINOS_API_FALLBACK_MOCK === "1") return true;
  return process.env.HOME_API_FALLBACK_MOCK !== "0";
}

function logCasinoPageError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[casino-page] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[casino-page] ${scope}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = asNumber(value, Number.NaN);
  return Number.isFinite(n) ? n : null;
}

function asOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s || null;
}

function normalizeCasinoDetail(raw: unknown): CasinoDetail | null {
  if (!isRecord(raw)) return null;
  const name = asOptionalString(raw.name);
  const slug = asOptionalString(raw.slug);
  if (!name || !slug) return null;

  return {
    id: String(raw.id ?? raw.casinoId ?? slug),
    slug,
    name,
    logoUrl: asOptionalString(raw.logoUrl),
    foundedYear: asOptionalNumber(raw.foundedYear),
    trustScore: asOptionalString(raw.trustScore),
    averageRating: asOptionalNumber(raw.averageRating),
    reviewCount: asOptionalNumber(raw.reviewCount),
    kycStrictness: asOptionalNumber(raw.kycStrictness),
    meta: isRecord(raw.meta) ? (raw.meta as CasinoListItem["meta"]) : null,
    websiteUrl: asOptionalString(raw.websiteUrl),
    brandStatus: asOptionalString(raw.brandStatus),
    description: asOptionalString(raw.description),
    facts: isRecord(raw.facts) ? raw.facts : null,
  };
}

function normalizeStats(raw: unknown): CasinoPageStats {
  if (!isRecord(raw)) {
    return {
      reviewCount: 0,
      averageRating: null,
      complaintCount: 0,
      openComplaintCount: 0,
    };
  }
  return {
    reviewCount: asNumber(raw.reviewCount),
    averageRating: asOptionalNumber(raw.averageRating),
    complaintCount: asNumber(raw.complaintCount),
    openComplaintCount: asNumber(raw.openComplaintCount),
    verifiedReviewCount: asOptionalNumber(raw.verifiedReviewCount) ?? undefined,
    verifiedAverageRating: asOptionalNumber(raw.verifiedAverageRating),
    ratingDistribution: normalizeDistribution(
      raw.ratingDistribution ?? raw.distribution,
    ),
  };
}

function mockCasinoBySlug(slug: string): CasinoDetail | null {
  const found = MOCK_CASINOS_BUNDLE.casinos.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase(),
  );
  return found ? { ...found } : null;
}

/** `GET /api/casinos/slug/:slug` */
export async function getCasinoBySlug(
  slug: string,
): Promise<CasinoDetail | null> {
  const safe = casinoRouteSlug(slug.trim());
  if (!isValidCasinoSlug(safe)) return null;

  try {
    const payload = await apiFetch<unknown>(
      `/api/casinos/slug/${encodeURIComponent(safe)}`,
      {
        method: "GET",
        next: { revalidate: DEFAULT_REVALIDATE, tags: [`casino-${safe}`] },
      },
    );
    const data = isRecord(payload) && "data" in payload ? payload.data : payload;
    const casino = normalizeCasinoDetail(data);
    if (casino) return casino;
    throw new Error("casino payload missing data");
  } catch (err) {
    logCasinoPageError(`getCasinoBySlug:${safe}`, err);
    return useMockFallback() ? mockCasinoBySlug(safe) : null;
  }
}

/** `GET /api/casinos/slug/:slug/details` → casino + stats */
export async function getCasinoWithStatsBySlug(slug: string): Promise<{
  casino: CasinoDetail | null;
  stats: CasinoPageStats;
} | null> {
  const safe = casinoRouteSlug(slug.trim());
  if (!isValidCasinoSlug(safe)) return null;

  try {
    const payload = await apiFetch<unknown>(
      `/api/casinos/slug/${encodeURIComponent(safe)}/details`,
      {
        method: "GET",
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: [`casino-details-${safe}`],
        },
      },
    );
    if (!isRecord(payload)) throw new Error("details payload invalid");
    const casino = normalizeCasinoDetail(payload.casino);
    const stats = normalizeStats(payload.stats);
    if (!casino) throw new Error("details casino missing");
    return { casino, stats };
  } catch (err) {
    logCasinoPageError(`getCasinoWithStatsBySlug:${safe}`, err);
    if (!useMockFallback()) return null;
    const casino = mockCasinoBySlug(safe);
    if (!casino) return null;
    return {
      casino,
      stats: {
        reviewCount: casino.reviewCount ?? 0,
        averageRating: casino.averageRating ?? null,
        complaintCount: 0,
        openComplaintCount: 0,
      },
    };
  }
}

async function getCasinoRating(
  slug: string,
): Promise<CasinoRatingDetail | null> {
  const safe = casinoRouteSlug(slug.trim());
  try {
    const payload = await apiFetch<unknown>(
      `/api/casinos/${encodeURIComponent(safe)}/rating`,
      {
        method: "GET",
        next: { revalidate: 300, tags: [`casino-rating-${safe}`] },
      },
    );
    return normalizeCasinoRatingDetail(payload);
  } catch (err) {
    logCasinoPageError(`getCasinoRating:${safe}`, err);
    if (!useMockFallback()) return null;
    return MOCK_RATINGS_DETAIL_MAP[safe] ?? null;
  }
}

function countBonusTypes(casino: CasinoDetail): number {
  const bonus = casino.meta?.bonus as Record<string, unknown> | undefined;
  const types = bonus?.bonusTypes;
  return Array.isArray(types) ? types.length : 0;
}

function extractReviewHtml(casino: CasinoDetail): string | null {
  if (casino.description) {
    return `<p>${casino.description}</p>`;
  }
  return null;
}

/** Parallel loader for `/${slug}` casino detail page. */
export async function loadCasinoPageData(
  slug: string,
): Promise<CasinoPageData | null> {
  const safe = casinoRouteSlug(slug.trim());
  if (!isValidCasinoSlug(safe)) return null;

  const [details, rating] = await Promise.all([
    getCasinoWithStatsBySlug(safe),
    getCasinoRating(safe),
  ]);

  let casino = details?.casino ?? null;
  let stats = details?.stats ?? null;

  if (!casino) {
    casino = await getCasinoBySlug(safe);
    if (casino) {
      stats = {
        reviewCount: casino.reviewCount ?? 0,
        averageRating: casino.averageRating ?? null,
        complaintCount: 0,
        openComplaintCount: 0,
      };
    }
  }

  if (!casino || !stats) return null;

  const [analytics, hotWallet, reviewsPage] = await Promise.all([
    loadCasinoAnalytics({
      slug: casino.slug,
      casinoName: casino.name,
      casinoId: casino.id,
    }),
    loadCasinoHotWallet(casino.slug),
    loadCasinoReviewsPage(casino.id, casino.slug, {
      page: 1,
      limit: 10,
      status: "approved",
      sortBy: "helpful",
    }),
  ]);

  return {
    casino,
    rating,
    stats,
    promotionsCount: countBonusTypes(casino),
    reviewHtml: extractReviewHtml(casino),
    analytics,
    hotWallet,
    initialCasinoReviews: reviewsPage.data,
    initialCasinoReviewsTotalPages: reviewsPage.pagination.totalPages,
    pinnedReview: null,
  };
}

/** Lightweight existence check used by generateMetadata / static hints. */
export async function casinoSlugExists(slug: string): Promise<boolean> {
  const data = await loadCasinoPageData(slug);
  if (data) return true;
  // Last resort: list endpoint
  try {
    const list = await apiFetch<unknown>("/api/casinos?limit=100", {
      method: "GET",
      next: { revalidate: 300, tags: ["casinos-list"] },
    });
    const items = normalizeCasinosList(list);
    const safe = casinoRouteSlug(slug.trim()).toLowerCase();
    return items.some((c) => c.slug.toLowerCase() === safe);
  } catch {
    return false;
  }
}
