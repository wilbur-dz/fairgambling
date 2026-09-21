/**
 * Types, mocks, and row-merge helpers for the Casinos (Ranking) page.
 * Mirrors reference `useCasinoOverviewData` row model.
 */

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_WEIGHTS,
  CODE_FEED_SLUGS,
  LICENSE_IMAGES,
  normalizeProviderId,
  type RatingCategoryKey,
} from "@/lib/casinos/categories";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";

export type BreakdownRow = {
  casinoId: string;
  casinoName: string;
  logoUrl?: string | null;
  depositVolume: number;
  depositVolumeChange: number;
};

export type CasinoMetaOverview = {
  license?: string;
  sportsbook?: string;
  totalSlots?: number;
  avgVigSports?: number | null;
  houseGameCount?: number;
  totalProviders?: number;
  avgHouseGameRtp?: number;
  hasSeedAnalyzer?: boolean;
  hasCodeFeed?: boolean;
  provablyFair?: string | boolean;
  bonusRating?: number;
  supportedChains?: string[];
  supportedCoins?: string[];
};

/** Nested meta blobs used by ranking + compare (API shape varies). */
export type CasinoMetaFieldMap = Record<string, unknown>;

export type CasinoMetaProviderGame = {
  name?: string;
  rtp?: number | string | null;
  maxBet?: number | string | null;
};

export type CasinoMetaProvider = {
  id: string;
  name?: string;
  games?: CasinoMetaProviderGame[];
};

export type CasinoMetaHouseGame = {
  slug?: string;
  name?: string;
  imageUrl?: string | null;
  rtp?: number | null;
  houseEdge?: number | null;
  maxMultiplier?: number | null;
};

export type CasinoMeta = {
  overview?: CasinoMetaOverview;
  fairnessRtp?: CasinoMetaFieldMap & {
    provablyFairSystem?: string;
    avgHouseGameRtp?: number;
  };
  financial?: CasinoMetaFieldMap;
  bonus?: CasinoMetaFieldMap;
  support?: CasinoMetaFieldMap;
  compliance?: CasinoMetaFieldMap & {
    kycLevel?: string;
    restrictedCountries?: string[];
  };
  responsibleGambling?: CasinoMetaFieldMap & {
    selfExclusion?: string;
  };
  security?: CasinoMetaFieldMap;
  games?: {
    providers?: CasinoMetaProvider[];
    houseGames?: CasinoMetaHouseGame[];
  };
};

export type CasinoListItem = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  foundedYear?: number | null;
  trustScore?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  kycStrictness?: number | null;
  meta?: CasinoMeta | null;
};

export type CasinosBundle = {
  breakdown30d: BreakdownRow[];
  breakdown7d: BreakdownRow[];
  breakdown90d: BreakdownRow[];
  breakdown365d: BreakdownRow[];
  casinos: CasinoListItem[];
};

export type RatingCategory = {
  score: number;
  pending?: boolean;
  subcategories?: Array<{
    name: string;
    score: number;
    weight?: string;
    pending?: boolean;
  }>;
};

export type CasinoRatingDetail = {
  totalScore: number | null;
  founded?: number | null;
  license?: string | null;
  estimatedNgr?: string | null;
  estimatedRakeback?: { total?: string | null; lossback?: string | null } | null;
  hideEstimatedRakeback?: boolean;
  leaderboardSize30d?: string | null;
  raffleSize30d?: string | null;
  avgHouseEdge?: number | null;
  provablyFair?: string | null;
  sportsEdgeVig?: number | null;
  trustpilot?: { score: number; reviewCount: number } | null;
  casinoGuruFeedback?: string | null;
  casinoGuruReviewCount?: number | null;
  casinoGuruUnresolved?: number | null;
  bitcointalkUnresolved?: number | null;
  categories: Partial<Record<RatingCategoryKey, RatingCategory>>;
};

export type RatingsDetailMap = Record<string, CasinoRatingDetail>;

export type ProvablyFairLevel = "Provably Fair" | "Semi-Fair" | "Not Fair";
export type KycLevel = "No KYC" | "Light KYC" | "Full KYC";
export type RgLevel = "Comprehensive" | "Standard" | "Minimal";

