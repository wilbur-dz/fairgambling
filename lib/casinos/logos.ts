/** Slugs that ship local SVGs under `/logos/casinos/{theme}/`. */
const KNOWN_LOGO_FILES = new Set([
  "500casino",
  "bcgame",
  "betfury",
  "blockbet",
  "chipsgg",
  "cloudbet",
  "coincasino",
  "degen",
  "duel",
  "duelbits",
  "gamba",
  "gamdom",
  "goated",
  "metawin",
  "rainbet",
  "razed",
  "rollbit",
  "roobet",
  "shuffle",
  "shuffleus",
  "solcasino",
  "stake",
  "stake-s",
  "stakeus",
  "thrill",
  "whaleio",
  "winna",
  "yeet",
]);

const SLUG_ALIASES: Record<string, string> = {
  "500-casino": "500casino",
  "bc-game": "bcgame",
  "bc.game": "bcgame",
  bcgame: "bcgame",
  "chips-gg": "chipsgg",
  "chips.gg": "chipsgg",
  "coin-casino": "coincasino",
  "coincasino.io": "coincasino",
  "shuffle-us": "shuffleus",
  "stake-us": "stakeus",
  "whale-io": "whaleio",
  "whale.io": "whaleio",
};

const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  bcgame: "BC.Game",
  "bc.game": "BC.Game",
  stakeus: "StakeUS",
  shuffleus: "ShuffleUS",
};

/** Brands that prefer the light tile asset on light surfaces. */
const LIGHT_SURFACE_TILES = new Set([
  "acebet",
  "cloudbet",
  "coincasino",
  "dicey",
  "qzino",
  "shock",
  "shuffleus",
  "spartans",
  "toshibet",
]);

const DARK_PLATE_TILES = new Set(["goated"]);

export type CasinoLogoTheme = "light" | "dark";
export type CasinoLogoPair = { light: string; dark: string };

export function casinoNameToSlug(name: string): string {
  const key = name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "");
  return SLUG_ALIASES[key] ?? key;
}

export function casinoDisplayName(name: string): string {
  if (!name) return name;
  const override =
    DISPLAY_NAME_OVERRIDES[name.toLowerCase().trim()] ??
    DISPLAY_NAME_OVERRIDES[casinoNameToSlug(name)];
  if (override) return override;
  if (name === name.toLowerCase() && /[a-z]/.test(name)) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name;
}

/** Port of reference `getCasinoLogoUrl` for locally hosted casino marks. */
export function getCasinoLogoUrl(
  slug: string,
  theme: CasinoLogoTheme = "light",
): string | null {
  if (!slug || (theme !== "light" && theme !== "dark")) return null;
  const file = normalizeLogoFile(slug);
  if (!file) return null;
  return `/logos/casinos/${theme}/${file}.svg`;
}

export function getCasinoLogoPair(
  slugOrName: string,
  options?: { withBg?: boolean; analyticsStakeS?: boolean },
): CasinoLogoPair | null {
  const { withBg = false, analyticsStakeS = false } = options ?? {};
  let file = normalizeLogoFile(slugOrName);
  if (!file) return null;
  if (analyticsStakeS && file === "stake") file = "stake-s";
  if (!KNOWN_LOGO_FILES.has(file) && file !== "stake-s") return null;
  const folderLight = withBg ? "light-bg" : "light";
  const folderDark = withBg ? "dark-bg" : "dark";
  return {
    light: `/logos/casinos/${folderLight}/${file}.svg`,
    dark: `/logos/casinos/${folderDark}/${file}.svg`,
  };
}

export function surfaceTile(
  pair: CasinoLogoPair,
  slugOrName: string,
  lightSurface: boolean,
): string {
  const file = normalizeLogoFile(slugOrName) ?? "";
  return lightSurface && LIGHT_SURFACE_TILES.has(file) ? pair.light : pair.dark;
}

export function tileNeedsDarkPlate(slugOrName: string): boolean {
  const file = normalizeLogoFile(slugOrName) ?? "";
  return DARK_PLATE_TILES.has(file);
}

function normalizeLogoFile(slugOrName: string): string | null {
  if (!slugOrName) return null;
  const slug = casinoNameToSlug(slugOrName);
  const aliased = SLUG_ALIASES[slug] ?? slug;
  if (KNOWN_LOGO_FILES.has(aliased)) return aliased;
  return null;
}
