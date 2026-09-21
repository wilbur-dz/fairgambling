/** Types & mock payloads mirroring FairGambling HomeView data contracts. */

export type HomeCasino = {
  casinoId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  trustScore?: string | null;
  depositVolume: number;
  depositVolumeChange: number;
  averageRating?: number | null;
  reviewCount?: number | null;
};

export type HomeAnalyticsRow = {
  casinoId: string;
  casinoName: string;
  logoUrl?: string | null;
  depositVolume: number;
  depositVolumeChange: number;
  rank: number;
};

export type HomeAnalytics = {
  biggest: HomeAnalyticsRow[];
  trending: HomeAnalyticsRow[];
  newcomers: HomeAnalyticsRow[];
  totalCasinos: number;
};

export type HomeBundle = {
  breakdown30d: HomeCasino[];
  breakdown7d: HomeCasino[];
  casinos: HomeCasino[];
};

export type HomeReview = {
  id: string;
  casinoName: string;
  casinoSlug: string;
  author: string;
  rating: number;
  excerpt: string;
  createdAt: string;
  title?: string | null;
  body?: string | null;
  votes?: {
    helpful?: number;
    notHelpful?: number;
  } | null;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  wager: number;
  casinos: string[];
  prize?: string | null;
  casinoWagers?: { casino: string; wager: number }[];
};

export type LeaderboardPayload = {
  entries: LeaderboardEntry[];
};

export type CasinoRating = {
  totalScore: number;
};

export type RatingsMap = Record<string, CasinoRating>;

export type ComplaintGlobalStats = {
  totalDisputes: number;
  resolved: number;
  fundsRecoveredUsd: number;
  avgResolutionHours: number | null;
};

export type CodeDropOffer = {
  id: string;
  code: string;
  casinoName: string;
  casinoSlug: string;
  casinoLogoUrl?: string | null;
  offerTitle: string;
  offerIcon: string;
  totalClaims: number;
  wagerReq: number;
  /** Preformatted value-per-1k label, e.g. `$0.40 per 1k Wager`. */
  value: string;
  createdAt: string;
};

export type HomeTool = {
  id: string;
  title: string;
  href: string;
  image: string;
  jsNav?: boolean;
};

export type ContentTeaser = {
  id: string;
  title: string;
  category: string;
  cover?: string | null;
};

export type LiveBetRow = {
  id: string;
  betId: string;
  casino: string;
  player: string;
  game: string;
  betAmountUsd: number;
  payoutUsd: number;
  multiplier: number;
  isWin: boolean;
  timestamp: string;
};

export type DepositFeedRow = {
  txHash: string;
  casinoId: string;
  casinoName: string;
  casinoSlug: string;
  transactionDate: string;
  chain: string;
  coin: string;
  amountUsd: number;
};