export type OverviewHouseGame = {
  gameId: string;
  rtp: number | null;
  houseEdge: number | null;
  maxMultiplier: number | null;
};

export type OverviewCasino = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  rank: number;
  founded: number | null;
  depositVolume30d: string;
  depositVolume7d: string;
  depositVolume90d: string;
  depositVolume365d: string;
  depositVolumeChange: number;
  _rawDepositVolume: number;
  _rawDepositVolume7d: number;
  _rawDepositVolume90d: number;
  _rawDepositVolume365d: number;
  estimatedNgr: string | null;
  userReviews: number;
  reviewCount: number;
  fgRating: number;
  fgPending: boolean;
  license: { name: string; icon: string };
  numOriginals: number;
  provablyFair: ProvablyFairLevel | "Unknown";
  avgHouseEdge: number | null;
  avgVigSports: number | null;
  numSlots: number;
  sportsbook: { name: string; hasOwn: boolean };
  hasSeedAnalyzer: boolean;
  bonusRating: number;
  estRakeback: number;
  estRakebackStr: string | null;
  estLossback: number;
  estLossbackStr: string | null;
  hasCodeFeed: boolean;
  leaderboardSize: string | null;
  kyc: KycLevel | "Unknown";
  vpnFriendly: boolean;
  responsibleGambling: RgLevel;
  providers: string[];
  slotGameData: Record<
    string,
    Record<string, { rtp: number | null; maxBet: number | null }>
  >;
  totalSlots: number;
  totalProviders: number;
  houseGames: OverviewHouseGame[];
  _ratingData: CasinoRatingDetail | null;
  _meta: CasinoMeta | null;
};

export type OverviewFilters = {
  noKyc: boolean;
  provablyFair: boolean;
  hasSportsbook: boolean;
  vpnFriendly: boolean;
  minFgRating: number;
  minDepositVolume: number;
  minRakeback: number;
  providers: string[];
  license: string[];
  notRestrictedIn: string;
};

export const DEFAULT_OVERVIEW_FILTERS: OverviewFilters = {
  noKyc: false,
  provablyFair: false,
  hasSportsbook: false,
  vpnFriendly: false,
  minFgRating: 0,
  minDepositVolume: 0,
  minRakeback: 0,
  providers: [],
  license: [],
  notRestrictedIn: "",
};

export function formatDepositVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function lookupCasinoRating(
  slug: string,
  map?: RatingsDetailMap | null,
): CasinoRatingDetail | null {
  if (!map) return null;
  return map[slug] ?? null;
}

export function hasCasinoRatingEntry(
  slug: string,
  map?: RatingsDetailMap | null,
): boolean {
  return lookupCasinoRating(slug, map) != null;
}

export function slugsMissingFromRatingsMap(
  slugs: string[],
  map?: RatingsDetailMap | null,
): string[] {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (!map || Object.keys(map).length === 0) return unique;
  return unique.filter((slug) => map[slug] == null);
}

function parseProvablyFair(raw: unknown): ProvablyFairLevel | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  if (t.includes("semi") || t.includes("partial")) return "Semi-Fair";
  if (t.includes("not fair") || t === "none" || t === "no") return "Not Fair";
  if (t.includes("provably fair") || t === "full" || t === "yes") {
    return "Provably Fair";
  }
  return null;
}

function deriveProvablyFair(args: {
  ratingOverride?: string | null;
  metaOverview?: string | boolean;
  metaFairnessSystem?: string;
  ratingSubcategoryScore?: number | null;
}): ProvablyFairLevel | "Unknown" {
  const fromRating = parseProvablyFair(args.ratingOverride);
  if (fromRating) return fromRating;

  const overview =
    typeof args.metaOverview === "boolean"
      ? args.metaOverview
        ? "Provably Fair"
        : null
      : parseProvablyFair(args.metaOverview);
  if (overview) return overview;

  const fromSystem = parseProvablyFair(args.metaFairnessSystem);
  if (fromSystem) return fromSystem;

  const score = args.ratingSubcategoryScore;
  if (typeof score === "number" && Number.isFinite(score)) {
    if (score >= 7) return "Provably Fair";
    if (score >= 4) return "Semi-Fair";
    return "Not Fair";
  }
  return "Unknown";
}

