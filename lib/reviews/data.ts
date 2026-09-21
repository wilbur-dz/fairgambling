/** Types & mock payloads for the Reviews page (`ReviewsView`). */

export type ReviewCasino = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
};

export type ReviewMarketRow = {
  casinoName: string;
  depositVolume: number;
};

export type ReviewItemUser = {
  username?: string;
  avatarUrl?: string | null;
  deactivated?: boolean;
};

export type ReviewItem = {
  id: string;
  casinoId?: string | null;
  casinoName: string;
  casinoSlug: string;
  author: string;
  userId?: string | null;
  user?: ReviewItemUser | null;
  rating: number;
  excerpt: string;
  createdAt: string;
  title?: string | null;
  body?: string | null;
  isVerified?: boolean;
  verifiedVipRank?: string | null;
  verifiedTotalWagered?: string | null;
  votes?: {
    helpful?: number;
    notHelpful?: number;
  } | null;
  helpfulCount?: number;
  notHelpfulCount?: number;
  userVote?: 1 | -1 | null;
};

export type RatingDistribution = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

export type ReviewStats = {
  totalReviews: number;
  avgRating: number;
  ratingDistribution?: RatingDistribution;
};

export type TopicInsightCasino = {
  slug: string;
  name: string;
};

export type TopicInsight = {
  key: string;
  label: string;
  mentions: number;
  positive: boolean;
  positivePct: number;
  negativePct?: number;
  topCasinos: TopicInsightCasino[];
};

export type CasinoSentiment = {
  casinoId: string;
  positivePct: number;
  topPositive?: string | null;
  topNegative?: string | null;
};

export type TopicInsightsPayload = {
  topics: TopicInsight[];
  casinos: CasinoSentiment[];
};

/** Approximate live /reviews aggregates (fallback when stats API lacks distribution). */
export const MOCK_REVIEW_STATS: ReviewStats = {
  totalReviews: 31_370,
  avgRating: 4.5,
  ratingDistribution: {
    5: 23_214,
    4: 5_333,
    3: 1_255,
    2: 314,
    1: 1_254,
  },
};

export const MOCK_TOPIC_INSIGHTS: TopicInsightsPayload = {
  topics: [
    {
      key: "bonuses",
      label: "Bonuses & Promos",
      mentions: 11_188,
      positive: true,
      positivePct: 89,
      topCasinos: [
        { slug: "stake", name: "Stake" },
        { slug: "shuffle", name: "Shuffle" },
        { slug: "rainbet", name: "Rainbet" },
      ],
    },
    {
      key: "ease-of-use",
      label: "Ease of Use",
      mentions: 8_166,
      positive: true,
      positivePct: 92,
      topCasinos: [
        { slug: "1win", name: "1win" },
        { slug: "stake", name: "Stake" },
        { slug: "bcgame", name: "BC.GAME" },
      ],
    },
    {
      key: "vip-rewards",
      label: "VIP & Rewards",
      mentions: 8_166,
      positive: true,
      positivePct: 96,
      topCasinos: [
        { slug: "roobet", name: "Roobet" },
        { slug: "duel", name: "Duel" },
        { slug: "thrill", name: "Thrill" },
      ],
    },
    {
      key: "trust-fairness",
      label: "Trust & Fairness",
      mentions: 7_960,
      positive: true,
      positivePct: 92,
      topCasinos: [
        { slug: "stake", name: "Stake" },
        { slug: "shuffle", name: "Shuffle" },
        { slug: "goated", name: "Goated" },
      ],
    },
    {
      key: "support",
      label: "Great Support",
      mentions: 4_820,
      positive: true,
      positivePct: 88,
      topCasinos: [
        { slug: "whaleio", name: "Whale.io" },
        { slug: "500casino", name: "500 Casino" },
      ],
    },
    {
      key: "withdrawal-issues",
      label: "Withdrawal Issues",
      mentions: 202,
      positive: false,
      positivePct: 55,
      negativePct: 45,
      topCasinos: [
        { slug: "gamdom", name: "Gamdom" },
        { slug: "yeet", name: "Yeet" },
      ],
    },
    {
      key: "rigged-scam",
      label: "Rigged / Scam",
      mentions: 890,
      positive: false,
      positivePct: 43,
      negativePct: 57,
      topCasinos: [
        { slug: "gamdom", name: "Gamdom" },
        { slug: "rollbit", name: "Rollbit" },
      ],
    },
  ],
  casinos: [
    {
      casinoId: "1win",
      positivePct: 97,
      topPositive: "Ease of Use",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "degen",
      positivePct: 96,
      topPositive: "Ease of Use",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "stake",
      positivePct: 95,
      topPositive: "Trust & Fairness",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "whaleio",
      positivePct: 93,
      topPositive: "Great Support",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "shuffle",
      positivePct: 90,
      topPositive: "Ease of Use",
      topNegative: "Account Issues",
    },
    {
      casinoId: "shuffleus",
      positivePct: 90,
      topPositive: "VIP & Rewards",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "duel",
      positivePct: 86,
      topPositive: "VIP & Rewards",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "thrill",
      positivePct: 86,
      topPositive: "VIP & Rewards",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "500casino",
      positivePct: 86,
      topPositive: "Great Support",
      topNegative: "Rigged / Scam",
    },
    {
      casinoId: "yeet",
      positivePct: 84,
      topPositive: "Ease of Use",
      topNegative: "Withdrawal Issues",
    },
  ],
};
