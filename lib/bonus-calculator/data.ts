export type BonusPeriod = "weekly" | "monthly";
export type GameType = "slots" | "originals" | "sports";
export type ProfitLoss = "profit" | "loss";

export type BonusCasinoRates = {
  slug: string;
  name: string;
  weeklyRakeback: number;
  monthlyRakeback: number;
  weeklyLossback: number;
  monthlyLossback: number;
  hasWeekly?: boolean;
  hasMonthly?: boolean;
};

/** House-edge factors used for expected-loss rakeback. */
export const HOUSE_EDGE: Record<GameType, number> = {
  slots: 0.035,
  originals: 0.01,
  sports: 0.03,
};

/**
 * Static Bonus Calculator casino rates (bundled in production JS — no API).
 */
export const BONUS_CASINOS: BonusCasinoRates[] = [
  {
    slug: "stake",
    name: "Stake",
    weeklyRakeback: 6.5,
    monthlyRakeback: 3.5,
    weeklyLossback: 6,
    monthlyLossback: 0,
  },
  {
    slug: "roobet",
    name: "Roobet",
    weeklyRakeback: 2,
    monthlyRakeback: 2,
    weeklyLossback: 2,
    monthlyLossback: 2.27,
  },
  {
    slug: "shuffle",
    name: "Shuffle",
    weeklyRakeback: 9,
    monthlyRakeback: 6,
    weeklyLossback: 5.5,
    monthlyLossback: 3.2,
  },
  {
    slug: "rainbet",
    name: "Rainbet",
    weeklyRakeback: 0,
    monthlyRakeback: 1,
    weeklyLossback: 1,
    monthlyLossback: 2,
  },
  {
    slug: "bcgame",
    name: "BC.Game",
    weeklyRakeback: 10,
    monthlyRakeback: 5,
    weeklyLossback: 5,
    monthlyLossback: 1,
  },
  {
    slug: "winna",
    name: "Winna",
    weeklyRakeback: 5,
    monthlyRakeback: 9,
    weeklyLossback: 5,
    monthlyLossback: 5,
  },
  {
    slug: "thrill",
    name: "Thrill",
    weeklyRakeback: 6.5,
    monthlyRakeback: 8.5,
    weeklyLossback: 2,
    monthlyLossback: 2.3,
  },
  {
    slug: "cloudbet",
    name: "Cloudbet",
    weeklyRakeback: 0,
    monthlyRakeback: 5,
    weeklyLossback: 2,
    monthlyLossback: 1,
  },
  {
    slug: "razed",
    name: "Razed",
    weeklyRakeback: 2.3,
    monthlyRakeback: 3,
    weeklyLossback: 0,
    monthlyLossback: 3,
  },
  {
    slug: "yeet",
    name: "Yeet",
    weeklyRakeback: 5,
    monthlyRakeback: 0,
    weeklyLossback: 2,
    monthlyLossback: 0,
    hasMonthly: false,
  },
  {
    slug: "metawin",
    name: "MetaWin",
    weeklyRakeback: 0,
    monthlyRakeback: 5,
    weeklyLossback: 0,
    monthlyLossback: 5,
    hasWeekly: false,
  },
  {
    slug: "duelbits",
    name: "Duelbits",
    weeklyRakeback: 4,
    monthlyRakeback: 5,
    weeklyLossback: 0,
    monthlyLossback: 0,
  },
  {
    slug: "chipsgg",
    name: "Chips.gg",
    weeklyRakeback: 0,
    monthlyRakeback: 5,
    weeklyLossback: 2,
    monthlyLossback: 1,
  },
];

export const BONUS_CASINO_BY_SLUG = Object.fromEntries(
  BONUS_CASINOS.map((c) => [c.slug, c]),
) as Record<string, BonusCasinoRates>;

/** Preferred Select Casino order (known rates first). */
const BONUS_DROPDOWN_PREFERRED = BONUS_CASINOS.map((c) => c.slug);

/**
 * Dropdown options from `GET /api/casinos?limit=100`.
 * Falls back to static `BONUS_CASINOS` when catalog is empty.
 * Known-rate casinos sort first; rates still come from `BONUS_CASINO_BY_SLUG`.
 */
export function buildBonusCasinoOptions(
  catalog: Array<{ slug: string; name: string }>,
): Array<{ slug: string; name: string }> {
  if (catalog.length === 0) {
    return BONUS_CASINOS.map((c) => ({ slug: c.slug, name: c.name }));
  }
  const rank = (slug: string) => {
    const i = BONUS_DROPDOWN_PREFERRED.indexOf(slug);
    return i === -1 ? 1000 : i;
  };
  return [...catalog]
    .sort((a, b) => {
      const d = rank(a.slug) - rank(b.slug);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    })
    .map((c) => ({ slug: c.slug, name: c.name }));
}

/** Rates for slug — static table, or zeros when casino is API-only. */
export function getBonusRates(
  slug: string,
  name?: string,
): BonusCasinoRates {
  const known = BONUS_CASINO_BY_SLUG[slug];
  if (known) return known;
  return {
    slug,
    name: name?.trim() || slug,
    weeklyRakeback: 0,
    monthlyRakeback: 0,
    weeklyLossback: 0,
    monthlyLossback: 0,
  };
}

export const PERIOD_TABS = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
] as const;

export const GAME_TYPE_TABS = [
  { id: "slots", label: "Slots" },
  { id: "originals", label: "Originals" },
  { id: "sports", label: "Sports" },
] as const;

/** Level Up calculator — only Stake is selectable in production today. */
export const LEVEL_UP_ENABLED_SLUGS = new Set(["stake"]);

/** Level Up XP multipliers by game type. */
export const LEVEL_UP_GAME_MULT: Record<GameType, number> = {
  slots: 1,
  originals: 1,
  sports: 3,
};