/** Mirrors `GET ${API_URL}/api/analytics/home-bundle` → `data`. */
export const MOCK_HOME_BUNDLE: HomeBundle = {
  breakdown30d: [
    {
      casinoId: "stake",
      name: "Stake",
      slug: "stake",
      trustScore: "9.2",
      depositVolume: 12_400_000,
      depositVolumeChange: 8.4,
    },
    {
      casinoId: "roobet",
      name: "Roobet",
      slug: "roobet",
      trustScore: "8.7",
      depositVolume: 6_200_000,
      depositVolumeChange: 12.1,
    },
    {
      casinoId: "shuffle",
      name: "Shuffle",
      slug: "shuffle",
      trustScore: "8.4",
      depositVolume: 4_100_000,
      depositVolumeChange: -2.3,
    },
    {
      casinoId: "bcgame",
      name: "BC.GAME",
      slug: "bcgame",
      trustScore: "8.1",
      depositVolume: 3_800_000,
      depositVolumeChange: 5.6,
    },
    {
      casinoId: "duel",
      name: "Duel",
      slug: "duel",
      trustScore: "7.9",
      depositVolume: 2_200_000,
      depositVolumeChange: 18.2,
    },
    {
      casinoId: "rainbet",
      name: "Rainbet",
      slug: "rainbet",
      trustScore: "8.0",
      depositVolume: 1_900_000,
      depositVolumeChange: 22.0,
    },
  ],
  breakdown7d: [
    {
      casinoId: "stake",
      name: "Stake",
      slug: "stake",
      depositVolume: 3_100_000,
      depositVolumeChange: 4.2,
    },
    {
      casinoId: "duel",
      name: "Duel",
      slug: "duel",
      depositVolume: 980_000,
      depositVolumeChange: 31.5,
    },
  ],
  casinos: [
    {
      casinoId: "stake",
      name: "Stake",
      slug: "stake",
      trustScore: "9.2",
      depositVolume: 12_400_000,
      depositVolumeChange: 8.4,
      averageRating: 4.8,
      reviewCount: 1240,
    },
    {
      casinoId: "roobet",
      name: "Roobet",
      slug: "roobet",
      trustScore: "8.7",
      depositVolume: 6_200_000,
      depositVolumeChange: 12.1,
      averageRating: 4.5,
      reviewCount: 890,
    },
    {
      casinoId: "shuffle",
      name: "Shuffle",
      slug: "shuffle",
      trustScore: "8.4",
      depositVolume: 4_100_000,
      depositVolumeChange: -2.3,
      averageRating: 4.3,
      reviewCount: 640,
    },
    {
      casinoId: "bcgame",
      name: "BC.GAME",
      slug: "bcgame",
      trustScore: "8.1",
      depositVolume: 3_800_000,
      depositVolumeChange: 5.6,
      averageRating: 4.1,
      reviewCount: 1120,
    },
    {
      casinoId: "rainbet",
      name: "Rainbet",
      slug: "rainbet",
      trustScore: "8.0",
      depositVolume: 1_900_000,
      depositVolumeChange: 22.0,
      averageRating: 4.2,
      reviewCount: 310,
    },
  ],
};

/** Mirrors `GET ${API_URL}/api/casinos/:slug/rating` aggregated map. */
export const MOCK_RATINGS_MAP: RatingsMap = {
  stake: { totalScore: 92 },
  roobet: { totalScore: 87 },
  shuffle: { totalScore: 84 },
  bcgame: { totalScore: 81 },
  rainbet: { totalScore: 80 },
};

/** Mirrors `GET ${API_URL}/api/reviews/?…` latest list. */
export const MOCK_REVIEWS: HomeReview[] = [
  {
    id: "r1",
    casinoName: "Stake",
    casinoSlug: "stake",
    author: "crypto_mike",
    rating: 5,
    excerpt: "Fast withdrawals and solid VIP support.",
    createdAt: "2026-09-19T10:00:00Z",
    votes: { helpful: 12, notHelpful: 1 },
  },
  {
    id: "r2",
    casinoName: "Roobet",
    casinoSlug: "roobet",
    author: "luna_bets",
    rating: 4,
    excerpt: "Great originals, wish limits were higher.",
    createdAt: "2026-09-18T16:20:00Z",
    votes: { helpful: 8, notHelpful: 2 },
  },
  {
    id: "r3",
    casinoName: "Shuffle",
    casinoSlug: "shuffle",
    author: "deal_flow",
    rating: 5,
    excerpt: "Transparent rakeback and clean UX.",
    createdAt: "2026-09-17T09:10:00Z",
    votes: { helpful: 15, notHelpful: 0 },
  },
  {
    id: "r4",
    casinoName: "BC.GAME",
    casinoSlug: "bcgame",
    author: "highroller_x",
    rating: 4,
    excerpt: "Huge game library, KYC was smooth.",
    createdAt: "2026-09-16T21:40:00Z",
    votes: { helpful: 6, notHelpful: 1 },
  },
  {
    id: "r5",
    casinoName: "Rainbet",
    casinoSlug: "rainbet",
    author: "seed_check",
    rating: 5,
    excerpt: "Provably fair tools are easy to verify.",
    createdAt: "2026-09-15T12:05:00Z",
    votes: { helpful: 9, notHelpful: 0 },
  },
  {
    id: "r6",
    casinoName: "Stake",
    casinoSlug: "stake",
    author: "night_owl",
    rating: 4,
    excerpt: "Sportsbook odds are competitive.",
    createdAt: "2026-09-14T08:30:00Z",
    votes: { helpful: 4, notHelpful: 1 },
  },
  {
    id: "r7",
    casinoName: "Duel",
    casinoSlug: "duel",
    author: "edge_finder",
    rating: 5,
    excerpt: "Fresh platform with sharp promotions.",
    createdAt: "2026-09-13T19:15:00Z",
    votes: { helpful: 11, notHelpful: 2 },
  },
  {
    id: "r8",
    casinoName: "Roobet",
    casinoSlug: "roobet",
    author: "table_time",
    rating: 3,
    excerpt: "Live dealer tables get crowded at peak hours.",
    createdAt: "2026-09-12T14:45:00Z",
    votes: { helpful: 3, notHelpful: 4 },
  },
  {
    id: "r9",
    casinoName: "Shuffle",
    casinoSlug: "shuffle",
    author: "cashout_king",
    rating: 5,
    excerpt: "Withdrawals landed in under ten minutes.",
    createdAt: "2026-09-11T11:20:00Z",
    votes: { helpful: 18, notHelpful: 1 },
  },
];

