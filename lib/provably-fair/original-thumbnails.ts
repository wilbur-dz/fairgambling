import thumbnails from "@/lib/provably-fair/original-thumbnails.json";
import aliases from "@/lib/provably-fair/thumbnail-aliases.json";

type ThumbnailMap = Record<string, Record<string, string>>;

const byCasino = thumbnails as ThumbnailMap;
const globalAliases = aliases.global as Record<string, string>;
const casinoAliases = aliases.casino as Record<string, Record<string, string>>;

/** Port of reference `getOriginalThumbnail` (985450 / 133294). */
export function getOriginalThumbnail(
  casinoSlug: string | null | undefined,
  gameSlug: string | null | undefined,
): string | null {
  if (!casinoSlug || !gameSlug) return null;

  const casinoImages = byCasino[casinoSlug];
  if (!casinoImages) return null;

  const direct = casinoImages[gameSlug];
  if (direct) return direct;

  const globalKey = globalAliases[gameSlug];
  if (globalKey && casinoImages[globalKey]) {
    return casinoImages[globalKey];
  }

  const mapped = casinoAliases[casinoSlug]?.[gameSlug];
  if (mapped && casinoImages[mapped]) {
    return casinoImages[mapped];
  }

  const prefixed = casinoImages[`${casinoSlug}-${gameSlug}`];
  if (prefixed) return prefixed;

  for (const key of Object.keys(casinoImages)) {
    if (key.startsWith(`${gameSlug}-`)) {
      return casinoImages[key];
    }
  }

  return null;
}
