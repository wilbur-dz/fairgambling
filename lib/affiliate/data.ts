import type { LucideIcon } from "lucide-react";
import { DollarSign, Users } from "lucide-react";

export type AffiliateCasino = {
  slug: string;
  name: string;
  kickbackPercent?: number;
  code?: string;
  referralUrl?: string;
};

export type CoinClaimable = {
  currency: string;
  claimableAmount: number;
  claimableUsd: number;
  claimableNow: boolean;
  priceAt?: number;
  paidAmount?: number;
  pendingAmount?: number;
};

export type CoinBreakdown = {
  currency: string;
  amount: number;
  usd: number;
};

export type ConnectedAccountRef = {
  connectedAccountId: number;
  externalUsername: string;
};

export type AffiliateAccount = {
  casinoId: number;
  connectedAccountId: number;
  casinoSlug: string;
  casinoName: string;
  externalUsername: string;
  wagerUsd: number;
  commissionUsd: number;
  totalPaid: number;
  totalPending: number;
  claimable: number;
  tippable: boolean;
  customDeal?: boolean;
  lastSyncedAt?: string;
  minClaimUsd?: number | null;
  legacyClaimable?: number;
  coins?: CoinClaimable[];
  wagerCoins?: CoinBreakdown[];
  accounts?: ConnectedAccountRef[];
};

export type AffiliateClaim = {
  id: string;
  casinoSlug: string;
  tipUsername: string;
  amount: string;
  status: "paid" | "pending" | "rejected" | string;
  claimedAt: string;
  coinCurrency?: string | null;
  coinAmount?: string | null;
  rejectionReason?: string | null;
};

export type PendingVerification = {
  casinoSlug: string;
  username: string;
  expiresAt: number;
};

export type CalcGameType = {
  label: string;
  houseEdge: number;
  divisor?: number;
  rateMultiplier?: number;
};

export type CalcConfig = {
  slug: string;
  name: string;
  commission: number;
  gameTypes: CalcGameType[];
  formulaExplanation?: string;
};

export type BenefitItem = {
  icon?: LucideIcon;
  iconSrc?: string;
  title: string;
  desc: string;
};

export type StepItem = {
  iconSrc: string;
  title: string;
  desc: string;
};

export type StatItem = {
  icon?: LucideIcon;
  iconSrc?: string;
  label: string;
  target: number;
  prefix: string;
  suffix: string;
};

export type TopTierCard = {
  slug: string;
  file: string;
  percent: number;
};

export const TOP_CASINOS: AffiliateCasino[] = [
  { slug: "duel", name: "Duel", kickbackPercent: 30 },
  { slug: "stake", name: "Stake", kickbackPercent: 25 },
  { slug: "stakeus", name: "Stake US", kickbackPercent: 25 },
  { slug: "thrill", name: "Thrill", kickbackPercent: 25 },
  { slug: "bcgame", name: "BC.Game", kickbackPercent: 15 },
  { slug: "winna", name: "Winna", kickbackPercent: 25 },
  { slug: "rainbet", name: "Rainbet", kickbackPercent: 20 },
  { slug: "gamba", name: "Gamba", kickbackPercent: 20 },
  { slug: "degen", name: "Degen", kickbackPercent: 20 },
  { slug: "goated", name: "Goated", kickbackPercent: 20 },
  {
    slug: "1win",
    name: "1win",
    kickbackPercent: 20,
    code: "FAIRGAMBLING",
    referralUrl: "https://one-vv1220.com/?p=251t",
  },
  { slug: "gamdom", name: "Gamdom", kickbackPercent: 10 },
];

export const MORE_CASINOS: AffiliateCasino[] = [
  { slug: "shuffle", name: "Shuffle", kickbackPercent: 10 },
  { slug: "yeet", name: "Yeet", kickbackPercent: 10 },
  {
    slug: "cybet",
    name: "Cybet",
    kickbackPercent: 10,
    referralUrl: "https://cybetplay.com/tqfkjg896",
  },
  {
    slug: "flush",
    name: "Flush",
    kickbackPercent: 10,
    referralUrl: "https://flushlinks.com/dxa7uynoc",
  },
  { slug: "roobet", name: "Roobet", kickbackPercent: 10 },
];

