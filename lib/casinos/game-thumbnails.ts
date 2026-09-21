/**
 * Slot art for compare labels. Uses CDN (already allowed in next.config);
 * casino / license marks stay on `/logos`.
 */
const GAME_THUMBNAILS: Record<string, string> = {
  "Gates of Olympus Super Scatter":
    "https://cdn.fairgambling.com/game-images/pragmatic-play-gates-of-olympus-super-scatter.webp",
  "Sweet Bonanza 1000":
    "https://cdn.fairgambling.com/game-images/pragmatic-play-sweet-bonanza-1000.webp",
  "Sugar Rush 1000":
    "https://cdn.fairgambling.com/game-images/pragmatic-play-sugar-rush-1000.webp",
  "Gates of Olympus 1000":
    "https://cdn.fairgambling.com/game-images/pragmatic-play-gates-of-olympus-1000.webp",
  "Brick House Bonanza":
    "https://cdn.fairgambling.com/game-images/pragmatic-play-brick-house-bonanza.webp",
  "Wanted Dead or a Wild":
    "https://cdn.fairgambling.com/game-images/hacksaw-wanted-dead-or-a-wild.webp",
  "Le Bandit":
    "https://cdn.fairgambling.com/game-images/hacksaw-le-bandit.webp",
  "Le Cowboy":
    "https://cdn.fairgambling.com/game-images/hacksaw-le-cowboy.webp",
  "Duel at Dawn":
    "https://cdn.fairgambling.com/game-images/hacksaw-duel-at-dawn.webp",
  Spinman: "https://cdn.fairgambling.com/game-images/hacksaw-spinman.webp",
  "Merge Up 2":
    "https://cdn.fairgambling.com/game-images/bgaming-merge-up-2.webp",
  "Duck Hunters":
    "https://cdn.fairgambling.com/game-images/nolimit-duck-hunters.webp",
};

/** Port of reference `getGameThumbnail(gameName)`. */
export function getGameThumbnail(gameName: string): string | null {
  if (!gameName) return null;
  return GAME_THUMBNAILS[gameName] ?? null;
}