function deriveKyc(
  metaKycLevel: string | undefined,
  kycStrictness: number | null | undefined,
): KycLevel | "Unknown" {
  const fromMeta = metaKycLevel?.trim();
  if (fromMeta === "No KYC" || fromMeta === "Light KYC" || fromMeta === "Full KYC") {
    return fromMeta;
  }
  if (typeof kycStrictness === "number") {
    if (kycStrictness >= 2) return "Full KYC";
    if (kycStrictness >= 1) return "Light KYC";
    return "No KYC";
  }
  return "Unknown";
}

function deriveRg(selfExclusion: string | undefined): RgLevel {
  const t = (selfExclusion ?? "").toLowerCase();
  if (t.includes("high") || t.includes("full") || t.includes("comprehensive")) {
    return "Comprehensive";
  }
  if (t.includes("low") || t.includes("minimal") || t.includes("none")) {
    return "Minimal";
  }
  return "Standard";
}

function licenseIcon(name: string): string {
  const n = name.toLowerCase();
  if (n === "curacao" || n.includes("cura")) return "curacao";
  if (n === "anjouan") return "anjouan";
  if (n === "tobique" || n === "kahnawake") return "tobique";
  if (n === "malta") return "malta";
  if (n.includes("uk")) return "uk";
  return "other";
}

