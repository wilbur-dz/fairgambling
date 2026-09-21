/**
 * Compare page section / field definitions (reference `CompareView` `h` + shared builders).
 */

import type { OverviewCasino } from "@/lib/casinos/data";
import { getGameThumbnail } from "@/lib/casinos/game-thumbnails";

export type CompareDirection = "higher" | "lower";

export type CompareFieldValue = string | boolean | null;

export type CompareField = {
  label: string;
  labelImage?: string | null;
  getValue: (casino: OverviewCasino) => CompareFieldValue;
  compare?: CompareDirection;
};

export type CompareSection = {
  title: string;
  fields: CompareField[];
};

function getMetaPath(casino: OverviewCasino, path: string): unknown {
  if (!casino._meta) return undefined;
  let cur: unknown = casino._meta;
  for (const key of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** Coerce meta boolean-ish values; unknown → null (shows as —). */
function asBoolOrNull(value: unknown): boolean | null {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function asDisplayString(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

function ratingOf(casino: OverviewCasino) {
  return casino._ratingData;
}

function categoryScore(
  casino: OverviewCasino,
  key: keyof NonNullable<
    NonNullable<OverviewCasino["_ratingData"]>["categories"]
  >,
): string | null {
  const score = ratingOf(casino)?.categories?.[key]?.score;
  return score != null ? `${score.toFixed(1)} / 10` : null;
}

export const COMPARE_SECTIONS: CompareSection[] = [
  {
    title: "Basic Info",
    fields: [
      { label: "Founded", getValue: (c) => asDisplayString(c.founded) },
      {
        label: "30d Deposit Vol.",
        getValue: (c) => asDisplayString(c.depositVolume30d),
        compare: "higher",
      },
      { label: "Estimated NGR", getValue: (c) => c.estimatedNgr ?? null },
      {
        label: "User Reviews",
        getValue: (c) =>
          c.userReviews ? `${c.userReviews.toFixed(1)} / 5` : null,
        compare: "higher",
      },
      {
        label: "Rating",
        getValue: (c) =>
          c.fgRating ? `${c.fgRating.toFixed(1)} / 100` : null,
        compare: "higher",
      },
      { label: "License", getValue: (c) => asDisplayString(c.license?.name) },
    ],
  },
  {
    title: "Fairness & RTP",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "fairnessRtp"),
        compare: "higher",
      },
      {
        label: "Provably Fair System",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "fairnessRtp.provablyFairSystem")),
      },
      {
        label: "Verification Tool",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.verificationTool")),
        compare: "higher",
      },
      {
        label: "Seed Change",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.seedChange")),
        compare: "higher",
      },
      {
        label: "Seed Control",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.seedControl")),
        compare: "higher",
      },
      {
        label: "Transparency Link",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.transparencyLink")),
        compare: "higher",
      },
      {
        label: "RTP Disclosure",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.rtpDisclosure")),
        compare: "higher",
      },
      {
        label: "RTP Slot Consistency",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "fairnessRtp.rtpSlotConsistency")),
        compare: "higher",
      },
      {
        label: "Avg House Game RTP",
        getValue: (c) => {
          const v = getMetaPath(c, "fairnessRtp.avgHouseGameRtp");
          return v != null ? `${v}%` : null;
        },
        compare: "higher",
      },
      {
        label: "Avg Sports Edge",
        getValue: (c) => {
          const v = ratingOf(c)?.sportsEdgeVig;
          return v != null ? `${v}%` : null;
        },
        compare: "lower",
      },
    ],
  },
  {
    title: "Analytics",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "analytics"),
        compare: "higher",
      },
      {
        label: "7D Deposit Vol.",
        getValue: (c) => asDisplayString(c.depositVolume7d),
        compare: "higher",
      },
      {
        label: "30D Deposit Vol.",
        getValue: (c) => asDisplayString(c.depositVolume30d),
        compare: "higher",
      },
      {
        label: "90D Deposit Vol.",
        getValue: (c) => asDisplayString(c.depositVolume90d),
        compare: "higher",
      },
      {
        label: "365D Deposit Vol.",
        getValue: (c) => asDisplayString(c.depositVolume365d),
        compare: "higher",
      },
    ],
  },
  {
    title: "Financial Transparency",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "financialTransparency"),
        compare: "higher",
      },
      {
        label: "Minimum Deposit",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "financial.minimumDeposit")),
        compare: "lower",
      },
      {
        label: "Minimum Withdrawal",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "financial.minimumWithdrawal")),
        compare: "lower",
      },
      {
        label: "Fees",
        getValue: (c) => asDisplayString(getMetaPath(c, "financial.fees")),
      },
      {
        label: "Cancel Withdraw",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "financial.cancelWithdraw")),
        compare: "higher",
      },
      {
        label: "Withdrawal Speed",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "financial.withdrawalSpeed")),
      },
      {
        label: "Withdrawal Limit",
        getValue: (c) => {
          const v = getMetaPath(c, "financial.withdrawalLimit");
          if (v === false || v === "No" || v == null) return "No Limit";
          return asDisplayString(v);
        },
      },
      {
        label: "Public Hot Wallet",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "financial.publicHotWallet")),
        compare: "higher",
      },
      {
        label: "Proof of Reserves",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "financial.proofOfReserves")),
        compare: "higher",
      },
    ],
  },
  {
    title: "Bonus",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "bonus"),
        compare: "higher",
      },
      {
        label: "Estimated Rakeback",
        getValue: (c) => c.estRakebackStr ?? null,
        compare: "higher",
      },
      {
        label: "Leaderboard / Raffle",
        getValue: (c) => c.leaderboardSize ?? null,
        compare: "higher",
      },
      {
        label: "Instant Rakeback",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "bonus.instantRakeback")),
        compare: "higher",
      },
      {
        label: "Daily Bonus",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "bonus.dailyBonus")),
        compare: "higher",
      },
      {
        label: "Weekly Bonus",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "bonus.weeklyBonus")),
        compare: "higher",
      },
      {
        label: "Monthly Bonus",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "bonus.monthlyBonus")),
        compare: "higher",
      },
      {
        label: "Code Feed",
        getValue: (c) => !!c.hasCodeFeed,
        compare: "higher",
      },
    ],
  },
  {
    title: "Customer Support",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "customerSupport"),
        compare: "higher",
      },
      {
        label: "Live Chat",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "support.liveChat")),
        compare: "higher",
      },
      {
        label: "Response Time",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "support.responseTime")),
      },
      {
        label: "24/7 Availability",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "support.availability247")),
        compare: "higher",
      },
      {
        label: "Languages",
        getValue: (c) => {
          const v = getMetaPath(c, "support.languages");
          return Array.isArray(v) ? v.join(", ") : asDisplayString(v);
        },
      },
      {
        label: "Human / Bot",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "support.humanOrBot")),
      },
    ],
  },
  {
    title: "Compliance",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "compliance"),
        compare: "higher",
      },
      {
        label: "License Details",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "compliance.licenseDetails")),
      },
      {
        label: "License Verification",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "compliance.licenseVerificationLink")),
        compare: "higher",
      },
      {
        label: "Geo-blocking",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "compliance.geoBlocking")),
        compare: "higher",
      },
      {
        label: "KYC Level",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "compliance.kycLevel")),
      },
      {
        label: "ID Verification",
        getValue: (c) =>
          asDisplayString(getMetaPath(c, "compliance.idVerification")),
      },
      {
        label: "AML",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "compliance.wagerBeforeWithdrawal")),
      },
      {
        label: "Restricted Countries",
        getValue: (c) => {
          const v = getMetaPath(c, "compliance.restrictedCountries");
          if (!Array.isArray(v) || v.length === 0) return null;
          if (v.length <= 3) return v.join(", ");
          return `${v.slice(0, 3).join(", ")} + ${v.length - 3} more`;
        },
      },
    ],
  },
  {
    title: "Responsible Gambling",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "responsibleGambling"),
        compare: "higher",
      },
      {
        label: "Access to Stats",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "responsibleGambling.accessToStats")),
        compare: "higher",
      },
      {
        label: "Self-Exclusion",
        getValue: (c) =>
          asDisplayString(
            getMetaPath(c, "responsibleGambling.selfExclusion"),
          ),
      },
      {
        label: "Gambling Limits",
        getValue: (c) =>
          asBoolOrNull(
            getMetaPath(c, "responsibleGambling.gamblingLimits") ||
              getMetaPath(c, "responsibleGambling.coolingOffPeriods"),
          ),
        compare: "higher",
      },
    ],
  },
  {
    title: "Security",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "security"),
        compare: "higher",
      },
      {
        label: "Two-Factor Auth (2FA)",
        getValue: (c) => asBoolOrNull(getMetaPath(c, "security.twoFactor")),
        compare: "higher",
      },
      {
        label: "Account Notifications",
        getValue: (c) =>
          asBoolOrNull(getMetaPath(c, "security.accountNotifications")),
        compare: "higher",
      },
      {
        label: "Withdrawal Confirmation (2FA)",
        getValue: (c) =>
          asBoolOrNull(
            getMetaPath(c, "security.withdrawalConfirmation2fa"),
          ),
        compare: "higher",
      },
    ],
  },
  {
    title: "Third Party Ratings",
    fields: [
      {
        label: "Category Score",
        getValue: (c) => categoryScore(c, "thirdPartyRatings"),
        compare: "higher",
      },
      {
        label: "Trustpilot Score",
        getValue: (c) => {
          const tp = ratingOf(c)?.trustpilot;
          return tp
            ? `${tp.score.toFixed(1)} / 5 (${tp.reviewCount.toLocaleString()})`
            : null;
        },
        compare: "higher",
      },
      {
        label: "Casino Guru Feedback",
        getValue: (c) => ratingOf(c)?.casinoGuruFeedback ?? null,
      },
      {
        label: "Casino Guru Unresolved",
        getValue: (c) => {
          const v = ratingOf(c)?.casinoGuruUnresolved;
          return v != null ? `${v}` : null;
        },
        compare: "lower",
      },
      {
        label: "BitcoinTalk Unresolved",
        getValue: (c) => {
          const v = ratingOf(c)?.bitcointalkUnresolved;
          return v != null ? `${v}` : null;
        },
        compare: "lower",
      },
    ],
  },
];

