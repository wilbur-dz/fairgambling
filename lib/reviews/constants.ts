import { casinoRouteSlug } from "@/lib/reviews/format";

/** Port of reference `REVIEWABLE_CASINO_SLUGS` + picker order (`ee`). */

export const ALLOWED_CASINO_SLUGS = new Set([
  "stake",
  "roobet",
  "shuffle",
  "bcgame",
  "gamdom",
  "duel",
  "winna",
  "thrill",
  "rollbit",
  "betfury",
  "yeet",
  "500casino",
  "razed",
  "rainbet",
  "duelbits",
  "goated",
  "metawin",
  "whaleio",
  "chipsgg",
  "stake-us",
  "gamba",
  "solcasino",
  "acebet",
  "spartans",
  "degen",
  "cloudbet",
  "wagercom",
  "qzino",
  "betstrike",
  "bluff",
  "cybet",
  "flush",
  "toshibet",
  "jackpotbet",
  "shock",
  "1win",
  "sportsbet",
  "coincasino",
  "housebets",
  "dicey",
]);

export const REVIEWABLE_CASINO_SLUGS = new Set([
  ...ALLOWED_CASINO_SLUGS,
  "shuffleus",
  "shuffle-us",
]);

/** Port of reference `hasVerifyPath`. */
export function hasVerifyPath(slug: string): boolean {
  return REVIEWABLE_CASINO_SLUGS.has(casinoRouteSlug(slug));
}

/** Preferred order in the write-review casino picker. */
export const REVIEW_PICKER_SLUG_ORDER = [
  "stake",
  "roobet",
  "rainbet",
  "shuffle",
  "bcgame",
  "gamdom",
  "duel",
  "winna",
  "thrill",
  "rollbit",
  "betfury",
  "yeet",
  "500casino",
  "razed",
  "gamba",
  "metawin",
  "duelbits",
  "whaleio",
  "goated",
  "chipsgg",
  "solcasino",
  "acebet",
  "spartans",
  "degen",
  "cloudbet",
  "wagercom",
  "qzino",
  "betstrike",
  "bluff",
  "cybet",
  "flush",
  "toshibet",
  "jackpotbet",
  "shock",
  "1win",
  "sportsbet",
  "coincasino",
  "housebets",
  "dicey",
] as const;

export const REVIEW_REWARDS_PAUSED = true;

export const MAX_REVIEW_PRIZE = 100;

export type ReviewPrizeTier = {
  label: string;
  minWager: number;
  vipRank?: string;
  prize: number | null;
  prizeWithCode: number | null;
};

export type ReviewPrizeConfig = {
  slug: string;
  name: string;
  usesVipRank?: boolean;
  tiers: ReviewPrizeTier[];
};

const DEFAULT_TIER_PRIZES: ReviewPrizeTier[] = [
  { label: "$100K Wager", minWager: 100_000, prize: null, prizeWithCode: 25 },
  { label: "$1M Wager", minWager: 1_000_000, prize: null, prizeWithCode: 50 },
  { label: "$10M Wager", minWager: 10_000_000, prize: null, prizeWithCode: 100 },
];

/** Port of reference `REVIEW_PRIZE_CONFIGS` (rewards currently paused). */
export const REVIEW_PRIZE_CONFIGS: ReviewPrizeConfig[] = [
  {
    slug: "stake",
    name: "Stake",
    usesVipRank: true,
    tiers: [
      {
        label: "Gold & above ($100K Wager)",
        minWager: 100_000,
        vipRank: "gold",
        prize: 5,
        prizeWithCode: 10,
      },
      {
        label: "Platinum III & above ($1M Wager)",
        minWager: 1_000_000,
        vipRank: "platinum iii",
        prize: 10,
        prizeWithCode: 30,
      },
      {
        label: "Platinum VI & above ($10M Wager)",
        minWager: 10_000_000,
        vipRank: "platinum vi",
        prize: 20,
        prizeWithCode: 70,
      },
    ],
  },
  {
    slug: "shuffle",
    name: "Shuffle",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: 5, prizeWithCode: 20 },
      { label: "$1M Wager", minWager: 1_000_000, prize: 10, prizeWithCode: 30 },
      { label: "$10M Wager", minWager: 10_000_000, prize: 20, prizeWithCode: 70 },
    ],
  },
  {
    slug: "duel",
    name: "Duel",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: 10, prizeWithCode: null },
      { label: "$1M Wager", minWager: 1_000_000, prize: 20, prizeWithCode: null },
      { label: "$10M Wager", minWager: 10_000_000, prize: 40, prizeWithCode: null },
    ],
  },
  {
    slug: "bcgame",
    name: "BC.GAME",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: null, prizeWithCode: 10 },
      { label: "$1M Wager", minWager: 1_000_000, prize: 5, prizeWithCode: 20 },
      { label: "$10M Wager", minWager: 10_000_000, prize: 10, prizeWithCode: 30 },
    ],
  },
  {
    slug: "winna",
    name: "Winna",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: 10, prizeWithCode: 25 },
      { label: "$1M Wager", minWager: 1_000_000, prize: 20, prizeWithCode: 50 },
      { label: "$10M Wager", minWager: 10_000_000, prize: 40, prizeWithCode: 100 },
    ],
  },
  {
    slug: "thrill",
    name: "Thrill",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: null, prizeWithCode: 25 },
      { label: "$1M Wager", minWager: 1_000_000, prize: null, prizeWithCode: 50 },
      { label: "$10M Wager", minWager: 10_000_000, prize: null, prizeWithCode: 100 },
    ],
  },
  { slug: "goated", name: "Goated", tiers: DEFAULT_TIER_PRIZES },
  { slug: "gamba", name: "Gamba", tiers: DEFAULT_TIER_PRIZES },
  {
    slug: "yeet",
    name: "Yeet",
    tiers: [
      { label: "$100K Wager", minWager: 100_000, prize: null, prizeWithCode: 25 },
      { label: "$1M Wager", minWager: 1_000_000, prize: null, prizeWithCode: 37.5 },
      { label: "$10M Wager", minWager: 10_000_000, prize: null, prizeWithCode: 75 },
    ],
  },
];

export const CASINO_ACCENT_COLORS: Record<string, string> = {
  stake: "#1475e1",
  shuffle: "#7c3aed",
  roobet: "#facc15",
  rainbet: "#1e3a8a",
  duel: "#10b981",
  bcgame: "#22c55e",
  winna: "#3b82f6",
  shuffleus: "#7c3aed",
  stakeus: "#71717a",
  rollbit: "#ef4444",
  thrill: "#1e1b4b",
  goated: "#10b981",
  razed: "#2563eb",
  gamba: "#10b981",
  yeet: "#ec4899",
  gamdom: "#0ea5e9",
  betfury: "#f97316",
  "500casino": "#dc2626",
  solcasino: "#14b8a6",
  chipsgg: "#06b6d4",
  whaleio: "#3b82f6",
  metawin: "#a855f7",
  duelbits: "#1d4ed8",
};
