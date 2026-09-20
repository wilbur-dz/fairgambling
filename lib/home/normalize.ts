import type {
  CodeDropOffer,
  ComplaintGlobalStats,
  DepositFeedRow,
  HomeBundle,
  HomeCasino,
  HomeReview,
  LeaderboardEntry,
  LeaderboardPayload,
  LiveBetRow,
  RatingsMap,
} from "@/lib/home/data";

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

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

function formatCodeBonusTitle(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Bonus";
  const label =
    valueUsd % 1 === 0 ? String(valueUsd) : valueUsd.toFixed(2);
  return `$${label} Bonus`;
}

function formatPer1kValue(codeValue: number, wagerReq: number): string {
  if (!(wagerReq > 0) || !(codeValue > 0)) return "—";
  return `$${((codeValue / wagerReq) * 1000).toFixed(2)} per 1k Wager`;
}

function normalizeBreakdownRow(
  raw: unknown,
  slugById: Map<string, string>,
  slugByName: Map<string, string>,
): HomeCasino | null {
  if (!isRecord(raw)) return null;

  const casinoName = asString(raw.casinoName || raw.name).trim();
  if (!casinoName) return null;

  const casinoId = asString(raw.casinoId ?? raw.id, casinoName);
  const slug =
    asOptionalString(raw.slug) ||
    slugById.get(casinoId) ||
    slugByName.get(casinoName.toLowerCase()) ||
    slugifyName(casinoName);

  return {
    casinoId,
    name: casinoName,
    slug,
    logoUrl: asOptionalString(raw.logoUrl),
    trustScore: asOptionalString(raw.trustScore),
    depositVolume: asNumber(raw.depositVolume),
    depositVolumeChange: asNumber(raw.depositVolumeChange),
    averageRating:
      raw.averageRating == null ? null : asNumber(raw.averageRating),
    reviewCount: raw.reviewCount == null ? null : asNumber(raw.reviewCount),
  };
}

function normalizeCasinoListItem(raw: unknown): HomeCasino | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name).trim();
  const slug = asString(raw.slug).trim();
  if (!name || !slug) return null;

  return {
    casinoId: asString(raw.id ?? raw.casinoId, slug),
    name,
    slug,
    logoUrl: asOptionalString(raw.logoUrl),
    trustScore: asOptionalString(raw.trustScore),
    depositVolume: asNumber(raw.depositVolume),
    depositVolumeChange: asNumber(raw.depositVolumeChange),
    averageRating:
      raw.averageRating == null ? null : asNumber(raw.averageRating),
    reviewCount: raw.reviewCount == null ? null : asNumber(raw.reviewCount),
  };
}

/** Map `GET /api/analytics/home-bundle` → `HomeBundle`. */
export function normalizeHomeBundle(payload: unknown): HomeBundle | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const casinosRaw = Array.isArray(data.casinos) ? data.casinos : [];
  const casinos = casinosRaw
    .map(normalizeCasinoListItem)
    .filter((c): c is HomeCasino => c != null);

  const slugById = new Map<string, string>();
  const slugByName = new Map<string, string>();
  for (const c of casinos) {
    slugById.set(c.casinoId, c.slug);
    slugByName.set(c.name.toLowerCase(), c.slug);
  }

  const mapBreakdown = (rows: unknown): HomeCasino[] => {
    if (!Array.isArray(rows)) return [];
    return rows
      .map((row) => normalizeBreakdownRow(row, slugById, slugByName))
      .filter((c): c is HomeCasino => c != null);
  };

  const breakdown30d = mapBreakdown(data.breakdown30d);
  const breakdown7d = mapBreakdown(data.breakdown7d);

  // Enrich casino list volume from 30d breakdown when missing.
  const volumeBySlug = new Map(
    breakdown30d.map((row) => [row.slug, row] as const),
  );
  const enrichedCasinos = casinos.map((casino) => {
    const vol = volumeBySlug.get(casino.slug);
    if (!vol) return casino;
    return {
      ...casino,
      depositVolume: casino.depositVolume || vol.depositVolume,
      depositVolumeChange:
        casino.depositVolumeChange || vol.depositVolumeChange,
      logoUrl: casino.logoUrl ?? vol.logoUrl,
    };
  });

  if (breakdown30d.length === 0 && enrichedCasinos.length === 0) return null;

  return {
    breakdown30d,
    breakdown7d,
    casinos: enrichedCasinos,
  };
}

