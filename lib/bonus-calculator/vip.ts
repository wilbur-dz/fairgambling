import type { GameType } from "@/lib/bonus-calculator/data";
import { LEVEL_UP_GAME_MULT } from "@/lib/bonus-calculator/data";
import vipCasinosJson from "@/lib/bonus-calculator/vip-casinos.json";

export type VipRank = {
  name: string;
  requirement: number | null;
  levelUpBonus?: number;
};

export type VipCasino = {
  name: string;
  type: string;
  currency: string;
  xpPerDollar: number;
  sportsMultiplier: number;
  ranks: VipRank[];
  bonusRates?: unknown;
  rankBonusRates?: unknown;
  vipOverview?: unknown;
};

export type VipCasinoMap = Record<string, VipCasino>;

/** Static fallback when `GET /api/casinos/vip-levels` returns empty/unavailable. */
export const STATIC_VIP_CASINOS = vipCasinosJson as VipCasinoMap;

export function getStaticVipCasino(slug: string) {
  return STATIC_VIP_CASINOS[slug] ?? null;
}

export type LevelUpBonusRow = {
  name: string;
  bonus: number;
  status: "achieved" | "target" | "future";
};

export type RankGroup = {
  baseName: string;
  suffixes: string[];
  ranks: VipRank[];
};

export function effectiveXp(wager: number, gameType: GameType) {
  return wager * (LEVEL_UP_GAME_MULT[gameType] ?? 1);
}

export function currentRankIndex(ranks: VipRank[], xp: number) {
  let idx = -1;
  for (let i = 0; i < ranks.length; i++) {
    const req = ranks[i].requirement;
    if (req == null) continue;
    if (xp >= req) idx = i;
    else break;
  }
  return idx;
}

export function levelUpBonusRows(
  ranks: VipRank[],
  currentIdx: number,
  targetIdx: number,
): { rows: LevelUpBonusRow[]; totalToEarn: number } {
  const rows = ranks
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => r.levelUpBonus != null)
    .map(({ r, idx }) => ({
      name: r.name,
      bonus: r.levelUpBonus as number,
      status:
        idx <= currentIdx
          ? ("achieved" as const)
          : idx <= targetIdx
            ? ("target" as const)
            : ("future" as const),
    }));

  let totalToEarn = 0;
  if (currentIdx >= 0 && targetIdx > currentIdx) {
    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      totalToEarn += ranks[i]?.levelUpBonus ?? 0;
    }
  }
  return { rows, totalToEarn };
}

/** Group consecutive numbered ranks (e.g. Platinum I–VI) for the timeline. */
export function groupRanks(ranks: VipRank[]): RankGroup[] {
  const groups: RankGroup[] = [];
  for (const rank of ranks) {
    const m = rank.name.match(/^(.+?)\s*(\d+|I{1,3}|IV|V|VI)$/i);
    const baseName = m ? m[1].trim() : rank.name;
    const suffix = m ? m[2] : "";
    const last = groups[groups.length - 1];
    if (last && last.baseName === baseName) {
      last.suffixes.push(suffix);
      last.ranks.push(rank);
    } else {
      groups.push({ baseName, suffixes: [suffix], ranks: [rank] });
    }
  }

  const out: RankGroup[] = [];
  for (const g of groups) {
    if (g.ranks.length <= 6) out.push(g);
    else {
      for (let i = 0; i < g.ranks.length; i += 6) {
        out.push({
          baseName: g.baseName,
          suffixes: g.suffixes.slice(i, i + 6),
          ranks: g.ranks.slice(i, i + 6),
        });
      }
    }
  }
  return out;
}

export function groupLabel(group: RankGroup) {
  return group.suffixes.some((s) => s !== "")
    ? `${group.baseName} ${group.suffixes.join(", ")}`
    : group.ranks[0].name;
}
