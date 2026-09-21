import allStreamersJson from "@/lib/streamers/all-streamers.json";
import type {
  CasinoTimelineEntry,
  MarketValueBreakdown,
  StreamerDbProfile,
  StreamerLiveNow,
  StreamerLiveStat,
  StreamerRecord,
} from "@/lib/streamers/types";

export const ALL_STREAMERS = allStreamersJson as StreamerRecord[];

export const LIST_TABS = ["Live", "Most Valuable", "Newcomers"] as const;

const slugKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

let casinoCanonicalMap: Map<string, string> | null = null;

function buildCasinoCanonicalMap(): Map<string, string> {
  if (casinoCanonicalMap) return casinoCanonicalMap;
  const map = new Map<string, string>();
  for (const row of ALL_STREAMERS) {
    if (row.currentCasino && row.currentCasino !== "—") {
      map.set(slugKey(row.currentCasino), row.currentCasino);
    }
  }
  casinoCanonicalMap = map;
  return map;
}

/** Port of reference `canonicalCasinoName` (first partner segment, title-cased). */
export function canonicalCasinoName(raw: string | null | undefined): string {
  const first =
    (raw ?? "").split(/[,/&]| and /)[0]?.trim() ?? "";
  if (!first || first === "-" || first === "—") return "—";
  const canonical = buildCasinoCanonicalMap().get(slugKey(first));
  return canonical ?? first.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseMoney(input: string | null | undefined): number | null {
  if (!input) return null;
  const match = input
    .replace(/[,$\s]/g, "")
    .toLowerCase()
    .match(/([\d.]+)\s*([mkb])?/);
  if (!match) return null;
  let value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  const suffix = match[2];
  if (suffix === "b") value *= 1e9;
  else if (suffix === "m") value *= 1e6;
  else if (suffix === "k") value *= 1e3;
  return value > 0 ? value : null;
}

export function formatMarketValue(value: number | null | undefined): string | null {
  if (value == null || value <= 0) return null;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) {
    const m = value / 1e6;
    return `$${m.toFixed(m % 1e6 ? 1 : 0)}M`;
  }
  if (value >= 1e3) return `$${Math.round(value / 1e3)}K`;
  return `$${Math.round(value)}`;
}