export const CASINOS: AffiliateCasino[] = [
  ...TOP_CASINOS,
  ...MORE_CASINOS,
  {
    slug: "rollbit",
    name: "Rollbit",
    code: "fairgambling",
    referralUrl: "https://rollbit.com/referral/fairgambling",
  },
  {
    slug: "500casino",
    name: "500 Casino",
    code: "FAIRGAMBLING",
    referralUrl: "https://500.casino/r/FAIRGAMBLING",
  },
  {
    slug: "acebet",
    name: "Acebet",
    referralUrl: "https://a.acebet.com/api/click?a=348&lp=43&c=374",
  },
  {
    slug: "betfury",
    name: "BetFury",
    code: "FAIRGAMBLING",
    referralUrl: "https://betfury.com/?r=FAIRGAMBLING",
  },
  {
    slug: "spartans",
    name: "Spartans",
    code: "fairgambling",
    referralUrl: "https://spartans.com/?c=fairgambling&modal=register",
  },
  {
    slug: "duelbits",
    name: "Duelbits",
    code: "fairgambling",
    referralUrl: "https://duelbits.io/?a=fairgambling",
  },
  {
    slug: "shuffleus",
    name: "Shuffle US",
    code: "fairgambling",
    referralUrl: "https://shuffle.us?r=fairgambling",
  },
  {
    slug: "solcasino",
    name: "SolCasino",
    referralUrl: "https://solcasino.io/r/HICN4q4e",
  },
  {
    slug: "whaleio",
    name: "Whale.io",
    referralUrl: "https://whale.io/?start=24f5ade92af783aa",
  },
  {
    slug: "metawin",
    name: "MetaWin",
    code: "fairgambling",
    referralUrl: "https://metawin.com/fairgambling",
  },
  {
    slug: "chipsgg",
    name: "Chips.gg",
    code: "fairgambling",
    referralUrl: "https://chips.gg/signup?r=fairgambling",
  },
  {
    slug: "toshibet",
    name: "Toshibet",
    code: "fairgambling",
    referralUrl: "https://toshi.bet/r/fairgambling",
  },
  {
    slug: "wagercom",
    name: "Wager.com",
    code: "fairgambling",
    referralUrl: "https://wager.com/signup/?raf=fairgambling",
  },
  {
    slug: "cloudbet",
    name: "Cloudbet",
    code: "fairgambling",
    referralUrl: "https://cldbt.cloud/r/fairgambling",
  },
  {
    slug: "shock",
    name: "Shock",
    code: "fairgambling",
    referralUrl: "https://www.shock.com/?r=fairgambling",
  },
  {
    slug: "qzino",
    name: "Qzino",
    code: "FAIRGAMBLING",
    referralUrl: "https://qzino.com?r=FAIRGAMBLING",
  },
  {
    slug: "bluff",
    name: "Bluff",
    code: "fairgambling",
    referralUrl: "https://www.bluff.com?invite=fairgambling",
  },
  {
    slug: "jackpotbet",
    name: "Jackpot Bet",
    referralUrl: "https://jackpot.bet/?modal=register&r=kq603h52pg",
  },
  {
    slug: "betstrike",
    name: "BetStrike",
    code: "fairgambling",
    referralUrl: "https://betstrike.com/ref/fairgambling",
  },
];

export const CASINO_BY_SLUG: Record<string, AffiliateCasino> = Object.fromEntries(
  CASINOS.map((c) => [c.slug, c]),
);

export const CONNECT_SLUGS = new Set(
  [...TOP_CASINOS, ...MORE_CASINOS]
    .map((c) => c.slug)
    .filter((slug) => !["rollbit", "cybet", "flush"].includes(slug)),
);

export const OTHER_CASINO_SLUGS = [
  "rollbit",
  "500casino",
  "acebet",
  "betfury",
  "spartans",
  "duelbits",
  "shuffleus",
  "solcasino",
  "whaleio",
  "metawin",
  "chipsgg",
  "toshibet",
  "wagercom",
  "cloudbet",
  "shock",
  "qzino",
  "bluff",
  "jackpotbet",
  "cybet",
  "flush",
] as const;

export const BENEFITS: BenefitItem[] = [
  {
    icon: DollarSign,
    title: "Wager Share",
    desc: "Up to 30% of the house edge on your own wager, claimable anytime.",
  },
  {
    iconSrc: "/affiliate/icons/Ticket.svg",
    title: "Bonus Code Drops",
    desc: "Exclusive codes and drops from partner casinos, first to our community.",
  },
  {
    iconSrc: "/affiliate/icons/Cup.svg",
    title: "Cross-Casino Leaderboard",
    desc: "Compete for real cash prizes across every casino we track.",
  },
  {
    iconSrc: "/affiliate/icons/Crown.svg",
    title: "Loyalty Program",
    desc: "Extra perks and VIP treatment the longer you play through us.",
  },
];