type HouseGameMeta = {
  slug?: string;
  name?: string;
  rtp?: number | null;
};

type ProviderGameMeta = {
  name?: string;
  rtp?: number | string | null;
  maxBet?: number | string | null;
};

type ProviderMeta = {
  id: string;
  name?: string;
  games?: ProviderGameMeta[];
};

/** Shared house games across currently selected casinos. */
export function buildSharedHouseGamesSection(
  selected: Array<OverviewCasino | null>,
): CompareSection | null {
  const casinos = selected.filter((c): c is OverviewCasino => c != null);
  if (casinos.length === 0) return null;

  const lists = casinos.map((c) => {
    const raw = getMetaPath(c, "games.houseGames");
    return Array.isArray(raw) ? (raw as HouseGameMeta[]) : [];
  });

  const sharedSlugs = [
    ...new Set(lists[0].map((g) => g.slug).filter(Boolean) as string[]),
  ].filter((slug) => lists.every((list) => list.some((g) => g.slug === slug)));

  if (sharedSlugs.length === 0) return null;

  return {
    title: "House Games (Shared)",
    fields: sharedSlugs.map((slug) => ({
      label: lists[0].find((g) => g.slug === slug)?.name || slug,
      getValue: (casino) => {
        const raw = getMetaPath(casino, "games.houseGames");
        if (!Array.isArray(raw)) return null;
        const hit = (raw as HouseGameMeta[]).find((g) => g.slug === slug);
        return hit ? `${hit.rtp}%` : null;
      },
      compare: "higher" as const,
    })),
  };
}

