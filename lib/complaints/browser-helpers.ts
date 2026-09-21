import type { BreakdownRow } from "@/lib/casinos/data";
import type { CasinoComplaintBreakdownRow } from "@/lib/complaints/types";

export const COMPLAINTS_BROWSER_PAGE_SIZE = 7;

const DOMAIN_SUFFIX = /\.(com|io|gg|fun|net|org)$/i;

/** Match reference slug/name compact key (`[-.\\s]+` removed). */
export function compactCasinoKey(value: string): string {
  return value.toLowerCase().replace(/[-.\s]+/g, "");
}

function findMarketVolume(
  slug: string,
  market: BreakdownRow[],
): number {
  const slugLower = slug.toLowerCase();
  const compact = compactCasinoKey(slug);
  const match =
    market.find((row) => row.casinoId.toLowerCase() === slugLower) ??
    market.find((row) => compactCasinoKey(row.casinoName) === compact) ??
    market.find(
      (row) =>
        compactCasinoKey(row.casinoName.replace(DOMAIN_SUFFIX, "")) === compact,
    );
  return match?.depositVolume ?? -1;
}

/** Sort casino filter options by 30D deposit volume, then complaint count (reference ComplaintsBrowser). */
export function sortCasinosForComplaintFilters(
  casinos: CasinoComplaintBreakdownRow[],
  market: BreakdownRow[],
): CasinoComplaintBreakdownRow[] {
  return casinos
    .filter((row) => row.total > 0)
    .map((row) => ({ row, vol: findMarketVolume(row.slug, market) }))
    .sort((a, b) => b.vol - a.vol || b.row.total - a.row.total)
    .map((item) => item.row);
}