function countRecentCasinoSwitches(
  timeline: CasinoTimelineEntry[] | undefined,
  now = new Date(),
): number {
  const starts = (Array.isArray(timeline) ? timeline : [])
    .map((entry) =>
      typeof entry?.start === "string" && /^\d{4}-\d{2}$/.test(entry.start)
        ? entry.start
        : null,
    )
    .filter((v): v is string => v !== null)
    .sort();
  if (starts.length <= 1) return 0;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}`;
  return Math.min(starts.slice(1).filter((start) => start > cutoffKey).length, 3);
}

function computeMv(record: StreamerRecord): number | null {
  const pay = parseMoney(record.estMonthlyPayment ?? "");
  if (!pay || pay <= 0) return null;
  const avg = record.avgViewers30d ?? 0;
  const peak = record.peakViewers30d ?? 0;
  const lb = record.monthlyLeaderboardUsd ?? 0;
  const top5 = parseMoney(record.leaderboardTop5Wager ?? "") ?? 0;
  const loyalty = Math.max(
    0.5,
    1 - 0.02 * countRecentCasinoSwitches(record.casinoTimeline),
  );
  const langMult =
    record.language && !/^en/i.test(record.language) ? 0.7 : 1;
  const wagerPart = record.subAffiliate ? 0 : 0.2 * top5 + 15 * lb;
  return Math.max(
    (7.5 * pay + wagerPart + 200 * avg + 25 * peak) * loyalty * langMult,
    0,
  );
}

export function mvOf(record: StreamerRecord): number | null {
  if (record.mvPinned && record.marketValueUsd != null) {
    return record.marketValueUsd;
  }
  return computeMv(record) ?? record.marketValueUsd ?? null;
}

export function marketValueBreakdown(
  record: StreamerRecord,
): MarketValueBreakdown | null {
  const pay = parseMoney(record.estMonthlyPayment ?? "");
  if (!pay || pay <= 0) return null;

  const avg = record.avgViewers30d ?? 0;
  const peak = record.peakViewers30d ?? 0;
  const lb = record.monthlyLeaderboardUsd ?? 0;
  const top5 = parseMoney(record.leaderboardTop5Wager ?? "") ?? 0;
  const fmt = (n: number | null) =>
    n != null ? formatMarketValue(n) ?? "—" : "—";

  const parts: [string, string, number][] = [
    ["Streamer Pay", `$${fmt(pay)}/mo × 7.5`, 7.5 * pay],
    [
      "Top 5 Wager",
      record.subAffiliate
        ? "excluded — sub-affiliate"
        : top5
          ? `$${fmt(top5)} × 20%`
          : "—",
      record.subAffiliate ? 0 : 0.2 * top5,
    ],
    [
      "Leaderboard",
      record.subAffiliate
        ? "excluded — sub-affiliate"
        : lb
          ? `$${fmt(lb)} × 15`
          : "—",
      record.subAffiliate ? 0 : 15 * lb,
    ],
    [
      "Avg Viewers",
      avg ? `${avg.toLocaleString("en-US")} × $200` : "—",
      200 * avg,
    ],
    [
      "Peak Viewers",
      peak ? `${peak.toLocaleString("en-US")} × $25` : "—",
      25 * peak,
    ],
  ];

  const base = parts.reduce((sum, [, , v]) => sum + v, 0);
  const components = parts.map(([label, input, contribution]) => ({
    label,
    input,
    weight: base > 0 ? contribution / base : 0,
    contribution,
  }));

  const switches = countRecentCasinoSwitches(record.casinoTimeline);
  const loyalty = Math.max(0.5, 1 - 0.02 * switches);
  const langMult =
    record.language && !/^en/i.test(record.language) ? 0.7 : 1;

  const penalties: { label: string; pct: number }[] = [];
  if (loyalty < 1) {
    penalties.push({
      label: `Loyalty, ${switches} casino switch${switches > 1 ? "es" : ""} in the last 12 months`,
      pct: 1 - loyalty,
    });
  }
  if (langMult < 1) {
    penalties.push({ label: "Non-English audience", pct: 1 - langMult });
  }

  let running = base;
  for (const penalty of penalties) {
    running -= running * penalty.pct;
  }

  return {
    components,
    base,
    penalties,
    total: Math.max(running, 0),
  };
}

function formatMonthlyPayment(value: number): string {
  if (value >= 1e6) {
    const m = value / 1e6;
    return `$${m.toFixed(m % 1e6 ? 1 : 0)}M`;
  }
  if (value >= 1e3) {
    const k = value / 1e3;
    return `$${k.toFixed(k % 1e3 ? 1 : 0)}K`;
  }
  return `$${Math.round(value)}`;
}

function paymentLabel(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${formatMonthlyPayment(value)} / mo`;
  }
  const parsed = parseMoney(String(value));
  if (parsed) return `${formatMonthlyPayment(parsed)} / mo`;
  return String(value);
}

function mapDegen(level: string | null | undefined): string {
  if (/^h/i.test(level ?? "")) return "High";
  if (/^l/i.test(level ?? "")) return "Low";
  return "Medium";
}

function splitPastCasinos(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(/[,/&]| and /)
    .map((part) => canonicalCasinoName(part.trim()))
    .filter((part) => part && part !== "—");
}