/** Mirrors `GET ${API_URL}/api/leaderboard/current?limit=&offset=`. */
export const MOCK_LEADERBOARD: LeaderboardPayload = {
  entries: [
    {
      rank: 1,
      userId: "u1",
      username: "bok1ca",
      wager: 525_600,
      casinos: ["stake", "shuffle", "rainbet", "thrill"],
      prize: "$3,000",
      casinoWagers: [
        { casino: "stake", wager: 300_000 },
        { casino: "shuffle", wager: 125_600 },
        { casino: "rainbet", wager: 100_000 },
      ],
    },
    {
      rank: 2,
      userId: "u2",
      username: "commandermdro",
      wager: 89_800,
      casinos: ["stake", "winna", "duel"],
      prize: "$1,500",
      casinoWagers: [
        { casino: "stake", wager: 50_000 },
        { casino: "winna", wager: 39_800 },
      ],
    },
    {
      rank: 3,
      userId: "u3",
      username: "addict",
      wager: 86_200,
      casinos: ["roobet", "gamdom"],
      prize: "$1,000",
    },
    {
      rank: 4,
      userId: "u4",
      username: "xxx",
      wager: 83_300,
      casinos: ["stake", "bcgame", "thrill", "rainbet"],
      prize: "$800",
    },
    {
      rank: 5,
      userId: "u5",
      username: "Keno1000",
      wager: 42_200,
      casinos: ["shuffle", "stake"],
      prize: "$700",
    },
    {
      rank: 6,
      userId: "u6",
      username: "edge_hunter",
      wager: 38_400,
      casinos: ["duel", "thrill"],
      prize: "$500",
    },
    {
      rank: 7,
      userId: "u7",
      username: "spin_lab",
      wager: 31_200,
      casinos: ["stake"],
      prize: "$400",
    },
    {
      rank: 8,
      userId: "u8",
      username: "night_roll",
      wager: 28_900,
      casinos: ["rainbet", "shuffle", "winna"],
      prize: "$300",
    },
    {
      rank: 9,
      userId: "u9",
      username: "vault_fox",
      wager: 22_100,
      casinos: ["gamdom"],
      prize: "$200",
    },
    {
      rank: 10,
      userId: "u10",
      username: "lucky_seed",
      wager: 18_500,
      casinos: ["stake", "roobet"],
      prize: "$100",
    },
  ],
};

/** Mirrors `GET ${API_URL}/api/analytics/global-stats?period=`. */
export const MOCK_COMPLAINT_STATS: ComplaintGlobalStats = {
  totalDisputes: 1284,
  resolved: 1104,
  fundsRecoveredUsd: 4_200_000,
  avgResolutionHours: 18,
};

/** Avatar strip brands shown on the Complaints home card (`H`). */
export const COMPLAINT_CASINO_AVATARS = [
  "Stake",
  "Roobet",
  "Rainbet",
  "Shuffle",
  "Duel",
  "Gamdom",
  "1win",
  "BC.GAME",
  "Thrill",
  "Sportsbet.io",
  "Winna",
  "Rollbit",
  "StakeUS",
  "Cloudbet",
  "Yeet",
  "Razed",
  "Dicey",
  "500 Casino",
  "MetaWin",
  "BetFury",
  "SolCasino",
  "Duelbits",
  "Gamba",
  "Degen",
  "Shock",
  "Coincasino",
  "Acebet",
  "Qzino",
  "Toshibet",
  "Spartans",
] as const;