function parseMoneyLabel(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function provablyFairSubcategoryScore(
  rating: CasinoRatingDetail | null,
): number | null {
  const sub = rating?.categories?.fairnessRtp?.subcategories?.find(
    (s) => s.name === "Provably Fair System",
  );
  if (!sub || sub.pending) return null;
  return typeof sub.score === "number" ? sub.score : null;
}

function nameKey(name: string): string {
  return name.toLowerCase().replace(/[.\s]/g, "");
}

function buildSlotAndProviders(meta: CasinoMeta | null | undefined): {
  providers: string[];
  slotGameData: OverviewCasino["slotGameData"];
} {
  const providers: string[] = [];
  const slotGameData: OverviewCasino["slotGameData"] = {};
  for (const provider of meta?.games?.providers ?? []) {
    if (!provider?.id) continue;
    const id = normalizeProviderId(provider.id);
    providers.push(id);
    if (!Array.isArray(provider.games)) continue;
    const games: Record<string, { rtp: number | null; maxBet: number | null }> =
      {};
    for (const game of provider.games) {
      if (!game?.name) continue;
      const rtp =
        typeof game.rtp === "number"
          ? game.rtp
          : typeof game.rtp === "string"
            ? parseFloat(game.rtp)
            : null;
      const maxBet =
        typeof game.maxBet === "number"
          ? game.maxBet
          : typeof game.maxBet === "string"
            ? parseFloat(String(game.maxBet).replace(/,/g, ""))
            : null;
      games[game.name] = {
        rtp: Number.isFinite(rtp as number) ? (rtp as number) : null,
        maxBet: Number.isFinite(maxBet as number) ? (maxBet as number) : null,
      };
    }
    slotGameData[id] = games;
  }
  return { providers, slotGameData };
}

const HOUSE_GAME_IDS = [
  "mines",
  "dice",
  "plinko",
  "limbo",
  "blackjack",
  "keno",
  "crash",
  "hilo",
  "tower",
  "coinflip",
  "wheel",
  "roulette",
  "chicken",
  "baccarat",
  "video-poker",
] as const;

function buildHouseGames(meta: CasinoMeta | null | undefined): OverviewHouseGame[] {
  const list = meta?.games?.houseGames ?? [];
  return HOUSE_GAME_IDS.map((gameId) => {
    const found = list.find((g) => g.slug === gameId);
    return {
      gameId,
      rtp: found?.rtp ?? null,
      houseEdge: found?.houseEdge ?? null,
      maxMultiplier: found?.maxMultiplier ?? null,
    };
  });
}

export function buildOverviewCasino(
  casino: CasinoListItem,
  ratingsMap: RatingsDetailMap,
  breakdownMaps: {
    d30: Map<string, BreakdownRow>;
    d7: Map<string, BreakdownRow>;
    d90: Map<string, BreakdownRow>;
    d365: Map<string, BreakdownRow>;
  },
): OverviewCasino {
  const rating = lookupCasinoRating(casino.slug, ratingsMap);
  const meta = casino.meta ?? null;
  const overview = meta?.overview ?? {};
  const fairness = meta?.fairnessRtp ?? {};
  const compliance = meta?.compliance ?? {};
  const games = meta?.games ?? {};
  const rg = meta?.responsibleGambling ?? {};

  const licenseName =
    rating?.license ?? overview.license ?? "Unknown";
  const license = {
    name: licenseName,
    icon: licenseIcon(licenseName),
  };

  const sportsbookRaw = overview.sportsbook || "None";
  const hasOwn = sportsbookRaw === "In-House";

  const { providers, slotGameData } = buildSlotAndProviders(meta);
  const houseGames = buildHouseGames(meta);

  const avgHouseGameRtp = overview.avgHouseGameRtp || fairness.avgHouseGameRtp || 0;
  const avgHouseEdge =
    rating?.avgHouseEdge ??
    (avgHouseGameRtp > 0
      ? parseFloat((100 - avgHouseGameRtp).toFixed(2))
      : null);

  const key = nameKey(casino.name);
  const b30 = breakdownMaps.d30.get(key);
  const b7 = breakdownMaps.d7.get(key);
  const b90 = breakdownMaps.d90.get(key);
  const b365 = breakdownMaps.d365.get(key);

  const hideRb = Boolean(rating?.hideEstimatedRakeback);
  const rakeTotal = hideRb ? null : rating?.estimatedRakeback?.total ?? null;
  const rakeLoss = hideRb ? null : rating?.estimatedRakeback?.lossback ?? null;

  const lb = parseMoneyLabel(rating?.leaderboardSize30d);
  const raffle = parseMoneyLabel(rating?.raffleSize30d);
  const leaderboardSize =
    lb == null && raffle == null
      ? null
      : `$${((lb ?? 0) + (raffle ?? 0)).toLocaleString("en-US")}`;

  const fgRating =
    rating?.totalScore ??
    (casino.trustScore ? 10 * parseFloat(casino.trustScore) : 0);

  return {
    id: String(casino.id),
    slug: casino.slug,
    name: casino.name,
    logoUrl:
      casino.logoUrl ||
      getCasinoLogoUrl(casino.slug, "light") ||
      `/logos/casinos/light/${casino.slug}.svg`,
    rank: 0,
    founded: rating?.founded ?? casino.foundedYear ?? null,
    depositVolume30d: b30 ? formatDepositVolume(b30.depositVolume) : "—",
    depositVolume7d: b7 ? formatDepositVolume(b7.depositVolume) : "$0",
    depositVolume90d: b90 ? formatDepositVolume(b90.depositVolume) : "$0",
    depositVolume365d: b365 ? formatDepositVolume(b365.depositVolume) : "$0",
    depositVolumeChange: b30?.depositVolumeChange ?? 0,
    _rawDepositVolume: b30?.depositVolume ?? 0,
    _rawDepositVolume7d: b7?.depositVolume ?? 0,
    _rawDepositVolume90d: b90?.depositVolume ?? 0,
    _rawDepositVolume365d: b365?.depositVolume ?? 0,
    estimatedNgr: rating?.estimatedNgr ?? null,
    userReviews: casino.averageRating || 0,
    reviewCount: casino.reviewCount || 0,
    fgRating: Number.isFinite(fgRating) ? fgRating : 0,
    fgPending: rating != null && rating.totalScore == null,
    license,
    numOriginals: overview.houseGameCount || 0,
    provablyFair: deriveProvablyFair({
      ratingOverride: rating?.provablyFair,
      metaOverview: overview.provablyFair,
      metaFairnessSystem: fairness.provablyFairSystem,
      ratingSubcategoryScore: provablyFairSubcategoryScore(rating),
    }),
    avgHouseEdge,
    avgVigSports: overview.avgVigSports ?? null,
    numSlots: overview.totalSlots || 0,
    sportsbook: {
      name: hasOwn ? casino.name : sportsbookRaw,
      hasOwn,
    },
    hasSeedAnalyzer: Boolean(overview.hasSeedAnalyzer),
    bonusRating:
      rating?.categories?.bonus?.score ?? overview.bonusRating ?? 0,
    estRakeback: rakeTotal ? parseFloat(rakeTotal) || 0 : 0,
    estRakebackStr: rakeTotal,
    estLossback: rakeLoss
      ? parseFloat(rakeLoss.replace(/^~/, "")) || 0
      : 0,
    estLossbackStr: rakeLoss,
    hasCodeFeed: CODE_FEED_SLUGS.has(casino.slug) || Boolean(overview.hasCodeFeed),
    leaderboardSize,
    kyc: deriveKyc(compliance.kycLevel, casino.kycStrictness),
    vpnFriendly: false,
    responsibleGambling: deriveRg(rg.selfExclusion),
    providers,
    slotGameData,
    totalSlots: overview.totalSlots || 0,
    totalProviders: overview.totalProviders || games.providers?.length || 0,
    houseGames,
    _ratingData: rating,
    _meta: meta,
  };
}

export function indexBreakdown(
  rows: BreakdownRow[],
): Map<string, BreakdownRow> {
  const map = new Map<string, BreakdownRow>();
  for (const row of rows) {
    map.set(nameKey(row.casinoName), row);
  }
  return map;
}

function parseNgr(value: string | null | undefined): number {
  if (!value) return 0;
  const match = value.replace(/[$,]/g, "").match(/^([\d.]+)\s*([BMK])?/i);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  if (!Number.isFinite(n)) return 0;
  const unit = (match[2] || "").toUpperCase();
  if (unit === "B") return n * 1e9;
  if (unit === "M") return n * 1e6;
  if (unit === "K") return n * 1e3;
  return n;
}

function pfRank(level: string): number {
  if (level === "Provably Fair") return 3;
  if (level === "Semi-Fair") return 2;
  if (level === "Not Fair") return 1;
  return 0;
}

function kycRank(level: string): number {
  if (level === "Full KYC") return 3;
  if (level === "Light KYC") return 2;
  if (level === "No KYC") return 1;
  return 0;
}

function rgRank(level: string): number {
  if (level === "Comprehensive") return 3;
  if (level === "Standard") return 2;
  if (level === "Minimal") return 1;
  return 0;
}

export function sortOverviewCasinos(
  rows: OverviewCasino[],
  sortKey: string,
  sortDirection: "asc" | "desc",
): OverviewCasino[] {
  const sorted = [...rows].sort((a, b) => {
    if (a.fgPending !== b.fgPending) return a.fgPending ? 1 : -1;
    let left: string | number = 0;
    let right: string | number = 0;

    switch (sortKey) {
      case "name":
        left = a.name;
        right = b.name;
        break;
      case "founded":
        left = a.founded ?? -1;
        right = b.founded ?? -1;
        break;
      case "depositVolume30d":
        left = a._rawDepositVolume;
        right = b._rawDepositVolume;
        break;
      case "userReviews":
        left = a.userReviews;
        right = b.userReviews;
        break;
      case "fgRating":
        left = a.fgRating;
        right = b.fgRating;
        break;
      case "numOriginals":
        left = a.numOriginals;
        right = b.numOriginals;
        break;
      case "avgHouseEdge":
        left = a.avgHouseEdge ?? -1;
        right = b.avgHouseEdge ?? -1;
        break;
      case "numSlots":
        left = a.numSlots;
        right = b.numSlots;
        break;
      case "bonusRating":
        left = a.bonusRating;
        right = b.bonusRating;
        break;
      case "estRakeback":
        left = a.estRakeback;
        right = b.estRakeback;
        break;
      case "estLossback":
        left = a.estLossback;
        right = b.estLossback;
        break;
      case "hasCodeFeed":
        left = Number(a.hasCodeFeed);
        right = Number(b.hasCodeFeed);
        break;
      case "leaderboardRaffle":
        left =
          parseFloat((a.leaderboardSize || "0").replace(/[$,]/g, "")) || 0;
        right =
          parseFloat((b.leaderboardSize || "0").replace(/[$,]/g, "")) || 0;
        break;
      case "estimatedNgr":
        left = parseNgr(a.estimatedNgr);
        right = parseNgr(b.estimatedNgr);
        break;
      case "license":
        left = a.license?.name || "";
        right = b.license?.name || "";
        break;
      case "provablyFair":
        left = pfRank(a.provablyFair);
        right = pfRank(b.provablyFair);
        break;
      case "totalProviders":
        left = a.totalProviders || 0;
        right = b.totalProviders || 0;
        break;
      case "sportsbook":
        left = a.sportsbook?.name || "";
        right = b.sportsbook?.name || "";
        break;
      case "hasSeedAnalyzer":
        left = Number(a.hasSeedAnalyzer);
        right = Number(b.hasSeedAnalyzer);
        break;
      case "kyc":
        left = kycRank(a.kyc);
        right = kycRank(b.kyc);
        break;
      case "responsibleGambling":
        left = rgRank(a.responsibleGambling);
        right = rgRank(b.responsibleGambling);
        break;
      case "avgVigSports":
        left = a.avgVigSports ?? 0;
        right = b.avgVigSports ?? 0;
        break;
      default: {
        if (sortKey.startsWith("game_")) {
          const id = sortKey.replace("game_", "");
          const la = a.houseGames?.find((g) => g.gameId === id)?.rtp ?? null;
          const lb = b.houseGames?.find((g) => g.gameId === id)?.rtp ?? null;
          if (la == null && lb == null) return 0;
          if (la == null) return 1;
          if (lb == null) return -1;
          left = la;
          right = lb;
          break;
        }
        return 0;
      }
    }

    if (typeof left === "string" && typeof right === "string") {
      return right.localeCompare(left);
    }
    return (right as number) - (left as number);
  });

  const ranked = sorted.map((row, index) => ({ ...row, rank: index + 1 }));
  if (sortKey && sortDirection === "asc") {
    return [...ranked].sort((a, b) => {
      if (a.fgPending !== b.fgPending) return a.fgPending ? 1 : -1;
      return b.rank - a.rank;
    });
  }
  return ranked;
}

export function filterOverviewCasinos(
  rows: OverviewCasino[],
  filters: OverviewFilters,
): OverviewCasino[] {
  return rows.filter((row) => {
    if (filters.noKyc && row.kyc !== "No KYC") return false;
    if (filters.provablyFair && row.provablyFair !== "Provably Fair") {
      return false;
    }
    if (filters.hasSportsbook && row.sportsbook.name === "None") return false;
    if (filters.vpnFriendly && !row.vpnFriendly) return false;
    if (filters.minFgRating > 0 && row.fgRating < filters.minFgRating) {
      return false;
    }
    if (
      filters.minDepositVolume > 0 &&
      row._rawDepositVolume < filters.minDepositVolume
    ) {
      return false;
    }
    if (filters.minRakeback > 0 && row.estRakeback < filters.minRakeback) {
      return false;
    }
    if (
      filters.license.length > 0 &&
      !filters.license.includes(row.license.name)
    ) {
      return false;
    }
    if (
      filters.notRestrictedIn &&
      (row._meta?.compliance?.restrictedCountries || []).some((c) =>
        c.toLowerCase().includes(filters.notRestrictedIn.toLowerCase()),
      )
    ) {
      return false;
    }
    return true;
  });
}

export function categoryBarsForCasino(casino: OverviewCasino) {
  const rating = casino._ratingData;
  return CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    weight: `${CATEGORY_WEIGHTS[key]}%`,
    score: rating?.categories?.[key]?.score ?? 0,
  }));
}