/** Shared provider × game rows across currently selected casinos. */
export function buildSharedProvidersSection(
  selected: Array<OverviewCasino | null>,
): CompareSection | null {
  const casinos = selected.filter((c): c is OverviewCasino => c != null);
  if (casinos.length === 0) return null;

  const lists = casinos.map((c) => {
    const raw = getMetaPath(c, "games.providers");
    return Array.isArray(raw) ? (raw as ProviderMeta[]) : [];
  });

  const sharedIds = [
    ...new Set(lists[0].map((p) => p.id).filter(Boolean)),
  ].filter((id) => lists.every((list) => list.some((p) => p.id === id)));

  if (sharedIds.length === 0) return null;

  const fields: CompareField[] = [];

  for (const providerId of sharedIds) {
    const providerName =
      lists[0].find((p) => p.id === providerId)?.name || providerId;
    const gameLists = casinos.map((c) => {
      const raw = getMetaPath(c, "games.providers");
      const providers = Array.isArray(raw) ? (raw as ProviderMeta[]) : [];
      return providers.find((p) => p.id === providerId)?.games || [];
    });

    const sharedNames = [
      ...new Set(
        gameLists[0]
          .map((g) => g.name)
          .filter((n): n is string => Boolean(n)),
      ),
    ].filter((name) =>
      gameLists.every((list) => list.some((g) => g.name === name)),
    );

    for (const gameName of sharedNames) {
      fields.push({
        label: `${providerName} — ${gameName}`,
        labelImage: getGameThumbnail(gameName),
        getValue: (casino) => {
          const raw = getMetaPath(casino, "games.providers");
          const providers = Array.isArray(raw) ? (raw as ProviderMeta[]) : [];
          const game = providers
            .find((p) => p.id === providerId)
            ?.games?.find((g) => g.name === gameName);
          if (!game) return null;
          const parts: string[] = [];
          if (game.rtp != null) parts.push(`${game.rtp}%`);
          if (game.maxBet != null) {
            const n =
              typeof game.maxBet === "number"
                ? game.maxBet
                : Number(game.maxBet);
            if (Number.isFinite(n)) {
              parts.push(`Max: $${n.toLocaleString()}`);
            }
          }
          return parts.length > 0 ? parts.join(" · ") : null;
        },
      });
    }
  }

  if (fields.length === 0) return null;
  return { title: "Slot Providers (Shared)", fields };
}