export function mergeDbProfiles(
  base: StreamerRecord[],
  profiles: StreamerDbProfile[] | null | undefined,
): StreamerRecord[] {
  const seen = new Set<string>();
  let merged: StreamerRecord[] = [];
  for (const row of base) {
    const key = row.username.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }

  if (!profiles?.length) return merged;

  const byUser = new Map(
    profiles.map((p) => [p.username.trim().toLowerCase(), p]),
  );

  merged = merged.map((row) => {
    const db = byUser.get(row.username.trim().toLowerCase());
    if (!db) return row;
    const streamHours =
      row.avgViewers30d > 0
        ? Math.round(row.hoursWatched30d / row.avgViewers30d)
        : 0;
    const pastSet = new Set<string>();
    const pastCasinos: string[] = [];
    for (const name of [...row.pastCasinos, ...splitPastCasinos(db.pastCasinos as string)]) {
      const key = name.toLowerCase();
      if (name && name !== "—" && !pastSet.has(key)) {
        pastSet.add(key);
        pastCasinos.push(name);
      }
    }

    return {
      ...row,
      username: db.username.trim(),
      currentCasino:
        db.currentCasino != null
          ? canonicalCasinoName(db.currentCasino)
          : row.currentCasino,
      pastCasinos,
      casinoTimeline:
        db.casinoTimeline && db.casinoTimeline.length
          ? db.casinoTimeline
          : row.casinoTimeline,
      estMonthlyPayment:
        db.estMonthlyPayment != null
          ? paymentLabel(db.estMonthlyPayment)
          : row.estMonthlyPayment,
      degen: db.degenLevel != null ? mapDegen(db.degenLevel) : row.degen,
      rawFake:
        db.rawFake != null
          ? /^r/i.test(db.rawFake)
            ? "Raw"
            : "Fake"
          : row.rawFake,
      leaderboard: (parseMoney(String(db.monthlyLeaderboard ?? "")) ?? 0) > 0,
      leaderboardTop5Wager: db.monthlyTop5Wager ?? row.leaderboardTop5Wager,
      monthlyLeaderboardUsd:
        parseMoney(String(db.monthlyLeaderboard ?? "")) ??
        row.monthlyLeaderboardUsd,
      streamHours30d: streamHours,
      language: db.language ?? row.language,
      mainCasinoPartner: db.mainCasinoPartner ?? row.mainCasinoPartner,
      profileUrl: db.profileUrl ?? row.profileUrl,
      xProfile: db.xProfile ?? row.xProfile,
      youtube: db.youtube ?? row.youtube,
      discord: db.discord ?? row.discord,
      instagram: db.instagram ?? row.instagram,
      tiktok: db.tiktok ?? row.tiktok,
      telegram: db.telegram ?? row.telegram,
      website: db.website ?? row.website,
      avgViewers30d: db.avgViewers30d ?? row.avgViewers30d,
      peakViewers30d: db.peakViewers30d ?? row.peakViewers30d,
      imageUrl: db.imageUrl ?? row.imageUrl ?? null,
      bio: db.bio ?? row.bio,
      location: db.location ?? row.location,
      favoriteGame: db.favoriteGame ?? row.favoriteGame,
      biggestWinClip: db.biggestWinClip ?? row.biggestWinClip,
      biggestLossClip: db.biggestLossClip ?? row.biggestLossClip,
      subAffiliate: db.subAffiliate ?? row.subAffiliate ?? false,
      subAffiliateOf: db.subAffiliateOf ?? row.subAffiliateOf ?? null,
      affiliateCode: db.affiliateCode ?? row.affiliateCode,
      affiliateCodeBenefits:
        db.affiliateCodeBenefits ?? row.affiliateCodeBenefits,
      affiliateBenefitsRating:
        db.affiliateBenefitsRating ?? row.affiliateBenefitsRating,
      casesPacksPartner: db.casesPacksPartner ?? row.casesPacksPartner,
      otherContent: db.otherContent ?? row.otherContent,
      faceCam: db.faceCam ?? row.faceCam,
      marketValueUsd: db.marketValueUsd ?? row.marketValueUsd,
      mvPinned: db.mvPinned ?? false,
    };
  });

  const mergedKeys = new Set(
    merged.map((row) => row.username.trim().toLowerCase()),
  );

  for (const db of profiles) {
    const key = db.username.trim().toLowerCase();
    if (mergedKeys.has(key)) continue;
    mergedKeys.add(key);
    merged.push({
      username: db.username,
      platform: "Kick",
      live: false,
      currentCasino: db.currentCasino
        ? canonicalCasinoName(db.currentCasino)
        : "—",
      pastCasinos: splitPastCasinos(db.pastCasinos as string),
      casinoTimeline: db.casinoTimeline ?? undefined,
      estMonthlyPayment: paymentLabel(db.estMonthlyPayment),
      degen: mapDegen(db.degenLevel),
      rawFake: /^r/i.test(db.rawFake ?? "") ? "Raw" : "Fake",
      leaderboard: (parseMoney(String(db.monthlyLeaderboard ?? "")) ?? 0) > 0,
      leaderboardTop5Wager: db.monthlyTop5Wager ?? null,
      monthlyLeaderboardUsd:
        parseMoney(String(db.monthlyLeaderboard ?? "")) ?? null,
      followers: db.followers ?? 0,
      avgViewers30d: db.avgViewers30d ?? 0,
      peakViewers30d: db.peakViewers30d ?? 0,
      peakAllTime: db.peakAllTime ?? 0,
      hoursWatched30d: db.hoursWatched30d ?? 0,
      activeDays30d: db.activeDays30d ?? 0,
      topGames: db.topGames ?? "",
      lastStreamed:
        db.lastStreamed && !db.lastStreamed.startsWith("1970")
          ? db.lastStreamed
          : "",
      profileUrl:
        db.profileUrl ?? `https://kick.com/${db.username.toLowerCase()}`,
      xProfile: db.xProfile ?? null,
      hasStats: (db.followers ?? 0) > 0,
      language: db.language ?? null,
      mainCasinoPartner: db.mainCasinoPartner ?? null,
      youtube: db.youtube ?? null,
      discord: db.discord ?? null,
      instagram: db.instagram ?? null,
      tiktok: db.tiktok ?? null,
      telegram: db.telegram ?? null,
      website: db.website ?? null,
      imageUrl: db.imageUrl ?? null,
      bio: db.bio ?? null,
      location: db.location ?? null,
      favoriteGame: db.favoriteGame ?? null,
      biggestWinClip: db.biggestWinClip ?? null,
      biggestLossClip: db.biggestLossClip ?? null,
      subAffiliate: db.subAffiliate ?? false,
      subAffiliateOf: db.subAffiliateOf ?? null,
      affiliateCode: db.affiliateCode ?? null,
      affiliateCodeBenefits: db.affiliateCodeBenefits ?? null,
      affiliateBenefitsRating: db.affiliateBenefitsRating ?? null,
      casesPacksPartner: db.casesPacksPartner ?? null,
      otherContent: db.otherContent ?? null,
      faceCam: db.faceCam ?? null,
      marketValueUsd: db.marketValueUsd ?? null,
      mvPinned: db.mvPinned ?? false,
    });
  }

  return merged;
}

