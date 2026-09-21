import programs from "@/lib/casinos/loyalty-programs.json";
import { casinoRouteSlug } from "@/lib/reviews/format";

export type LoyaltyRank = {
  name: string;
  requirement: number;
  levelUpBonus?: number;
};

export type LoyaltyProgram = {
  name: string;
  currency: string;
  ranks: LoyaltyRank[];
};

export type LoyaltyTierLabel = {
  name: string;
  amount: string;
};

const bySlug = programs as Record<string, LoyaltyProgram>;

/** Port of reference `getCasino` (260138). */
export function getCasinoLoyaltyProgram(slug: string): LoyaltyProgram | null {
  const key = casinoRouteSlug(slug.trim()).toLowerCase();
  return bySlug[key] ?? null;
}

/** Port of reference `r` — compact requirement label with currency. */
export function formatLoyaltyRequirement(
  value: number,
  currency: string,
): string {
  const isUsd = currency === "USD" || currency === "USDT";
  const prefix = isUsd ? "$" : "";
  const suffix = isUsd ? "" : ` ${currency}`;

  const formatScaled = (amount: number, divisor: number, unit: string) => {
    const scaled = amount / divisor;
    const text =
      scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
    return `${prefix}${text}${unit}${suffix}`;
  };

  if (value >= 1e9) return formatScaled(value, 1e9, "B");
  if (value >= 1e6) return formatScaled(value, 1e6, "M");
  if (value >= 1e3) return formatScaled(value, 1e3, "K");
  return `${prefix}${value}${suffix}`;
}

/** Port of reference tier grouping inside `BonusSection` (474–704). */
export function buildLoyaltyTierLabels(
  ranks: LoyaltyRank[],
  currency: string,
): LoyaltyTierLabel[] {
  const filtered = ranks.filter((rank) => rank.requirement > 0);
  if (filtered.length === 0) return [];

  const groups: Array<{ base: string; ranks: LoyaltyRank[] }> = [];
  let base = "";
  let bucket: LoyaltyRank[] = [];

  for (const rank of filtered) {
    const normalized = rank.name.replace(/\s+(?:[IVX]+|\d+)$/, "").trim();
    if (normalized !== base && bucket.length > 0) {
      groups.push({ base, ranks: bucket });
      bucket = [];
    }
    base = normalized;
    bucket.push(rank);
  }
  if (bucket.length > 0) {
    groups.push({ base, ranks: bucket });
  }

  return groups.map((group, index) => {
    const low = formatLoyaltyRequirement(group.ranks[0].requirement, currency);
    const next = groups[index + 1];
    if (!next) {
      const amount =
        group.ranks.length === 1 ? low : `${low}+`;
      return { name: group.base, amount };
    }
    const high = formatLoyaltyRequirement(next.ranks[0].requirement, currency);
    return { name: group.base, amount: `${low} – ${high}` };
  });
}
