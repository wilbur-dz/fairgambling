import type {
  BreakdownRow,
  CasinoListItem,
  CasinoMeta,
  CasinoRatingDetail,
  CasinosBundle,
  RatingsDetailMap,
} from "@/lib/casinos/data";
import type { RatingCategoryKey } from "@/lib/casinos/categories";

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

function normalizeBreakdownRow(raw: unknown): BreakdownRow | null {
  if (!isRecord(raw)) return null;
  const casinoName = asString(raw.casinoName || raw.name).trim();
  if (!casinoName) return null;
  return {
    casinoId: asString(raw.casinoId ?? raw.id, casinoName),
    casinoName,
    logoUrl: asOptionalString(raw.logoUrl),
    depositVolume: asNumber(raw.depositVolume),
    depositVolumeChange: asNumber(raw.depositVolumeChange),
  };
}

function normalizeMeta(raw: unknown): CasinoMeta | null {
  if (!isRecord(raw)) return null;
  return raw as CasinoMeta;
}

function normalizeCasinoListItem(raw: unknown): CasinoListItem | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name).trim();
  const slug = asString(raw.slug).trim();
  if (!name || !slug) return null;

  return {
    id: asString(raw.id ?? raw.casinoId, slug),
    slug,
    name,
    logoUrl: asOptionalString(raw.logoUrl),
    foundedYear: (() => {
      if (raw.foundedYear == null) return null;
      const n = asNumber(raw.foundedYear, Number.NaN);
      return Number.isFinite(n) ? n : null;
    })(),
    trustScore: asOptionalString(raw.trustScore),
    averageRating:
      raw.averageRating == null ? null : asNumber(raw.averageRating),
    reviewCount: raw.reviewCount == null ? null : asNumber(raw.reviewCount),
    kycStrictness:
      raw.kycStrictness == null ? null : asNumber(raw.kycStrictness),
    meta: normalizeMeta(raw.meta),
  };
}

/** Map `GET /api/analytics/casinos-bundle` → `CasinosBundle`. */
export function normalizeCasinosBundle(
  payload: unknown,
): CasinosBundle | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const mapBreakdown = (rows: unknown): BreakdownRow[] => {
    if (!Array.isArray(rows)) return [];
    return rows
      .map(normalizeBreakdownRow)
      .filter((row): row is BreakdownRow => row != null);
  };

  const casinos = (Array.isArray(data.casinos) ? data.casinos : [])
    .map(normalizeCasinoListItem)
    .filter((c): c is CasinoListItem => c != null);

  const breakdown30d = mapBreakdown(data.breakdown30d);
  const breakdown7d = mapBreakdown(data.breakdown7d);
  const breakdown90d = mapBreakdown(data.breakdown90d);
  const breakdown365d = mapBreakdown(data.breakdown365d);

  if (
    breakdown30d.length === 0 &&
    casinos.length === 0
  ) {
    return null;
  }

  return {
    breakdown30d,
    breakdown7d,
    breakdown90d,
    breakdown365d,
    casinos,
  };
}

/** Map `GET /api/analytics/market-breakdown` → breakdown rows. */
export function normalizeMarketBreakdown(payload: unknown): BreakdownRow[] {
  const data = unwrapData(payload);
  const rows = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.data)
      ? data.data
      : [];
  return rows
    .map(normalizeBreakdownRow)
    .filter((row): row is BreakdownRow => row != null);
}

/** Map `GET /api/casinos?limit=` list payload. */
export function normalizeCasinosList(payload: unknown): CasinoListItem[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.data)
      ? data.data
      : isRecord(data) && Array.isArray(data.casinos)
        ? data.casinos
        : [];
  return list
    .map(normalizeCasinoListItem)
    .filter((c): c is CasinoListItem => c != null);
}

/** Map `GET /api/casinos/:slug/rating` → full rating detail. */
export function normalizeCasinoRatingDetail(
  payload: unknown,
): CasinoRatingDetail | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const categories: CasinoRatingDetail["categories"] = {};
  if (isRecord(data.categories)) {
    for (const [key, value] of Object.entries(data.categories)) {
      if (!isRecord(value) || value.score == null) continue;
      const score = asNumber(value.score, Number.NaN);
      if (!Number.isFinite(score)) continue;
      const subcategories = Array.isArray(value.subcategories)
        ? value.subcategories
            .map((sub) => {
              if (!isRecord(sub)) return null;
              return {
                name: asString(sub.name),
                score: asNumber(sub.score),
                weight:
                  sub.weight == null ? undefined : asString(sub.weight),
                pending: Boolean(sub.pending),
              };
            })
            .filter(
              (s): s is NonNullable<typeof s> => s != null && Boolean(s.name),
            )
        : undefined;
      categories[key as RatingCategoryKey] = { score, subcategories };
    }
  }

  const rake = isRecord(data.estimatedRakeback)
    ? {
        total: asOptionalString(data.estimatedRakeback.total),
        lossback: asOptionalString(data.estimatedRakeback.lossback),
      }
    : null;

  const totalScore =
    data.totalScore == null
      ? null
      : asNumber(data.totalScore, Number.NaN);

  return {
    totalScore: totalScore != null && Number.isFinite(totalScore) ? totalScore : null,
    founded: data.founded == null ? null : asNumber(data.founded),
    license: asOptionalString(data.license),
    estimatedNgr: asOptionalString(data.estimatedNgr),
    estimatedRakeback: rake,
    hideEstimatedRakeback: Boolean(data.hideEstimatedRakeback),
    leaderboardSize30d: asOptionalString(data.leaderboardSize30d),
    raffleSize30d: asOptionalString(data.raffleSize30d),
    avgHouseEdge:
      data.avgHouseEdge == null ? null : asNumber(data.avgHouseEdge),
    provablyFair: asOptionalString(data.provablyFair),
    categories,
  };
}

export function normalizeRatingsDetailMap(
  entries: Array<{ slug: string; rating: CasinoRatingDetail | null }>,
): RatingsDetailMap {
  const map: RatingsDetailMap = {};
  for (const entry of entries) {
    if (entry.rating) map[entry.slug] = entry.rating;
  }
  return map;
}
