import gamesData from "@/lib/provably-fair/casino-games-data.json";

export const HIDDEN_CASINOS = new Set<string>(gamesData.hiddenCasinos);

const casinoGames = gamesData.casinoGames as Record<string, string[]>;
const extraGames = gamesData.extraGames as Record<string, string[]>;

/** Port of reference `getCasinoAllGames` (615379). */
export function getCasinoAllGames(casinoId: string): string[] {
  const base = casinoGames[casinoId] ?? [];
  const extra = extraGames[casinoId] ?? [];
  return [...base, ...extra.filter((game) => !base.includes(game))];
}

export const CASINO_GAMES = casinoGames;