export const STEPS: StepItem[] = [
  {
    iconSrc: "/affiliate/icons/SignUp.svg",
    title: "Sign Up",
    desc: "Create your FairGambling account.",
  },
  {
    iconSrc: "/affiliate/icons/LinkAcc.svg",
    title: "Link Account",
    desc: "Connect your casino account.",
  },
  {
    iconSrc: "/affiliate/icons/Game.svg",
    title: "Play",
    desc: "Bet and play, your rewards stack automatically.",
  },
  {
    iconSrc: "/affiliate/icons/Gift.svg",
    title: "Collect",
    desc: "Claim your rewards instantly to your connected account.",
  },
];

export const STATS: StatItem[] = [
  {
    icon: Users,
    label: "Users earning kickback",
    target: 500,
    prefix: "",
    suffix: "+",
  },
  {
    icon: DollarSign,
    label: "Total kickback paid out",
    target: 300_000,
    prefix: "$",
    suffix: "+",
  },
  {
    iconSrc: "/affiliate/icons/LinkAcc.svg",
    label: "Connected accounts",
    target: 1500,
    prefix: "",
    suffix: "+",
  },
];

export const TOP_TIER_CARDS: TopTierCard[] = [
  { slug: "duel", file: "aff/duelaff.png", percent: 30 },
  { slug: "stake", file: "aff/stakeaff.png", percent: 25 },
  { slug: "stakeus", file: "aff/stakeusaff.png", percent: 25 },
  { slug: "gamdom", file: "aff/gamdomaff.png", percent: 10 },
  { slug: "roobet", file: "aff/roobetaff.png", percent: 10 },
  { slug: "thrill", file: "aff/thrillaff.png", percent: 25 },
  { slug: "winna", file: "aff/winnaaff.png", percent: 25 },
  { slug: "rainbet", file: "aff/rainbetaff.png", percent: 20 },
  { slug: "gamba", file: "aff/gambaaff.png", percent: 20 },
  { slug: "degen", file: "aff/degenaff.png", percent: 20 },
  { slug: "goated", file: "aff/goatedaff.png", percent: 20 },
  { slug: "1win", file: "aff/1winaff.png", percent: 20 },
  { slug: "bcgame", file: "aff/bcgameaff.png", percent: 15 },
  { slug: "shuffle", file: "aff/shuffleaff.png", percent: 10 },
  { slug: "yeet", file: "aff/yeetaff.png", percent: 10 },
];

export const PREVIEW_ACCOUNTS: AffiliateAccount[] = [
  {
    casinoId: 1,
    connectedAccountId: 0,
    casinoSlug: "stake",
    casinoName: "Stake",
    externalUsername: "sebastian99",
    wagerUsd: 482_500,
    commissionUsd: 2533.13,
    totalPaid: 1800,
    totalPending: 0,
    claimable: 733.13,
    tippable: true,
    lastSyncedAt: "",
  },
  {
    casinoId: 2,
    connectedAccountId: 0,
    casinoSlug: "shuffle",
    casinoName: "Shuffle",
    externalUsername: "seebcrypto",
    wagerUsd: 2_340_000,
    commissionUsd: 10_237.5,
    totalPaid: 7500,
    totalPending: 0,
    claimable: 2737.5,
    coins: [
      {
        currency: "LTC",
        claimableAmount: 12,
        claimableUsd: 1110,
        claimableNow: true,
        priceAt: 92.5,
        paidAmount: 0,
        pendingAmount: 0,
      },
      {
        currency: "SOL",
        claimableAmount: 6,
        claimableUsd: 912,
        claimableNow: true,
        priceAt: 152,
        paidAmount: 0,
        pendingAmount: 0,
      },
      {
        currency: "SHFL",
        claimableAmount: 5000,
        claimableUsd: 715.5,
        claimableNow: true,
        priceAt: 0.1431,
        paidAmount: 0,
        pendingAmount: 0,
      },
    ],
    tippable: true,
    lastSyncedAt: "",
  },
  {
    casinoId: 3,
    connectedAccountId: 0,
    casinoSlug: "roobet",
    casinoName: "Roobet",
    externalUsername: "sebplays",
    wagerUsd: 890_000,
    commissionUsd: 1557.5,
    totalPaid: 1557.5,
    totalPending: 0,
    claimable: 0,
    tippable: true,
    lastSyncedAt: "",
  },
];

export const PREVIEW_KICKBACK: Record<string, number> = {
  stake: 30,
  shuffle: 25,
  roobet: 10,
};