/** Map `GET /api/reviews/?…` list → `HomeReview[]`. */
export function normalizeReviews(payload: unknown): HomeReview[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.reviews)
      ? data.reviews
      : [];

  return list
    .map((raw): HomeReview | null => {
      if (!isRecord(raw)) return null;
      const id = asString(raw.id);
      const casinoSlug = asString(raw.casinoSlug);
      const casinoName = asString(raw.casinoName);
      if (!id || !casinoSlug) return null;

      const user = isRecord(raw.user) ? raw.user : null;
      const votes = isRecord(raw.votes) ? raw.votes : null;
      const body = asOptionalString(raw.body);
      const title = asOptionalString(raw.title);

      return {
        id,
        casinoName: casinoName || casinoSlug,
        casinoSlug,
        author: asString(user?.username, "Anonymous"),
        rating: asNumber(raw.rating),
        excerpt: body || title || "",
        createdAt: asString(raw.createdAt, new Date().toISOString()),
        title,
        body,
        votes: votes
          ? {
              helpful: asNumber(votes.helpful),
              notHelpful: asNumber(votes.notHelpful),
            }
          : {
              helpful: asNumber(raw.helpfulCount),
              notHelpful: asNumber(raw.notHelpfulCount),
            },
      };
    })
    .filter((r): r is HomeReview => r != null);
}

/** Map `GET /api/leaderboard/current` → `LeaderboardPayload`. */
export function normalizeLeaderboard(
  payload: unknown,
): LeaderboardPayload | null {
  const data = unwrapData(payload);
  if (!isRecord(data) || !Array.isArray(data.entries)) return null;

  const entries: LeaderboardEntry[] = data.entries
    .map((raw, index): LeaderboardEntry | null => {
      if (!isRecord(raw)) return null;
      const username = asString(raw.username, `player-${index + 1}`);
      const rank = asNumber(raw.rank, index + 1);
      const casinoWagers = Array.isArray(raw.casinoWagers)
        ? raw.casinoWagers
            .map((row) => {
              if (!isRecord(row)) return null;
              return {
                casino: asString(row.casino),
                wager: asNumber(row.wager),
              };
            })
            .filter(
              (row): row is { casino: string; wager: number } =>
                row != null && Boolean(row.casino),
            )
        : undefined;

      return {
        rank,
        userId: asString(raw.userId, username),
        username,
        avatarUrl: asOptionalString(raw.avatarUrl),
        wager: asNumber(raw.wager),
        casinos: Array.isArray(raw.casinos)
          ? raw.casinos.map((c) => asString(c)).filter(Boolean)
          : [],
        prize: asOptionalString(raw.prize),
        casinoWagers,
      };
    })
    .filter((e): e is LeaderboardEntry => e != null);

  return { entries };
}

/** Map `GET /api/casinos/:slug/rating` → score entry. */
export function normalizeCasinoRating(
  payload: unknown,
): { totalScore: number } | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;
  if (data.totalScore == null) return null;
  const totalScore = asNumber(data.totalScore, Number.NaN);
  if (!Number.isFinite(totalScore)) return null;
  return { totalScore };
}

export function normalizeRatingsMap(
  entries: Array<{ slug: string; rating: { totalScore: number } | null }>,
): RatingsMap {
  const map: RatingsMap = {};
  for (const entry of entries) {
    if (entry.rating) map[entry.slug] = entry.rating;
  }
  return map;
}

/**
 * Complaints fields — only accept payloads that actually include dispute stats.
 * Current `/api/analytics/global-stats` returns deposit analytics instead.
 */
export function normalizeComplaintStats(
  payload: unknown,
): ComplaintGlobalStats | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;
  if (data.totalDisputes == null && data.resolved == null) return null;

  return {
    totalDisputes: asNumber(data.totalDisputes),
    resolved: asNumber(data.resolved),
    fundsRecoveredUsd: asNumber(data.fundsRecoveredUsd),
    avgResolutionHours:
      data.avgResolutionHours == null && data.avgResponseHours == null
        ? null
        : asNumber(data.avgResolutionHours ?? data.avgResponseHours),
  };
}

/**
 * Normalize live SSE codes or REST `/api/codes` rows → `CodeDropOffer`.
 * SSE shape (reference): `{ code, casino, casinoSlug, claims, value, wagerRequirement, createdAt }`
 * REST shape: `{ code, casinoName, casinoSlug, numberOfClaims, codeValue, wagerRequirement, createdAt }`
 */