/** Mirrors live codes SSE / `GET ${API_URL}/api/codes` (+ mock fallback). */
export const MOCK_CODE_DROPS: CodeDropOffer[] = [
  {
    id: "1",
    code: "fgUSDC20",
    casinoName: "BetFury",
    casinoSlug: "betfury",
    offerTitle: "20 USDC Bonus",
    offerIcon: "🎁",
    totalClaims: 260,
    wagerReq: 50_000,
    value: "$0.40 per 1k Wager",
    createdAt: new Date(Date.now() - 420_000).toISOString(),
  },
  {
    id: "2",
    code: "fgUSDT10",
    casinoName: "Shuffle",
    casinoSlug: "shuffle",
    offerTitle: "10 USDT Free Play",
    offerIcon: "🎲",
    totalClaims: 142,
    wagerReq: 20_000,
    value: "$0.30 per 1k Wager",
    createdAt: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    id: "3",
    code: "fgSPIN25",
    casinoName: "Sportsbet.io",
    casinoSlug: "sportsbetio",
    offerTitle: "50 USDC Boost",
    offerIcon: "🚀",
    totalClaims: 378,
    wagerReq: 10_000,
    value: "$0.50 per 1k Wager",
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
];

/** Static tool cards used by Explore Our Tools carousel. */
export const HOME_TOOLS: HomeTool[] = [
  {
    id: "stake-stats",
    title: "My Stake Stats",
    href: "/stake-stats",
    image: "/images/tools/StakeStats.png",
  },
  {
    id: "blackjack-trainer",
    title: "Blackjack Trainer",
    href: "/blackjack-trainer",
    image: "/images/tools/BlackjackTrainer.png",
  },
  {
    id: "seed-analyzer",
    title: "My Seed Insights",
    href: "/seed-analyzer",
    image: "/images/tools/ProvablyFair.png",
    jsNav: true,
  },
];

/** CMS section routes (reference `SECTION_PATH`). */
export const SECTION_PATH = {
  "news-posts": "/news",
  guides: "/guides",
  "in-depth": "/spotlight",
  research: "/investigations",
  pulse: "/pulse",
} as const;

/** CMS / SECTION_PATH news & investigations teasers. */
export const MOCK_CONTENT: ContentTeaser[] = [
  {
    id: "inside-bluff-21m-raise",
    title: "Inside Bluff — 743 Real Players.",
    category: "CASINO INVESTIGATION · BLUFF",
    cover: "/research/bluff/bluff-coverimage.png",
  },
  {
    id: "duel-casino-report",
    title: "Duel Casino — A Public Report",
    category: "CASINO TRANSPARENCY · DUEL",
    cover: "/casino-icons/duel.avif",
  },
];

/** Mirrors live activity feeds (`/api/analytics/feed-recent` family). */
export const MOCK_LIVE_BETS: LiveBetRow[] = [
  {
    id: "stake-1001",
    betId: "1001",
    casino: "stake",
    player: "masked_42",
    game: "dice",
    betAmountUsd: 120,
    payoutUsd: 288,
    multiplier: 2.4,
    isWin: true,
    timestamp: "2026-09-20T05:12:08Z",
  },
  {
    id: "roobet-1002",
    betId: "1002",
    casino: "roobet",
    player: "Hidden",
    game: "crash",
    betAmountUsd: 80,
    payoutUsd: 0,
    multiplier: 0.42,
    isWin: false,
    timestamp: "2026-09-20T05:11:44Z",
  },
  {
    id: "shuffle-1003",
    betId: "1003",
    casino: "shuffle",
    player: "nitro_spin",
    game: "mines",
    betAmountUsd: 250,
    payoutUsd: 775,
    multiplier: 3.1,
    isWin: true,
    timestamp: "2026-09-20T05:10:21Z",
  },
  {
    id: "rainbet-1004",
    betId: "1004",
    casino: "rainbet",
    player: "seed_check",
    game: "plinko",
    betAmountUsd: 45.5,
    payoutUsd: 91,
    multiplier: 2.0,
    isWin: true,
    timestamp: "2026-09-20T05:09:03Z",
  },
  {
    id: "bcgame-1005",
    betId: "1005",
    casino: "bcgame",
    player: "Hidden",
    game: "limbo",
    betAmountUsd: 500,
    payoutUsd: 0,
    multiplier: 0.0,
    isWin: false,
    timestamp: "2026-09-20T05:08:17Z",
  },
  {
    id: "duel-1006",
    betId: "1006",
    casino: "duel",
    player: "edge_finder",
    game: "blackjack",
    betAmountUsd: 75,
    payoutUsd: 150,
    multiplier: 2.0,
    isWin: true,
    timestamp: "2026-09-20T05:07:55Z",
  },
  {
    id: "winna-1007",
    betId: "1007",
    casino: "winna",
    player: "table_time",
    game: "dragon-tower",
    betAmountUsd: 33,
    payoutUsd: 99,
    multiplier: 3.0,
    isWin: true,
    timestamp: "2026-09-20T05:06:40Z",
  },
  {
    id: "thrill-1008",
    betId: "1008",
    casino: "thrill",
    player: "cashout_king",
    game: "keno",
    betAmountUsd: 18,
    payoutUsd: 0,
    multiplier: 0.0,
    isWin: false,
    timestamp: "2026-09-20T05:05:12Z",
  },
  {
    id: "gamdom-1009",
    betId: "1009",
    casino: "gamdom",
    player: "orbit_bet",
    game: "hilo",
    betAmountUsd: 210,
    payoutUsd: 420,
    multiplier: 2.0,
    isWin: true,
    timestamp: "2026-09-20T05:04:01Z",
  },
  {
    id: "stake-1010",
    betId: "1010",
    casino: "stake",
    player: "night_owl",
    game: "wheel",
    betAmountUsd: 60,
    payoutUsd: 180,
    multiplier: 3.0,
    isWin: true,
    timestamp: "2026-09-20T05:03:22Z",
  },
];

/** Mock deposit rows for the Deposit Feed tab. */
export const MOCK_DEPOSIT_FEED: DepositFeedRow[] = [
  {
    txHash: "0xabc123def4567890",
    casinoId: "stake",
    casinoName: "Stake",
    casinoSlug: "stake",
    transactionDate: "2026-09-20T05:12:01Z",
    chain: "ethereum",
    coin: "ETH",
    amountUsd: 12_400,
  },
  {
    txHash: "5kq8mN2pLx9R",
    casinoId: "shuffle",
    casinoName: "Shuffle",
    casinoSlug: "shuffle",
    transactionDate: "2026-09-20T05:10:44Z",
    chain: "solana",
    coin: "SOL",
    amountUsd: 3_250.5,
  },
  {
    txHash: "0xbeefcafe001122",
    casinoId: "roobet",
    casinoName: "Roobet",
    casinoSlug: "roobet",
    transactionDate: "2026-09-20T05:09:18Z",
    chain: "bsc",
    coin: "USDT",
    amountUsd: 980,
  },
  {
    txHash: "TXtron998877",
    casinoId: "rainbet",
    casinoName: "Rainbet",
    casinoSlug: "rainbet",
    transactionDate: "2026-09-20T05:07:55Z",
    chain: "tron",
    coin: "USDT-TRC20",
    amountUsd: 1_500,
  },
  {
    txHash: "0xdeadbeef445566",
    casinoId: "bcgame",
    casinoName: "BC.GAME",
    casinoSlug: "bcgame",
    transactionDate: "2026-09-20T05:06:30Z",
    chain: "ethereum",
    coin: "USDC",
    amountUsd: 7_750,
  },
];

export const CASINO_DISPLAY_NAMES: Record<string, string> = {
  stake: "Stake",
  stakeus: "StakeUS",
  roobet: "Roobet",
  shuffle: "Shuffle",
  shuffleus: "ShuffleUS",
  rainbet: "Rainbet",
  bcgame: "BC.GAME",
  duel: "Duel",
  winna: "Winna",
  thrill: "Thrill",
  gamdom: "Gamdom",
  goated: "Goated",
  gamba: "Gamba",
  yeet: "Yeet",
  degen: "Degen",
};

/** Port of reference `formatGameName` (trimmed). */
export function formatGameName(game: string, casino?: string): string {
  if (!game) return "";
  if (casino === "roobet" && game === "chicken") return "Mission Uncrossable";
  if (
    casino === "winna" &&
    (game === "dragon-tower" || game === "dragon_tower" || game === "tower")
  ) {
    return "Pepe Tower";
  }
  const st8 = /^st8:[a-z0-9]+:[a-z0-9]+_(.+)$/i.exec(game);
  const raw = st8 ? st8[1] : game;
  return raw
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/** Compact USD used by live activity feeds. */
export function formatFeedUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(2)}`;
}

export function formatFeedTime(input: string): string {
  try {
    return new Date(input).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Aligns with reference newcomer name set (+ slug variants). */
const NEWCOMER_SLUGS = new Set([
  "duel",
  "degen",
  "gamba",
  "winna",
  "thrill",
  "yeet",
  "solcasino",
  "rainbet",
]);
const NEWCOMER_NAMES = new Set([
  "winna",
  "thrill",
  "yeet",
  "degen",
  "duel",
  "sol casino",
  "solcasino",
  "gamba",
  "rainbet",
]);

function isNewcomerCasino(casino: HomeCasino): boolean {
  if (NEWCOMER_SLUGS.has(casino.slug.toLowerCase())) return true;
  return NEWCOMER_NAMES.has(casino.name.toLowerCase().trim());
}

/** Port of reference `computeHomeAnalytics(breakdown30d, breakdown7d)`. */
export function computeHomeAnalytics(
  breakdown30d: HomeCasino[],
  _breakdown7d: HomeCasino[],
): HomeAnalytics {
  const ranked = [...breakdown30d].sort(
    (a, b) => b.depositVolume - a.depositVolume,
  );

  const toRow = (casino: HomeCasino, rank: number): HomeAnalyticsRow => ({
    casinoId: casino.casinoId,
    casinoName: casino.name,
    logoUrl: casino.logoUrl,
    depositVolume: casino.depositVolume,
    depositVolumeChange: casino.depositVolumeChange,
    rank,
  });

  return {
    biggest: ranked.slice(0, 5).map((c, i) => toRow(c, i + 1)),
    trending: [...ranked]
      .filter((c) => c.depositVolumeChange > 0)
      .sort((a, b) => b.depositVolumeChange - a.depositVolumeChange)
      .slice(0, 5)
      .map((c, i) => toRow(c, i + 1)),
    newcomers: ranked
      .filter(isNewcomerCasino)
      .sort((a, b) => b.depositVolume - a.depositVolume)
      .slice(0, 5)
      .map((c, i) => toRow(c, i + 1)),
    totalCasinos: ranked.length,
  };
}

export function fgTotalScore100(
  slug: string,
  trustScore: string | null | undefined,
  ratingsMap: RatingsMap,
): number {
  const fromMap = ratingsMap[slug]?.totalScore;
  if (fromMap != null) return fromMap;
  if (trustScore) return 10 * parseFloat(trustScore);
  return 0;
}

export function formatUsdCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/** Funds recovered label used by Complaints snapshot (supports $B). */
export function formatFundsRecovered(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

/** Total disputes label used by Complaints snapshot. */
export function formatDisputeCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString();
}

/** Avg resolution time label (`Xh` under 24h, else `Xd`). */
export function formatAvgResponseHours(
  hours: number | null | undefined,
): string {
  if (hours == null) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/** Port of reference `formatCurrency` (compact $K by default). */
export function formatCurrency(
  value: number | string | null | undefined,
  options: { compact?: boolean; decimals?: number } = {},
): string {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numeric)) return "-";
  const { compact = true, decimals = 0 } = options;
  if (compact && numeric >= 1_000) {
    const thousands = numeric / 1_000;
    return `$${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }
  return `$${numeric.toFixed(decimals)}`;
}