export const CALC_CONFIGS: CalcConfig[] = [
  {
    slug: "stake",
    name: "Stake",
    commission: 0.25,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 25% ÷ 2. Payouts are tipped in crypto, so the USD value can move slightly until the tip lands.",
  },
  {
    slug: "stakeus",
    name: "Stake US",
    commission: 0.25,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 25% ÷ 2. Stake US does not support tipping yet, so payouts are sent to another casino account you connect. Payouts are tipped in crypto, so the USD value can move slightly until the tip lands.",
  },
  {
    slug: "shuffle",
    name: "Shuffle",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 10% ÷ 2. You earn and get paid in the coins you play, so the USD value can move with the market.",
  },
  {
    slug: "bcgame",
    name: "BC.Game",
    commission: 0.15,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 1 },
      { label: "Originals", houseEdge: 0.01, divisor: 1 },
      { label: "Sports", houseEdge: 0.03, divisor: 1 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 15%, credited from BC.Game's affiliate program reporting.",
  },
  {
    slug: "rainbet",
    name: "Rainbet",
    commission: 0.2,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 20% ÷ 2",
  },
  {
    slug: "winna",
    name: "Winna",
    commission: 0.25,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 1 },
      { label: "Originals", houseEdge: 0.01, divisor: 1 },
      { label: "Sports", houseEdge: 0.03, divisor: 1 },
    ],
    formulaExplanation: "Wagered × House Edge × 25%",
  },
  {
    slug: "thrill",
    name: "Thrill",
    commission: 0.25,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 25% ÷ 2. Thrill prices commission in crypto, so its dollar value can move with the market. Your earned amount only counts up while you play and coin dips never reduce it.",
  },
  {
    slug: "yeet",
    name: "Yeet",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 10% ÷ 2",
  },
  {
    slug: "duel",
    name: "Duel",
    commission: 0.3,
    gameTypes: [
      { label: "Casino", houseEdge: 0.035, rateMultiplier: 1, divisor: 2 },
      { label: "Sports", houseEdge: 0.02, rateMultiplier: 1, divisor: 1 },
    ],
    formulaExplanation:
      "Duel features 0% house-edge games where you can't earn extra rewards as there is no house edge — only edge play counts toward your wager share.",
  },
  {
    slug: "goated",
    name: "Goated",
    commission: 0.2,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 20% ÷ 2",
  },
  {
    slug: "1win",
    name: "1win",
    commission: 0.2,
    gameTypes: [
      { label: "Slots", houseEdge: 0.03, divisor: 2 },
      { label: "Live Casino", houseEdge: 0.05, divisor: 2 },
      { label: "Betting", houseEdge: 0.07, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 20% ÷ 2",
  },
  {
    slug: "gamba",
    name: "Gamba",
    commission: 0.2,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 20% ÷ 2",
  },
  {
    slug: "degen",
    name: "Degen",
    commission: 0.2,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 20% ÷ 2",
  },
  {
    slug: "gamdom",
    name: "Gamdom",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 1 },
      { label: "Originals", houseEdge: 0.01, divisor: 1 },
      { label: "Sports", houseEdge: 0.03, divisor: 1 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 10% — you receive 2/3 of our 15% net-on-theo cut, no expense divider.",
  },
  {
    slug: "cybet",
    name: "Cybet",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation: "Wagered × House Edge × 10% ÷ 2",
  },
  {
    slug: "flush",
    name: "Flush",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 2 },
      { label: "Originals", houseEdge: 0.01, divisor: 2 },
      { label: "Sports", houseEdge: 0.03, divisor: 2 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 10% ÷ 2 (capped at our actual NGR payout — Flush pays % of net gaming revenue, not wager-share, so claimable may be less than the calculator estimate)",
  },
  {
    slug: "roobet",
    name: "Roobet",
    commission: 0.1,
    gameTypes: [
      { label: "Slots", houseEdge: 0.035, divisor: 1 },
      { label: "Originals", houseEdge: 0.01, divisor: 1 },
      { label: "Sports", houseEdge: 0.03, divisor: 1 },
    ],
    formulaExplanation:
      "Wagered × House Edge × 10% — Roobet pays net-revenue share (you receive 2/3 of our 15% cut). Estimate is approximate; actual kickback tracks Roobet's game-weighted wager.",
  },
];

export function calcEarnings(
  wager: number,
  config: CalcConfig,
  gameIndex: number,
): number {
  const game = config.gameTypes[gameIndex];
  if (!game || !Number.isFinite(wager) || wager < 0) return 0;
  const rateMultiplier = game.rateMultiplier ?? 1;
  const divisor = game.divisor ?? 2;
  return (wager * game.houseEdge * config.commission * rateMultiplier) / divisor;
}

export function cardArtUrl(file: string): string {
  return `/affiliate/cards/${file}`;
}

/** Auth hint attribute used to avoid flash of guest preview for returning users. */
export const AUTH_HINT_ATTR = "data-fg-auth";
