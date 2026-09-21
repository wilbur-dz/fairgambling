import type {
  RatingDistribution,
  ReviewCasino,
  ReviewItem,
  ReviewMarketRow,
  ReviewStats,
  TopicInsightsPayload,
} from "@/lib/reviews/data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  const s = asString(value).trim();
  return s || null;
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

export function normalizeDistribution(
  raw: unknown,
): RatingDistribution | undefined {
  if (!isRecord(raw)) return undefined;
  const dist: RatingDistribution = {
    5: asNumber(raw[5] ?? raw["5"]),
    4: asNumber(raw[4] ?? raw["4"]),
    3: asNumber(raw[3] ?? raw["3"]),
    2: asNumber(raw[2] ?? raw["2"]),
    1: asNumber(raw[1] ?? raw["1"]),
  };
  const total = dist[5] + dist[4] + dist[3] + dist[2] + dist[1];
  return total > 0 ? dist : undefined;
}

/** Map `GET /api/reviews/?…` list → `ReviewItem[]`. */
export function normalizeReviewItems(payload: unknown): ReviewItem[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.reviews)
      ? data.reviews
      : [];

  return list
    .map((raw): ReviewItem | null => {
      if (!isRecord(raw)) return null;
      const id = asString(raw.id);
      const casinoSlug = asString(raw.casinoSlug);
      if (!id || !casinoSlug) return null;

      const user = isRecord(raw.user) ? raw.user : null;
      const deactivated = Boolean(user?.deactivated);
      const votes = isRecord(raw.votes) ? raw.votes : null;
      const body = asOptionalString(raw.body);
      const title = asOptionalString(raw.title);
      const userVoteRaw = raw.userVote;
      const userVote =
        userVoteRaw === 1 || userVoteRaw === -1
          ? userVoteRaw
          : userVoteRaw === 0
            ? null
            : null;

      return {
        id,
        casinoId: asOptionalString(raw.casinoId),
        casinoName: asString(raw.casinoName, casinoSlug),
        casinoSlug,
        author: deactivated
          ? "Deleted account"
          : asString(user?.username, "Anonymous"),
        userId: asOptionalString(user?.id ?? raw.userId),
        user: user
          ? {
              username: deactivated
                ? "Deleted account"
                : asString(user.username, "Anonymous"),
              avatarUrl: asOptionalString(user.avatarUrl),
              deactivated,
            }
          : null,
        rating: asNumber(raw.rating),
        excerpt: body || title || "",
        createdAt: asString(raw.createdAt, new Date().toISOString()),
        title,
        body,
        isVerified: Boolean(raw.isVerified),
        verifiedVipRank: asOptionalString(raw.verifiedVipRank),
        verifiedTotalWagered: asOptionalString(raw.verifiedTotalWagered),
        helpfulCount: asNumber(raw.helpfulCount ?? votes?.helpful),
        notHelpfulCount: asNumber(raw.notHelpfulCount ?? votes?.notHelpful),
        votes: {
          helpful: asNumber(votes?.helpful ?? raw.helpfulCount),
          notHelpful: asNumber(votes?.notHelpful ?? raw.notHelpfulCount),
        },
        userVote,
      };
    })
    .filter((r): r is ReviewItem => r != null);
}

export function normalizeReviewCasinos(payload: unknown): ReviewCasino[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.casinos)
      ? data.casinos
      : [];

  return list
    .map((raw): ReviewCasino | null => {
      if (!isRecord(raw)) return null;
      const name = asString(raw.name).trim();
      const slug = asString(raw.slug).trim();
      if (!name || !slug) return null;
      return {
        id: asString(raw.id ?? raw.casinoId, slug),
        slug,
        name,
        logoUrl: asOptionalString(raw.logoUrl),
        averageRating:
          raw.averageRating == null ? null : asNumber(raw.averageRating),
        reviewCount: raw.reviewCount == null ? null : asNumber(raw.reviewCount),
      };
    })
    .filter((c): c is ReviewCasino => c != null);
}

export function normalizeReviewMarketRows(payload: unknown): ReviewMarketRow[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.breakdown)
      ? data.breakdown
      : isRecord(data) && Array.isArray(data.casinos)
        ? data.casinos
        : [];

  return list
    .map((raw): ReviewMarketRow | null => {
      if (!isRecord(raw)) return null;
      const casinoName = asString(raw.casinoName || raw.name).trim();
      if (!casinoName) return null;
      return {
        casinoName,
        depositVolume: asNumber(raw.depositVolume),
      };
    })
    .filter((r): r is ReviewMarketRow => r != null);
}

/** Map `GET /api/reviews/stats` (+ optional distribution fields). */
export function normalizeReviewStats(payload: unknown): ReviewStats | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const distribution = normalizeDistribution(
    data.ratingDistribution ?? data.distribution,
  );

  const totalReviews = asNumber(
    data.totalReviews ?? data.total ?? data.count,
  );
  const avgRating = asNumber(data.avgRating ?? data.averageRating);

  if (totalReviews <= 0 && avgRating <= 0 && !distribution) return null;

  return {
    totalReviews,
    avgRating,
    ratingDistribution: distribution,
  };
}

export function normalizeTopicInsights(
  payload: unknown,
): TopicInsightsPayload | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const topicsRaw = Array.isArray(data.topics) ? data.topics : [];
  const casinosRaw = Array.isArray(data.casinos) ? data.casinos : [];

  const topics = topicsRaw
    .map((raw) => {
      if (!isRecord(raw)) return null;
      const key = asString(raw.key ?? raw.id ?? raw.label);
      const label = asString(raw.label ?? raw.name ?? key);
      if (!key || !label) return null;
      const topCasinos = Array.isArray(raw.topCasinos)
        ? raw.topCasinos
            .map((c) => {
              if (!isRecord(c)) return null;
              const name = asString(c.name);
              const slug = asString(c.slug, name.toLowerCase());
              if (!name) return null;
              return { slug, name };
            })
            .filter((c): c is { slug: string; name: string } => c != null)
        : [];
      return {
        key,
        label,
        mentions: asNumber(raw.mentions),
        positive: Boolean(raw.positive ?? (asNumber(raw.positivePct) >= 50)),
        positivePct: asNumber(raw.positivePct),
        negativePct:
          raw.negativePct == null ? undefined : asNumber(raw.negativePct),
        topCasinos,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t != null);

  const casinos = casinosRaw
    .map((raw) => {
      if (!isRecord(raw)) return null;
      const casinoId = asString(raw.casinoId ?? raw.id ?? raw.slug);
      if (!casinoId) return null;
      return {
        casinoId,
        positivePct: asNumber(raw.positivePct),
        topPositive: asOptionalString(raw.topPositive),
        topNegative: asOptionalString(raw.topNegative),
      };
    })
    .filter((c): c is NonNullable<typeof c> => c != null);

  if (topics.length === 0 && casinos.length === 0) return null;
  return { topics, casinos };
}
