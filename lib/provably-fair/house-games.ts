import type { CasinoMeta } from "@/lib/casinos/data";
import {
  CASINO_GAMES,
  getCasinoAllGames,
} from "@/lib/provably-fair/casino-games-config";

const SLUG_ALIASES: Record<string, string> = {
  "rock-paper-scissors": "rps",
  coinflip: "flip",
  tower: "dragon-tower",
  "dragon-tower": "dragon-tower",
  "castle-roulette": "castle-roulette",
  "video-poker": "video-poker",
  "groomers-van": "groomers-van",
  "prime-dice": "primedice",
  "scarab-spin": "scarab-spin",
  "blue-samurai": "blue-samurai",
  "tome-of-life": "tome-of-life",
  "chicken-cross": "chicken-cross",
  "high-striker": "high-striker",
  "risky-click": "risky-click",
  "lamb-chop": "lamb-chop",
};

const knownGames = new Set(
  Object.keys(CASINO_GAMES).flatMap((id) => getCasinoAllGames(id)),
);

const DEFAULT_REVIEW_GAMES = new Set([
  "dice",
  "limbo",
  "plinko",
  "mines",
  "keno",
  "blackjack",
  "crash",
  "hilo",
  "dragon-tower",
  "roulette",
  "flip",
  "wheel",
  "rps",
  "baccarat",
  "pump",
  "chicken",
  "darts",
]);

const PF_UI_SLUG: Record<string, string> = {
  flip: "coinflip",
  "dragon-tower": "tower",
};

export type HouseGameMeta = {
  slug?: string;
  name?: string;
  imageUrl?: string | null;
};

function normalizeHouseGameSlug(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const normalized = SLUG_ALIASES[trimmed] ?? trimmed;
  return knownGames.has(normalized) ? normalized : null;
}

/** Port of reference `getCasinoVisiblePfGames` / `s` (12726). */
export function getCasinoVisiblePfGames(
  casinoId: string,
  houseGames: HouseGameMeta[] | null | undefined,
  mode: "verifier" | "analyzer" = "verifier",
): string[] {
  const catalog =
    mode === "analyzer"
      ? (CASINO_GAMES[casinoId] ?? [])
      : getCasinoAllGames(casinoId);

  if (!houseGames?.length) {
    return catalog;
  }

  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const game of houseGames) {
    const slug = normalizeHouseGameSlug(game.slug);
    if (!slug || seen.has(slug) || !catalog.includes(slug)) continue;
    seen.add(slug);
    ordered.push(slug);
  }

  return ordered.length > 0 ? ordered : catalog;
}

/** Port of reference `extractHouseGames` (12726). */
export function extractHouseGames(
  meta: CasinoMeta | null | undefined,
): HouseGameMeta[] {
  if (!meta || typeof meta !== "object") return [];
  const list = meta.games?.houseGames;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is HouseGameMeta =>
      !!item &&
      typeof item === "object" &&
      typeof (item as HouseGameMeta).slug === "string",
  );
}

/** Port of reference `getCasinoReviewPagePfGames` (12726). */
export function getCasinoReviewPagePfGames(
  casinoId: string,
  houseGames: HouseGameMeta[] | null | undefined,
): string[] {
  const visible = getCasinoVisiblePfGames(casinoId, houseGames, "verifier");
  if (houseGames?.length) {
    return visible;
  }
  return visible.filter((game) => DEFAULT_REVIEW_GAMES.has(game));
}

/** Port of reference `pfGameToUiSlug` (12726). */
export function pfGameToUiSlug(gameSlug: string): string {
  return PF_UI_SLUG[gameSlug] ?? gameSlug;
}

/** Port of reference `getHouseGameImageUrl` (12726). */
export function getHouseGameImageUrl(
  houseGames: HouseGameMeta[] | null | undefined,
  pfGameSlug: string,
): string | null | undefined {
  return houseGames?.find(
    (game) => normalizeHouseGameSlug(game.slug) === pfGameSlug,
  )?.imageUrl;
}

/** SVG file names under `/public/casino-games/` (reference `h` map in ProvablyFairGames). */
export const PF_GAME_ICON_ALIASES: Record<string, string> = {
  "dragon-tower": "tower",
  rps: "rock_paper_scissors",
  hilo: "hilo",
};

/** Port of reference `parseHouseGameRtp` (12726). */
export function parseHouseGameRtp(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Port of reference `parseHouseGameMaxMultiplier` (12726). */
export function parseHouseGameMaxMultiplier(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** Port of reference compact number formatter `u` in HouseGamesSection. */
export function formatHouseGameCompactNumber(value: number): string {
  if (value >= 1e6) {
    const scaled = value / 1e6;
    return `${
      scaled >= 10 ? Math.round(scaled) : scaled.toFixed(1).replace(/\.0$/, "")
    }M`;
  }
  return value.toLocaleString("en-US");
}