export function normalizeCodeDrop(
  raw: unknown,
  index = 0,
): CodeDropOffer | null {
  if (!isRecord(raw)) return null;

  const code = asString(raw.code).trim();
  if (!code) return null;

  const casinoName = asString(raw.casinoName || raw.casino).trim() || "Casino";
  const casinoSlug =
    asString(raw.casinoSlug).trim() || slugifyName(casinoName);
  const wagerReq = asNumber(raw.wagerRequirement ?? raw.wagerReq);
  const codeValue = asNumber(raw.value ?? raw.codeValue);
  const totalClaims = asNumber(raw.claims ?? raw.numberOfClaims ?? raw.totalClaims);

  return {
    id: asString(raw.id, `${casinoSlug}:${code}:${index}`),
    code,
    casinoName,
    casinoSlug,
    casinoLogoUrl: `/logos/codebanners/${casinoSlug}.png`,
    offerTitle: asString(raw.offerTitle) || formatCodeBonusTitle(codeValue),
    offerIcon: asString(raw.offerIcon, "🎁") || "🎁",
    totalClaims,
    wagerReq,
    value: asString(raw.valueLabel) || formatPer1kValue(codeValue, wagerReq),
    createdAt: asString(raw.createdAt, new Date().toISOString()),
  };
}

export function normalizeCodeDrops(payload: unknown): CodeDropOffer[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.codes)
      ? data.codes
      : [];

  return list
    .map((row, i) => normalizeCodeDrop(row, i))
    .filter((row): row is CodeDropOffer => row != null);
}

/** Map feed-recent bet transactions → `LiveBetRow[]`. */
export function normalizeLiveBets(payload: unknown): LiveBetRow[] {
  const root = isRecord(payload) ? payload : null;
  const list = Array.isArray(payload)
    ? payload
    : root && Array.isArray(root.transactions)
      ? root.transactions
      : root && Array.isArray(root.data)
        ? root.data
        : [];

  return list
    .map((raw, index): LiveBetRow | null => {
      if (!isRecord(raw)) return null;
      const casino = asString(raw.casino || raw.casino_slug || raw.casinoSlug);
      const betId = asString(raw.bet_id ?? raw.betId ?? raw.id, String(index));
      if (!casino || !betId) return null;

      return {
        id: asString(raw.id, `${casino}-${betId}`),
        betId,
        casino,
        player: asString(raw.player, "Hidden"),
        game: asString(raw.game || raw.game_raw, "game"),
        betAmountUsd: asNumber(raw.bet_amount_usd ?? raw.betAmountUsd),
        payoutUsd: asNumber(raw.payout_usd ?? raw.payoutUsd),
        multiplier: asNumber(raw.multiplier),
        isWin: Boolean(raw.is_win ?? raw.isWin),
        timestamp: asString(
          raw.bet_time ?? raw.timestamp ?? raw.transaction_date,
          new Date().toISOString(),
        ),
      };
    })
    .filter((row): row is LiveBetRow => row != null);
}

/** Map feed-recent deposit transactions → `DepositFeedRow[]`. */
export function normalizeDepositFeed(payload: unknown): DepositFeedRow[] {
  const root = isRecord(payload) ? payload : null;
  const list = Array.isArray(payload)
    ? payload
    : root && Array.isArray(root.transactions)
      ? root.transactions
      : [];

  return list
    .map((raw): DepositFeedRow | null => {
      if (!isRecord(raw)) return null;
      const txHash = asString(raw.tx_hash ?? raw.txHash);
      const casinoSlug = asString(raw.casino_slug ?? raw.casinoSlug);
      if (!txHash || !casinoSlug) return null;

      return {
        txHash,
        casinoId: asString(raw.casino_id ?? raw.casinoId, casinoSlug),
        casinoName: asString(raw.casino_name ?? raw.casinoName, casinoSlug),
        casinoSlug,
        transactionDate: asString(
          raw.transaction_date ?? raw.transactionDate,
          new Date().toISOString(),
        ),
        chain: asString(raw.chain),
        coin: asString(raw.coin),
        amountUsd: asNumber(raw.amount_usd ?? raw.amountUsd),
      };
    })
    .filter((row): row is DepositFeedRow => row != null);
}