export function mergeLiveStats(
  streamers: StreamerRecord[],
  liveStats: Record<string, StreamerLiveStat> | null | undefined,
  liveNow: Record<string, StreamerLiveNow> | null | undefined,
): StreamerRecord[] {
  const hasStats = !!liveStats && Object.keys(liveStats).length > 0;
  const hasLive = !!liveNow && Object.keys(liveNow).length > 0;
  if (!hasStats && !hasLive) return streamers;

  return streamers.map((row) => {
    const key = row.username.toLowerCase();
    const stats = hasStats ? liveStats![key] : undefined;
    const live = hasLive ? liveNow![key] : undefined;
    let next = row;

    if (stats) {
      next = {
        ...next,
        avatarUrl: stats.pfp_url || next.avatarUrl,
        followers: stats.followers || next.followers,
        avgViewers30d: stats.avg_viewers_30d || next.avgViewers30d,
        peakViewers30d: stats.peak_viewers_30d || next.peakViewers30d,
        peakAllTime: stats.peak_all_time || next.peakAllTime,
        hoursWatched30d: stats.hours_watched_30d || next.hoursWatched30d,
        streamHours30d: stats.airtime_h_30d || next.streamHours30d,
        activeDays30d: stats.active_days_30d || next.activeDays30d,
        lastStreamed:
          (stats.last_streamed &&
          !stats.last_streamed.startsWith("1970")
            ? stats.last_streamed
            : "") || next.lastStreamed,
        firstStreamed: stats.first_streamed || next.firstStreamed,
        hasStats:
          (stats.avg_viewers_30d ?? 0) > 0 ||
          (stats.hours_watched_30d ?? 0) > 0 ||
          next.hasStats,
      };
    }

    if (hasLive) {
      next = {
        ...next,
        live: !!live,
        liveViewers: live?.viewers ?? null,
        liveUptimeMin: live?.uptime_min ?? null,
        liveThumb: live?.thumb_url ?? null,
        liveTitle: live?.title ?? null,
      };
    }

    return next;
  });
}

export function streamerHref(username: string): string {
  return `/streamers/${encodeURIComponent(username.trim())}`;
}

export function streamerSlug(username: string): string {
  return username.trim().toLowerCase();
}
