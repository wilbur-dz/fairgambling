/** Port of production module 178985 — casino chart / timeline colors */

const CASINO_COLORS: Record<string, string> = {
  Deposits: "#8874ff",
  Withdrawals: "#f05959",
  Moon: "#6b7280",
  moon: "#6b7280",
  stake: "#B0B0B0",
  roobet: "#FACC15",
  rainbet: "#7C3AED",
  shuffle: "#A855F7",
  bcgame: "#166534",
  gamdom: "#4ADE80",
  duel: "#1E3A8A",
  thrill: "#22C55E",
  rollbit: "#F97316",
  stakeus: "#6B7280",
  "500casino": "#EF4444",
  winna: "#60A5FA",
  yeet: "#EC4899",
  betfury: "#991B1B",
  metawin: "#064E3B",
  razed: "#3B82F6",
  duelbits: "#86EFAC",
  whaleio: "#EA580C",
  toshibet: "#FB923C",
  goated: "#A3E635",
  chipsgg: "#7DD3FC",
  blockbet: "#39FF14",
  degen: "#9B59B6",
  spartans: "#C0392B",
  shock: "#00B4D8",
  coincasino: "#F5A623",
  bluff: "#2C3E7B",
  qzino: "#1ABC9C",
  jackpotbet: "#D4A017",
  wagercom: "#E74C3C",
  housebets: "#546E7A",
  cybet: "#0EA5E9",
  flush: "#DC2626",
  betstrike: "#C026D3",
  luckyfun: "#10B981",
  "1win": "#1D4ED8",
  gamba: "#6D28D9",
  dicey: "#2ECC71",
  CSGOEmpire: "#C9CFDB",
  "Key-Drop": "#F5CC76",
  HellCase: "#E8853D",
  "DD DatDrop": "#E0506E",
  Farmskins: "#E6E9EF",
  SkinPort: "#38BDF0",
};

export const FALLBACK_COLORS = [
  "#6366F1",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#F472B6",
  "#22D3EE",
  "#FBBF24",
  "#A78BFA",
  "#34D399",
  "#FB7185",
  "#60A5FA",
  "#FDE047",
] as const;

function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x1000193);
  }
  return hash >>> 0;
}

export function getCasinoColor(slug: string, _fallbackIndex?: number): string {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    CASINO_COLORS[slug] ??
    CASINO_COLORS[normalized] ??
    FALLBACK_COLORS[fnv1aHash(normalized) % FALLBACK_COLORS.length]
  );
}