export function licenseImageSrc(icon: string): string | null {
  return LICENSE_IMAGES[icon] ?? null;
}

/** Offline fallback when APIs fail. */
export const MOCK_CASINOS_BUNDLE: CasinosBundle = {
  breakdown30d: [
    {
      casinoId: "stake",
      casinoName: "Stake",
      depositVolume: 2_190_000_000,
      depositVolumeChange: 9.4,
    },
    {
      casinoId: "roobet",
      casinoName: "Roobet",
      depositVolume: 180_000_000,
      depositVolumeChange: 4.2,
    },
    {
      casinoId: "shuffle",
      casinoName: "Shuffle",
      depositVolume: 95_000_000,
      depositVolumeChange: 12.1,
    },
    {
      casinoId: "bcgame",
      casinoName: "BC.Game",
      depositVolume: 72_000_000,
      depositVolumeChange: -2.3,
    },
    {
      casinoId: "rainbet",
      casinoName: "Rainbet",
      depositVolume: 41_000_000,
      depositVolumeChange: 18.0,
    },
    {
      casinoId: "thrill",
      casinoName: "Thrill",
      depositVolume: 28_000_000,
      depositVolumeChange: 22.0,
    },
    {
      casinoId: "goated",
      casinoName: "Goated",
      depositVolume: 19_000_000,
      depositVolumeChange: 8.0,
    },
    {
      casinoId: "winna",
      casinoName: "Winna",
      depositVolume: 15_000_000,
      depositVolumeChange: 5.5,
    },
  ],
  breakdown7d: [],
  breakdown90d: [],
  breakdown365d: [],
  casinos: [
    mockCasino("stake", "Stake", 2017, "Provably Fair", "Full KYC", "Curacao", 31, 3775, 107, true, true, 4.6, 2100),
    mockCasino("roobet", "Roobet", 2019, "Provably Fair", "Light KYC", "Curacao", 18, 4200, 80, true, true, 4.4, 980),
    mockCasino("shuffle", "Shuffle", 2023, "Provably Fair", "No KYC", "Curacao", 22, 3500, 60, true, true, 4.5, 640),
    mockCasino("bcgame", "BC.Game", 2017, "Semi-Fair", "Light KYC", "Curacao", 25, 8000, 90, false, true, 4.1, 720),
    mockCasino("rainbet", "Rainbet", 2023, "Provably Fair", "No KYC", "Anjouan", 14, 2800, 45, true, true, 4.3, 410),
    mockCasino("thrill", "Thrill", 2024, "Provably Fair", "No KYC", "Anjouan", 12, 2100, 40, true, true, 4.2, 310),
    mockCasino("goated", "Goated", 2023, "Provably Fair", "Light KYC", "Curacao", 16, 3000, 55, true, false, 4.0, 260),
    mockCasino("winna", "Winna", 2023, "Provably Fair", "No KYC", "Curacao", 15, 2600, 48, true, true, 4.1, 290),
  ],
};

