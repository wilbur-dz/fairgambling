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
  poker: "CoinPoker",
  coinpoker: "CoinPoker",
  betpanda: "Betpanda",
  "22bit": "22Bit",
  "22bet": "22Bet",
  wagercom: "Wager",
  wager: "Wager",
  degencom: "Degen",
  flushcom: "Flush",
  flush: "Flush",
  coinsgame: "Coins.Game",
  betpandacasino: "Betpanda",
  reelsio: "Reels.io",
  degencity: "Degencity",
  bitsler: "Bitsler",
  duckdice: "DuckDice",
  dustbit: "Dustbit",
  cybet: "Cybet",
  myprize: "MyPrize",
  damble: "Damble",
  bitfortune: "BitFortune",
  cryptocasino: "Crypto Casino",
  metawinus: "MetaWinUS",
  moonroll: "Moonroll",
  "7tcasino": "7T Casino",
  bluffcom: "Bluff",
  jackpotbet: "Jackpot.bet",
  jack: "Jack",
  luckyfun: "Lucky.fun",
  housebets: "House Bets",
  betstrike: "BetStrike",
  solpump: "SolPump",
  solpot: "SolPot",
  degencoinflip: "Degen Coinflip",
  collectorcrypt: "Collector Crypt",
  packdraw: "Packdraw",
  csgoempire: "CSGOEmpire",
  phygitals: "Phygitals",
  hypedrop: "HypeDrop",
  csgogem: "CSGOGem",
  clashgg: "Clashgg",
  raingg: "Raingg",
  csgoroll: "CSGORoll",
  skinrave: "SkinRave",
  flipgg: "FlipGG",
  csgowin: "CSGOWin",
  krushgg: "Krushgg",
  upgrader: "Upgrader",
  packygg: "Packygg",
};

const remoteLogoRegistry: Record<string, string> = {};

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

export function knownCasinoDisplayName(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  const key = name.toLowerCase().trim();
  return (
    DISPLAY_NAME_OVERRIDES[key] ??
    DISPLAY_NAME_OVERRIDES[casinoNameToSlug(name)]
  );
}

export function casinoDisplayName(name: string): string {
  if (!name) return name;
  const override = knownCasinoDisplayName(name);
  if (override) return override;
  if (name === name.toLowerCase() && /[a-z]/.test(name)) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name;
}

export function registerRemoteCasinoLogos(
  logos: Record<string, string> | null | undefined,
): void {
  if (!logos) return;
  for (const [slug, url] of Object.entries(logos)) {
    if (typeof url === "string" && /^https:\/\//.test(url)) {
      remoteLogoRegistry[slug.toLowerCase()] = url;
    }
  }
}

export function isOwnCdnLogoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const cdn = new URL("https://cdn.fairgambling.com");
    const prefix = `${cdn.pathname.replace(/\/$/, "")}/casino-logos/`;
    return (
      parsed.origin === cdn.origin && parsed.pathname.startsWith(prefix)
    );
  } catch {
    return false;
  }
}

function remoteLogoFor(slugOrName: string): string | null {
  const slug = casinoNameToSlug(slugOrName);
  return remoteLogoRegistry[slug.toLowerCase()] ?? null;
}

/** Port of reference `getCasinoLogoUrl` for locally hosted casino marks. */
export function getCasinoLogoUrl(
  slug: string,
  theme: CasinoLogoTheme = "light",
): string | null {
  if (!slug || (theme !== "light" && theme !== "dark")) return null;
  const remote = remoteLogoFor(slug);
  if (remote) return remote;
  const file = normalizeLogoFile(slug);
  if (!file) return null;
  return `/logos/casinos/${theme}/${file}.svg`;
}

export function getCasinoLogoPair(
  slugOrName: string,
  options?: { withBg?: boolean; analyticsStakeS?: boolean },
): CasinoLogoPair | null {
  const { withBg = false, analyticsStakeS = false } = options ?? {};
  const remote = remoteLogoFor(slugOrName);
  if (remote) return { light: remote, dark: remote };

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
