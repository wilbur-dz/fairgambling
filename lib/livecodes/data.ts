/** Live Codes page types — mirrors `GET /api/codes` rows. */

export type LiveCode = {
  id: string;
  code: string;
  casinoName: string;
  casinoSlug: string;
  casinoLogoUrl: string | null;
  telegramChannel: string | null;
  numberOfClaims: number;
  wagerRequirement: number;
  wagerRequirementTimeframe: string | null;
  codeValue: string;
  duration: number | null;
  startAt: string | null;
  endAt: string | null;
  status: string;
  createdAt: string;
};

export type CodesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CodesListPayload = {
  codes: LiveCode[];
  pagination?: CodesPagination;
  /** From exclusive-codes `meta.gatedCount` (locked rows count). */
  gatedCount?: number;
};

/** Period keys from `GET /api/codes/stats`. */
export type CodesStatsPeriod = "24h" | "7d" | "90d";

/** One casino row in `data.byCasino[period]`. */
export type CodesByCasinoRow = {
  casino: string;
  slug: string;
  codes: number;
  totalValue: number;
  avgValue: number;
  claims: number;
  share: number;
};

/** One drop row in `data.biggest[period]`. */
export type CodesBiggestRow = {
  casino: string;
  slug: string;
  code: string;
  value: number;
  claims: number;
  totalPaid: number;
  when: string;
};

/** Normalized `GET /api/codes/stats` payload. */
export type CodesStatsPayload = {
  byCasino: Record<CodesStatsPeriod, CodesByCasinoRow[]>;
  biggest: Record<CodesStatsPeriod, CodesBiggestRow[]>;
};

/** Slim row from `GET /api/casinos` used by the All Casinos filter. */
export type CodeCasino = {
  id: number | string;
  slug: string;
  name: string;
};

export type SupportedCasino = {
  name: string;
  slug: string;
  banner: string;
};

/**
 * Preferred order for All Casinos dropdown (prod LiveCodesView).
 * Unknown slugs sort after; `shock` is forced last.
 */
export const CASINO_FILTER_PREFERRED = [
  "stake",
  "stakeus",
  "shuffle",
  "roobet",
  "rainbet",
  "winna",
  "thrill",
  "goated",
  "razed",
] as const;

export const SUPPORTED_CODE_CASINOS: SupportedCasino[] = [
  { name: "Stake", slug: "stake", banner: "/logos/codebanners/stake.png" },
  { name: "StakeUS", slug: "stakeus", banner: "/logos/codebanners/stakeus.png" },
  { name: "Shuffle", slug: "shuffle", banner: "/logos/codebanners/shuffle.png" },
  {
    name: "ShuffleUS",
    slug: "shuffleus",
    banner: "/logos/codebanners/shuffleus.png",
  },
  { name: "Goated", slug: "goated", banner: "/logos/codebanners/goated.png" },
  { name: "Razed", slug: "razed", banner: "/logos/codebanners/razed.png" },
  { name: "Roobet", slug: "roobet", banner: "/logos/codebanners/roobet.png" },
  { name: "Rainbet", slug: "rainbet", banner: "/logos/codebanners/rainbet.png" },
  { name: "Gamba", slug: "gamba", banner: "/logos/codebanners/gamba.png" },
  { name: "Thrill", slug: "thrill", banner: "/logos/codebanners/thrill.png" },
  { name: "Winna", slug: "winna", banner: "/logos/codebanners/winna.png" },
  { name: "Dicey", slug: "dicey", banner: "/logos/codebanners/dicey.svg" },
  { name: "Degen", slug: "degen", banner: "/logos/codebanners/degen.svg" },
];

export const HIGH_ROLLER_WAGER_MIN = 20_000;
export const LIVECODES_DISPLAY_LIMIT = 14;