function mockCasino(
  slug: string,
  name: string,
  foundedYear: number,
  pf: string,
  kyc: string,
  license: string,
  houseGameCount: number,
  totalSlots: number,
  totalProviders: number,
  hasSeedAnalyzer: boolean,
  hasCodeFeed: boolean,
  averageRating: number,
  reviewCount: number,
): CasinoListItem {
  return {
    id: slug,
    slug,
    name,
    foundedYear,
    trustScore: "8.5",
    averageRating,
    reviewCount,
    kycStrictness: kyc === "Full KYC" ? 2 : kyc === "Light KYC" ? 1 : 0,
    meta: {
      overview: {
        license,
        sportsbook: slug === "stake" ? "In-House" : "Betby",
        totalSlots,
        houseGameCount,
        totalProviders,
        avgHouseGameRtp: 98,
        avgVigSports: 5.5,
        hasSeedAnalyzer,
        hasCodeFeed,
        provablyFair: pf,
        bonusRating: 7,
      },
      fairnessRtp: {
        provablyFairSystem: pf,
        avgHouseGameRtp: 98,
        verificationTool: true,
        seedChange: true,
        seedControl: hasSeedAnalyzer,
        transparencyLink: true,
        rtpDisclosure: true,
        rtpSlotConsistency: true,
      },
      financial: {
        minimumDeposit: "$10",
        minimumWithdrawal: "$20",
        fees: "Network only",
        cancelWithdraw: true,
        withdrawalSpeed: "Instant–1h",
        withdrawalLimit: false,
        publicHotWallet: slug === "stake",
        proofOfReserves: slug === "stake" || slug === "shuffle",
      },
      bonus: {
        instantRakeback: true,
        dailyBonus: true,
        weeklyBonus: true,
        monthlyBonus: slug !== "bcgame",
      },
      support: {
        liveChat: true,
        responseTime: "< 2 min",
        availability247: true,
        languages: ["EN", "ES", "DE"],
        humanOrBot: "Human",
      },
      security: {
        twoFactor: true,
        accountNotifications: true,
        withdrawalConfirmation2fa: true,
      },
      compliance: {
        kycLevel: kyc,
        restrictedCountries: [],
        licenseDetails: license,
        licenseVerificationLink: true,
        geoBlocking: true,
        idVerification: kyc,
        wagerBeforeWithdrawal: false,
      },
      responsibleGambling: {
        selfExclusion: "Standard",
        accessToStats: true,
        gamblingLimits: true,
      },
      games: {
        providers: [
          {
            id: "pragmatic",
            name: "Pragmatic Play",
            games: [
              {
                name: "Gates of Olympus Super Scatter",
                rtp: 96.5,
                maxBet: 500,
              },
            ],
          },
        ],
        houseGames: [
          { slug: "mines", name: "Mines", rtp: 99, houseEdge: 1 },
          { slug: "dice", name: "Dice", rtp: 99, houseEdge: 1 },
          { slug: "plinko", name: "Plinko", rtp: 99, houseEdge: 1 },
          { slug: "crash", name: "Crash", rtp: 97, houseEdge: 3 },
        ],
      },
    },
  };
}

