/** Types & mock payloads for the /leaderboard page. */

export type LeaderboardCasinoWager = {
  casino: string;
  wager: number;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  deactivated?: boolean;
  wager: number;
  casinos: string[];
  prize?: string | null;
  casinoWagers?: LeaderboardCasinoWager[];
};

export type LeaderboardPayload = {
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardEntry | null;
  periodLabel?: string;
  periodStartedAt?: string;
  periodEndsAt?: string;
  prizePoolUsd?: number;
};

export type HowItWorksStep = {
  id: string;
  title: string;
  description: string;
  icon: "user-plus" | "link" | "dollar" | "trophy";
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "sign-up",
    title: "Sign Up",
    description:
      "Pick a casino and register using our referral link or enter our code at signup.",
    icon: "user-plus",
  },
  {
    id: "connect",
    title: "Connect",
    description:
      "Link your casino account on your FairGambling profile so we can track your wagers.",
    icon: "link",
  },
  {
    id: "play",
    title: "Play Anywhere",
    description:
      "Every wager from every partnered casino stacks into one combined rank. Play wherever you want — nothing is left on the table.",
    icon: "dollar",
  },
  {
    id: "climb",
    title: "Climb & Collect",
    description:
      "Claim your share of the $10,000 prize pool each period — and every wager still earns you wager share on top.",
    icon: "trophy",
  },
];

/** Partnered casinos shown in the Supported Sites strip. */
export const SUPPORTED_SITES = [
  "Duel",
  "Stake",
  "StakeUS",
  "Gamdom",
  "Roobet",
  "Thrill",
  "Winna",
  "Rainbet",
  "Gamba",
  "Degen",
  "Goated",
  "1win",
  "BC.GAME",
] as const;

/** Biweekly period anchor used by the countdown (UTC). */
export const LEADERBOARD_BIWEEKLY_ANCHOR = new Date("2026-05-08T17:00:00Z");

export const LEADERBOARD_PERIOD: "biweekly" = "biweekly";

/** Scraped from the live Leaderboard mock HTML (top 20). */
export const MOCK_LEADERBOARD_PAGE: LeaderboardPayload = {
  entries: [
    {
      rank: 1,
      userId: "u1",
      username: "bok1ca",
      wager: 527_400,
      casinos: ["Stake", "Shuffle", "Rainbet", "Thrill"],
      prize: "$3,000",
      casinoWagers: [
        { casino: "Stake", wager: 300_000 },
        { casino: "Shuffle", wager: 127_400 },
        { casino: "Rainbet", wager: 100_000 },
      ],
    },
    {
      rank: 2,
      userId: "u2",
      username: "commandermdro",
      wager: 89_800,
      casinos: ["Stake", "Winna", "Duel"],
      prize: "$1,500",
      casinoWagers: [
        { casino: "Stake", wager: 50_000 },
        { casino: "Winna", wager: 39_800 },
      ],
    },
    {
      rank: 3,
      userId: "u3",
      username: "addict",
      wager: 86_900,
      casinos: ["Roobet", "Gamdom"],
      prize: "$1,000",
    },
    {
      rank: 4,
      userId: "u4",
      username: "xxx",
      wager: 83_300,
      casinos: ["Stake", "BC.GAME", "Thrill", "Rainbet"],
      prize: "$800",
    },
    {
      rank: 5,
      userId: "u5",
      username: "Keno1000",
      wager: 42_200,
      casinos: ["Shuffle", "Stake"],
      prize: "$700",
    },
    {
      rank: 6,
      userId: "u6",
      username: "roma90bel",
      wager: 28_700,
      casinos: ["Duel", "Thrill"],
      prize: "$600",
    },
    {
      rank: 7,
      userId: "u7",
      username: "Hunterb2718",
      wager: 26_800,
      casinos: ["Stake"],
      prize: "$500",
    },
    {
      rank: 8,
      userId: "u8",
      username: "EMFUPS",
      wager: 19_800,
      casinos: ["Rainbet", "Shuffle", "Winna"],
      prize: "$400",
    },
    {
      rank: 9,
      userId: "u9",
      username: "FishFlavor",
      wager: 16_800,
      casinos: ["Gamdom"],
      prize: "$350",
    },
    {
      rank: 10,
      userId: "u10",
      username: "quartze40",
      wager: 16_600,
      casinos: ["Stake", "Roobet"],
      prize: "$300",
    },
    {
      rank: 11,
      userId: "u11",
      username: "mw635",
      wager: 15_800,
      casinos: ["Goated", "Stake"],
      prize: "$200",
    },
    {
      rank: 12,
      userId: "u12",
      username: "sinnx507",
      wager: 14_700,
      casinos: ["1win", "Duel"],
      prize: "$150",
    },
    {
      rank: 13,
      userId: "u13",
      username: "Skorze27",
      wager: 13_500,
      casinos: ["Thrill"],
      prize: "$120",
    },
    {
      rank: 14,
      userId: "u14",
      username: "jontix3",
      wager: 11_200,
      casinos: ["Winna", "Rainbet"],
      prize: "$100",
    },
    {
      rank: 15,
      userId: "u15",
      username: "Justin",
      wager: 10_200,
      casinos: ["Stake", "Gamdom"],
      prize: "$80",
    },
    {
      rank: 16,
      userId: "u16",
      username: "SLayer",
      wager: 8_700,
      casinos: ["Roobet"],
      prize: "$70",
    },
    {
      rank: 17,
      userId: "u17",
      username: "malaga01",
      wager: 8_700,
      casinos: ["Degen", "Stake"],
      prize: "$50",
    },
    {
      rank: 18,
      userId: "u18",
      username: "sandjacks",
      wager: 8_400,
      casinos: ["Gamba", "Duel"],
      prize: "$40",
    },
    {
      rank: 19,
      userId: "u19",
      username: "Kajan86",
      wager: 7_400,
      casinos: ["BC.GAME"],
      prize: "$30",
    },
    {
      rank: 20,
      userId: "u20",
      username: "nickstick",
      wager: 7_100,
      casinos: ["Stake", "Thrill"],
      prize: "$10",
    },
  ],
  currentUser: null,
};

/** Past period mock — used by the Past Leaderboard modal. */
export const MOCK_PAST_LEADERBOARD: LeaderboardPayload = {
  periodLabel: "Apr 24 – May 8, 2026",
  entries: MOCK_LEADERBOARD_PAGE.entries.map((entry, index) => ({
    ...entry,
    userId: `past-${entry.userId}`,
    wager: Math.round(entry.wager * 0.86),
    rank: index + 1,
  })),
  currentUser: null,
};
