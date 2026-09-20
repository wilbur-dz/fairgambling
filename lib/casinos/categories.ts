/** Table tabs + games column constants (reference module `839128`). */

export type TableCategoryId =
  | "basicInfo"
  | "gamesInfo"
  | "bonusing"
  | "complianceRG"
  | "games";

export type RatingCategoryKey =
  | "analytics"
  | "fairnessRtp"
  | "financialTransparency"
  | "bonus"
  | "customerSupport"
  | "compliance"
  | "responsibleGambling"
  | "security"
  | "games"
  | "thirdPartyRatings";

export const TABLE_CATEGORIES: { id: TableCategoryId; label: string }[] = [
  { id: "basicInfo", label: "Basic Info" },
  { id: "gamesInfo", label: "Games Info" },
  { id: "bonusing", label: "Bonusing" },
  { id: "complianceRG", label: "Compliance & RG" },
  { id: "games", label: "Games" },
];

export const GRID_SORT_TABS = [
  { id: "fgRating", label: "Rating" },
  { id: "depositVolume30d", label: "Deposit Volume" },
  { id: "userReviews", label: "User Reviews" },
] as const;

export type GridSortKey = (typeof GRID_SORT_TABS)[number]["id"];

export const CATEGORY_ORDER: RatingCategoryKey[] = [
  "analytics",
  "fairnessRtp",
  "financialTransparency",
  "bonus",
  "customerSupport",
  "compliance",
  "responsibleGambling",
  "security",
  "games",
  "thirdPartyRatings",
];

export const CATEGORY_LABELS: Record<RatingCategoryKey, string> = {
  fairnessRtp: "Fairness & RTP",
  analytics: "Analytics",
  financialTransparency: "Financial Transparency",
  bonus: "Bonus",
  customerSupport: "Customer Support",
  compliance: "Compliance",
  responsibleGambling: "Responsible Gambling",
  security: "Security",
  games: "Games",
  thirdPartyRatings: "Third Party Ratings",
};

export const CATEGORY_WEIGHTS: Record<RatingCategoryKey, number> = {
  fairnessRtp: 15,
  analytics: 15,
  financialTransparency: 10,
  bonus: 22,
  customerSupport: 5,
  compliance: 7,
  responsibleGambling: 8,
  security: 4,
  games: 5,
  thirdPartyRatings: 9,
};

export type HouseGameDef = { id: string; name: string };

/** Major house games shown in the Games table columns. */
export const MAJOR_HOUSE_GAMES: HouseGameDef[] = [
  { id: "mines", name: "Mines" },
  { id: "dice", name: "Dice" },
  { id: "plinko", name: "Plinko" },
  { id: "limbo", name: "Limbo" },
  { id: "blackjack", name: "Blackjack" },
  { id: "keno", name: "Keno" },
  { id: "crash", name: "Crash" },
];

export type ProviderGameDef = {
  name: string;
  rtp?: string;
  maxBet?: string;
};

export type MajorGameProvider = {
  id: string;
  name: string;
  shortName: string;
  games: ProviderGameDef[];
};

/** Filtered major providers used by the Games table (reference `majorGameProviders`). */
export const MAJOR_GAME_PROVIDERS: MajorGameProvider[] = [
  {
    id: "pragmatic",
    name: "Pragmatic Play",
    shortName: "PP",
    games: [
      {
        name: "Gates of Olympus Super Scatter",
        rtp: "96.5%",
        maxBet: "100,000,000",
      },
      { name: "Sweet Bonanza 1000", rtp: "96.53%", maxBet: "50,000,000" },
      { name: "Sugar Rush 1000", rtp: "96.53%", maxBet: "30,000,000" },
      { name: "Gates of Olympus 1000", rtp: "96.5%", maxBet: "30,000,000" },
      { name: "Brick House Bonanza", rtp: "96.5%", maxBet: "20,000,000" },
    ],
  },
  {
    id: "hacksaw",
    name: "Hacksaw Gaming",
    shortName: "HG",
    games: [
      { name: "Wanted Dead or a Wild", rtp: "96.38%", maxBet: "25,000,000" },
      { name: "Le Bandit", rtp: "96.34%", maxBet: "20,000,000" },
      { name: "Le Cowboy", rtp: "96.28%", maxBet: "37,500,000" },
      { name: "Duel at Dawn", rtp: "96.3%", maxBet: "30,000,000" },
      { name: "Spinman", rtp: "96.23%", maxBet: "20,000,000" },
    ],
  },
  {
    id: "bgaming",
    name: "BGaming",
    shortName: "BG",
    games: [{ name: "Merge Up 2", rtp: "98%", maxBet: "300,000" }],
  },
  {
    id: "nolimit",
    name: "Nolimit City",
    shortName: "NLC",
    games: [{ name: "Duck Hunters", rtp: "96.05%", maxBet: "24,000,000" }],
  },
];

/** License icon paths (reference `LICENSE_IMAGES`). */
export const LICENSE_IMAGES: Record<string, string> = {
  curacao: "/logos/licenses/curacao.svg",
  anjouan: "/logos/licenses/anjouan.svg",
  tobique: "/logos/licenses/tobique.svg",
  malta: "/logos/licenses/malta.svg",
  uk: "/logos/licenses/uk.svg",
};

/** Slugs that show a Code Feed link in overview. */
export const CODE_FEED_SLUGS = new Set([
  "stake",
  "shuffle",
  "winna",
  "thrill",
  "roobet",
  "razed",
  "rainbet",
  "goated",
  "gamba",
]);

export function badgeLabel(value: string): string {
  return value === "Unknown" ? "—" : value;
}

export function normalizeProviderId(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  const aliases: Record<string, string> = {
    pragmaticplay: "pragmatic",
    "pragmaticplaylive": "pragmatic-live",
    nolimitcity: "nolimit",
    hacksawgaming: "hacksaw",
    evolutiongaming: "evolution",
    pushgaming: "pushgaming",
    "play'ngo": "playngo",
    playngo: "playngo",
    shadylady: "shadylady",
    backseatgaming: "backseat",
    backseat: "backseat",
  };
  return aliases[key] ?? key;
}