function parseComparableNumber(value: CompareFieldValue): number | null {
  if (value == null || typeof value === "boolean") return null;
  const text = String(value);
  const ratio = text.match(/([\d.]+)\s*\/\s*[\d.]+/);
  if (ratio) return parseFloat(ratio[1]);
  const money = text.match(/\$?([\d,.]+)\s*([KMBkmb])?/);
  if (money) {
    const n = parseFloat(money[1].replace(/,/g, ""));
    if (Number.isNaN(n)) return null;
    const suffix = money[2]?.toUpperCase();
    if (suffix === "K") return n * 1e3;
    if (suffix === "M") return n * 1e6;
    if (suffix === "B") return n * 1e9;
    return n;
  }
  const pct = text.match(/([\d.]+)%/);
  if (pct) return parseFloat(pct[1]);
  const plain = parseFloat(text.replace(/,/g, ""));
  return Number.isNaN(plain) ? null : plain;
}

/** Winner / loser indices for a compare field (reference logic). */
export function computeWinnersLosers(
  values: CompareFieldValue[],
  direction: CompareDirection,
): { winners: Set<number>; losers: Set<number> } {
  const winners = new Set<number>();
  const losers = new Set<number>();
  const present = values
    .map((v, i) => ({ v, i }))
    .filter((e) => e.v !== null && e.v !== undefined);

  if (present.every((e) => typeof e.v === "boolean") && present.length >= 2) {
    const hasTrue = present.some((e) => e.v === true);
    const hasFalse = present.some((e) => e.v === false);
    if (hasTrue && hasFalse) {
      present.forEach((e) => {
        if (e.v === true) winners.add(e.i);
        else if (e.v === false) losers.add(e.i);
      });
    }
    return { winners, losers };
  }

  const nums = values
    .map((v) => parseComparableNumber(v))
    .map((v, i) => ({ v, i }))
    .filter((e): e is { v: number; i: number } => e.v !== null);

  if (nums.length < 2 || nums.every((e) => e.v === nums[0].v)) {
    return { winners, losers };
  }

  const best =
    direction === "higher"
      ? Math.max(...nums.map((e) => e.v))
      : Math.min(...nums.map((e) => e.v));
  const worst =
    direction === "higher"
      ? Math.min(...nums.map((e) => e.v))
      : Math.max(...nums.map((e) => e.v));

  nums.forEach((e) => {
    if (e.v === best) winners.add(e.i);
    else if (e.v === worst) losers.add(e.i);
  });

  return { winners, losers };
}