MOCK_CASINOS_BUNDLE.breakdown7d = MOCK_CASINOS_BUNDLE.breakdown30d.map((r) => ({
  ...r,
  depositVolume: Math.round(r.depositVolume * 0.22),
}));
MOCK_CASINOS_BUNDLE.breakdown90d = MOCK_CASINOS_BUNDLE.breakdown30d.map((r) => ({
  ...r,
  depositVolume: Math.round(r.depositVolume * 2.8),
}));
MOCK_CASINOS_BUNDLE.breakdown365d = MOCK_CASINOS_BUNDLE.breakdown30d.map(
  (r) => ({
    ...r,
    depositVolume: Math.round(r.depositVolume * 10),
  }),
);

export const MOCK_RATINGS_DETAIL_MAP: RatingsDetailMap = {
  stake: {
    totalScore: 91.2,
    estimatedNgr: "$1.2B",
    estimatedRakeback: { total: "42.20%", lossback: "6%" },
    leaderboardSize30d: "$2,500,000",
    raffleSize30d: "$500,000",
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 8 + (k === "bonus" ? 0.5 : 0) }]),
    ) as CasinoRatingDetail["categories"],
  },
  roobet: {
    totalScore: 87,
    estimatedRakeback: { total: "28%", lossback: "4%" },
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.5 }]),
    ) as CasinoRatingDetail["categories"],
  },
  shuffle: {
    totalScore: 84,
    estimatedRakeback: { total: "35%", lossback: "5%" },
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.8 }]),
    ) as CasinoRatingDetail["categories"],
  },
  bcgame: {
    totalScore: 81,
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.2 }]),
    ) as CasinoRatingDetail["categories"],
  },
  rainbet: {
    totalScore: 80,
    estimatedRakeback: { total: "40%", lossback: "~8%" },
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.4 }]),
    ) as CasinoRatingDetail["categories"],
  },
  thrill: {
    totalScore: 78,
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.1 }]),
    ) as CasinoRatingDetail["categories"],
  },
  goated: {
    totalScore: 76,
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 6.9 }]),
    ) as CasinoRatingDetail["categories"],
  },
  winna: {
    totalScore: 79,
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { score: 7.3 }]),
    ) as CasinoRatingDetail["categories"],
  },
};
