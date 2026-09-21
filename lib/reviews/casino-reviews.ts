import { ApiError, apiFetch } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/config";
import { MOCK_REVIEWS } from "@/lib/home/data";
import { normalizeReviews } from "@/lib/home/normalize";
import type { ReviewItem } from "@/lib/reviews/data";
import { normalizeReviewItems } from "@/lib/reviews/normalize";
import { casinoRouteSlug } from "@/lib/reviews/format";

export type CasinoReviewSort =
  | "helpful"
  | "rating_high"
  | "rating_low"
  | "newest";

export type CasinoReviewsQuery = {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: CasinoReviewSort;
  ratings?: number[];
};

export type CasinoReviewsPage = {
  data: ReviewItem[];
  pagination: {
    page: number;
    totalPages: number;
    total?: number;
  };
};

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

function unwrapEnvelope(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

function normalizeCasinoReviewsPage(
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): CasinoReviewsPage {
  const root = unwrapEnvelope(payload);
  let list: unknown[] = [];
  let paginationRaw: Record<string, unknown> | null = null;

  if (Array.isArray(root)) {
    list = root;
  } else if (isRecord(root)) {
    if (Array.isArray(root.reviews)) list = root.reviews;
    else if (Array.isArray(root.data)) list = root.data;
    paginationRaw = isRecord(root.pagination) ? root.pagination : root;
  }

  const data = normalizeReviewItems(list);
  const page = asNumber(paginationRaw?.page, fallbackPage);
  const totalPages = Math.max(
    1,
    asNumber(
      paginationRaw?.totalPages ??
        paginationRaw?.total_pages ??
        paginationRaw?.pages,
      1,
    ),
  );
  const total = asNumber(paginationRaw?.total ?? paginationRaw?.count, data.length);

  return {
    data,
    pagination: { page, totalPages, total },
  };
}

function buildReviewsQuery(params: CasinoReviewsQuery): URLSearchParams {
  const page = Math.max(1, Math.trunc(params.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.trunc(params.limit ?? 10)));
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: params.status ?? "approved",
  });
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.ratings?.length) {
    search.set("ratings", params.ratings.join(","));
  }
  return search;
}

function mockCasinoReviews(
  casinoSlug: string,
  params: CasinoReviewsQuery,
): CasinoReviewsPage {
  const slug = casinoRouteSlug(casinoSlug).toLowerCase();
  const items: ReviewItem[] = normalizeReviews(MOCK_REVIEWS).map((r) => ({
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

  const filteredMock = items.filter(
    (r) => casinoRouteSlug(r.casinoSlug).toLowerCase() === slug,
  );

  let filtered = filteredMock;
  if (params.ratings?.length) {
    const set = new Set(params.ratings);
    filtered = filtered.filter((r) => set.has(Math.round(r.rating)));
  }

  const sorted = [...filtered];
  switch (params.sortBy) {
    case "rating_high":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "rating_low":
      sorted.sort((a, b) => a.rating - b.rating);
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "helpful":
    default:
      sorted.sort(
        (a, b) =>
          (b.votes?.helpful ?? b.helpfulCount ?? 0) -
          (a.votes?.helpful ?? a.helpfulCount ?? 0),
      );
  }

  const page = Math.max(1, Math.trunc(params.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.trunc(params.limit ?? 10)));
  const start = (page - 1) * limit;
  const slice = sorted.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(sorted.length / limit) || 1);

  return {
    data: slice,
    pagination: { page, totalPages, total: sorted.length },
  };
}

function useMockFallback(): boolean {
  if (process.env.CASINOS_API_FALLBACK_MOCK === "0") return false;
  if (process.env.CASINOS_API_FALLBACK_MOCK === "1") return true;
  return process.env.HOME_API_FALLBACK_MOCK !== "0";
}

/** Server: initial casino reviews for the detail tab. */
export async function loadCasinoReviewsPage(
  casinoId: string,
  casinoSlug: string,
  params: CasinoReviewsQuery = {},
): Promise<CasinoReviewsPage> {
  const query = buildReviewsQuery(params);
  const id = encodeURIComponent(casinoId);

  try {
    const payload = await apiFetch<unknown>(
      `/api/casinos/${id}/reviews?${query}`,
      {
        method: "GET",
        next: {
          revalidate: 30,
          tags: [`casino-reviews-${casinoSlug}`],
        },
      },
    );
    const page = normalizeCasinoReviewsPage(
      payload,
      params.page ?? 1,
      params.limit ?? 10,
    );
    if (page.data.length > 0) return page;
    throw new Error("casino reviews empty");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // Some APIs use slug routes.
      try {
        const safeSlug = encodeURIComponent(casinoRouteSlug(casinoSlug));
        const payload = await apiFetch<unknown>(
          `/api/casinos/slug/${safeSlug}/reviews?${query}`,
          { method: "GET", next: { revalidate: 30 } },
        );
        const page = normalizeCasinoReviewsPage(
          payload,
          params.page ?? 1,
          params.limit ?? 10,
        );
        if (page.data.length > 0) return page;
      } catch {
        // fall through
      }
    }
    if (!useMockFallback()) {
      return {
        data: [],
        pagination: { page: 1, totalPages: 1, total: 0 },
      };
    }
    return mockCasinoReviews(casinoSlug, params);
  }
}

/** Client: paginated casino reviews (ReviewsTab). */
export async function getCasinoReviews(
  casinoId: string,
  casinoSlug: string,
  params: CasinoReviewsQuery,
  accessToken?: string | null,
): Promise<CasinoReviewsPage> {
  const query = buildReviewsQuery(params);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const id = encodeURIComponent(casinoId);
  const urls = [
    `${getApiUrl()}/api/casinos/${id}/reviews?${query}`,
    `${getApiUrl()}/api/casinos/slug/${encodeURIComponent(casinoRouteSlug(casinoSlug))}/reviews?${query}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!response.ok) continue;
      const payload = (await response.json()) as unknown;
      const page = normalizeCasinoReviewsPage(
        payload,
        params.page ?? 1,
        params.limit ?? 10,
      );
      if (page.data.length >= 0) return page;
    } catch {
      // try next url
    }
  }

  if (useMockFallback()) {
    return mockCasinoReviews(casinoSlug, params);
  }

  return {
    data: [],
    pagination: { page: params.page ?? 1, totalPages: 1, total: 0 },
  };
}

/** Client: current user's review for this casino (optional). */
export async function getMyReviewForCasino(
  casinoId: string,
  accessToken?: string | null,
): Promise<ReviewItem | null> {
  if (!accessToken) return null;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  const id = encodeURIComponent(casinoId);
  const paths = [
    `/api/casinos/${id}/reviews/me`,
    `/api/reviews/me?casinoId=${id}`,
  ];

  for (const path of paths) {
    try {
      const response = await fetch(`${getApiUrl()}${path}`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!response.ok) continue;
      const payload = (await response.json()) as unknown;
      const items = normalizeReviewItems(payload);
      return items[0] ?? null;
    } catch {
      // try next
    }
  }
  return null;
}
