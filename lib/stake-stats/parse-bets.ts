import {
  dayKey,
  hourKey,
  minuteKey,
  titleCaseGame,
} from "@/lib/stake-stats/format";
import { toUsdPair } from "@/lib/stake-stats/rates";
import {
  CHART_COLORS,
  type AnalyzerStats,
  type GameStat,
  type NormalizedBet,
} from "@/lib/stake-stats/types";

const IGNORED_BET_TYPES = new Set([
  "casino",
  "evolution",
  "ezugi",
  "crash",
  "sportsbook",
]);

const CANCEL_EVENT = new Set([
  "rejectednotfound",
  "rejected",
  "cancelled",
  "canceled",
  "void",
  "voided",
]);

const CANCEL_STATUS = new Set([
  "cancelled",
  "canceled",
  "rejected",
  "void",
  "voided",
  "refunded",
]);

function isSportsbookCancel(
  type: string | undefined,
  status: string | undefined,
  events?: Array<{ type?: string }>,
  outcomes?: Array<{ cancel?: boolean }>,
) {
  if (type !== "sportsbook") return false;
  if (status && CANCEL_STATUS.has(status.toLowerCase())) return true;
  if (events?.some((e) => CANCEL_EVENT.has((e.type || "").toLowerCase())))
    return true;
  if (
    outcomes &&
    outcomes.length > 0 &&
    outcomes.every((o) => o.cancel === true)
  ) {
    return true;
  }
  return false;
}

function normalizeRawBet(raw: Record<string, unknown>): NormalizedBet | null {
  if ("data" in raw && raw.data == null) return null;

  if ("data" in raw && raw.data != null) {
    const data = raw.data as Record<string, unknown>;
    if (!data) return null;
    const createdAt =
      (data.createdAt as number) ||
      new Date(String(raw.created_at)).getTime();
    const currency = String(data.currency || "unknown");
    const amount = Number(data.amount) || 0;
    const payoutMultiplier =
      Number(data.payoutMultiplier) ||
      (amount ? Number(data.payout || 0) / amount : 0);
    const { wagerUsd, payoutUsd } = toUsdPair(
      currency,
      amount,
      payoutMultiplier,
      data.value as number | undefined,
    );
    const cancelled = isSportsbookCancel(
      data.type as string | undefined,
      data.status as string | undefined,
      data.events as Array<{ type?: string }> | undefined,
      data.outcomes as Array<{ cancel?: boolean }> | undefined,
    );
    const payout = cancelled ? wagerUsd : payoutUsd;
    return {
      id: String(data.id || raw.id || ""),
      amount: wagerUsd,
      payout,
      gameName:
        String(data.gameName || "") ||
        (data.type === "sportsbook" ? "Sportsbook" : "Unknown"),
      currency,
      createdAt,
      iid: data.iid as string | undefined,
      serverSeedHash: data.serverSeedHash as string | undefined,
      serverSeedId: data.serverSeedId as string | undefined,
      multiplier: payoutMultiplier,
      betType: data.type as string | undefined,
    };
  }

  const createdAt =
    typeof raw.createdAt === "string"
      ? new Date(raw.createdAt).getTime()
      : Number(raw.createdAt) || 0;
  const currency = String(raw.currency || "unknown");
  const amount = Number(raw.amount) || 0;
  const payoutMultiplier =
    Number(raw.payoutMultiplier) ||
    (amount ? Number(raw.payout || 0) / amount : 0);
  const { wagerUsd, payoutUsd } = toUsdPair(
    currency,
    amount,
    payoutMultiplier,
    raw.value as number | undefined,
  );
  const cancelled = isSportsbookCancel(
    raw.type as string | undefined,
    raw.status as string | undefined,
    raw.events as Array<{ type?: string }> | undefined,
    raw.outcomes as Array<{ cancel?: boolean }> | undefined,
  );
  return {
    id: String(raw.id || ""),
    amount: wagerUsd,
    payout: cancelled ? wagerUsd : payoutUsd,
    gameName:
      String(raw.gameName || raw.game || "") ||
      (raw.type === "sportsbook" ? "Sportsbook" : "Unknown"),
    currency,
    createdAt,
    iid: raw.iid as string | undefined,
    serverSeedHash: raw.serverSeedHash as string | undefined,
    serverSeedId: raw.serverSeedId as string | undefined,
    multiplier: payoutMultiplier,
    betType: raw.type as string | undefined,
  };
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function emptyStats(): AnalyzerStats {
  return {
    totalWager: 0,
    totalPayout: 0,
    pnl: 0,
    totalBets: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    avgBetSize: 0,
    medianStake: 0,
    maxDrawdown: 0,
    biggestWin: 0,
    biggestWinGame: "",
    biggestWinBetId: "",
    biggestLoss: 0,
    biggestLossGame: "",
    biggestLossBetId: "",
    gamesPlayed: 0,
    gameStats: [],
    seedPairs: [],
    topMultipliers: [],
    bonusStats: {
      totalSlotBets: 0,
      totalBonuses: 0,
      hasEnoughData: false,
      slots: [],
    },
    currencyStats: [],
    dailyPnL: [],
    hourlyPnL: [],
    minutePnL: [],
    betDistribution: [],
    dateRange: { start: "", end: "" },
    lastUpdated: new Date().toISOString(),
    totalFilesProcessed: 0,
  };
}

/** Analyze a list of raw Stake archive bet objects. */
export function analyzeBets(rawBets: unknown[]): AnalyzerStats {
  if (!rawBets || rawBets.length === 0) return emptyStats();

  let totalWager = 0;
  let totalPayout = 0;
  let bets = 0;
  let wins = 0;
  let losses = 0;
  let biggestWin = 0;
  let biggestWinGame = "";
  let biggestWinBetId = "";
  let biggestLoss = 0;
  let biggestLossGame = "";
  let biggestLossBetId = "";
  let minDate = Infinity;
  let maxDate = -Infinity;

  const gameMap = new Map<
    string,
    {
      bets: number;
      wins: number;
      losses: number;
      totalWager: number;
      totalPayout: number;
      biggestWin: number;
      biggestLoss: number;
      sumNet: number;
      sumNetSq: number;
    }
  >();
  const seedMap = new Map<
    string,
    {
      serverSeedHash: string;
      serverSeedId?: string;
      bets: number;
      minDate: number;
      maxDate: number;
      game: string;
    }
  >();
  const topMult: Array<{
    game: string;
    multiplier: number;
    stake: number;
    payout: number;
    betId?: string;
  }> = [];
  const slotTimes = new Map<string, number[]>();
  const currencyMap = new Map<
    string,
    { totalWager: number; totalPayout: number; bets: number }
  >();
  const daily = new Map<
    string,
    { wager: number; payout: number; bets: number }
  >();
  const hourly = new Map<
    string,
    { wager: number; payout: number; bets: number }
  >();
  const minute = new Map<
    string,
    { wager: number; payout: number; bets: number }
  >();
  const stakes: number[] = [];
  const timeline: Array<{ t: number; pnl: number }> = [];

  for (const raw of rawBets) {
    if (!raw || typeof raw !== "object") continue;
    const bet = normalizeRawBet(raw as Record<string, unknown>);
    if (!bet) continue;

    const game = titleCaseGame(bet.gameName);
    const currency = bet.currency.toUpperCase();
    const net = bet.payout - bet.amount;
    const hasTime = Number.isFinite(bet.createdAt);
    const iidPart = bet.iid?.split(":")[1] || "";

    bets += 1;
    stakes.push(bet.amount);
    if (hasTime) timeline.push({ t: bet.createdAt, pnl: net });
    totalWager += bet.amount;
    totalPayout += bet.payout;

    if (bet.payout > bet.amount) {
      wins += 1;
      if (net > biggestWin) {
        biggestWin = net;
        biggestWinGame = game;
        biggestWinBetId = iidPart;
      }
    } else if (bet.payout < bet.amount) {
      losses += 1;
      if (net < biggestLoss) {
        biggestLoss = net;
        biggestLossGame = game;
        biggestLossBetId = iidPart;
      }
    }

    if (hasTime) {
      if (bet.createdAt < minDate) minDate = bet.createdAt;
      if (bet.createdAt > maxDate) maxDate = bet.createdAt;
    }

    const g =
      gameMap.get(game) ||
      ({
        bets: 0,
        wins: 0,
        losses: 0,
        totalWager: 0,
        totalPayout: 0,
        biggestWin: 0,
        biggestLoss: 0,
        sumNet: 0,
        sumNetSq: 0,
      } as const);
    const gg = { ...g };
    gg.bets += 1;
    gg.totalWager += bet.amount;
    gg.totalPayout += bet.payout;
    gg.sumNet += net;
    gg.sumNetSq += net * net;
    if (bet.payout > bet.amount) {
      gg.wins += 1;
      if (net > gg.biggestWin) gg.biggestWin = net;
    } else if (bet.payout < bet.amount) {
      gg.losses += 1;
      if (net < gg.biggestLoss) gg.biggestLoss = net;
    }
    gameMap.set(game, gg);

    if (bet.serverSeedHash) {
      const key = bet.serverSeedId || bet.serverSeedHash;
      const seed = seedMap.get(key) || {
        serverSeedHash: bet.serverSeedHash,
        serverSeedId: bet.serverSeedId,
        bets: 0,
        minDate: Infinity,
        maxDate: -Infinity,
        game,
      };
      seed.bets += 1;
      if (hasTime) {
        if (bet.createdAt < seed.minDate) seed.minDate = bet.createdAt;
        if (bet.createdAt > seed.maxDate) seed.maxDate = bet.createdAt;
      }
      seedMap.set(key, seed);
    }

    const mult =
      bet.multiplier ?? (bet.amount > 0 ? bet.payout / bet.amount : 0);
    if (mult > 1 && bet.payout > bet.amount) {
      topMult.push({
        game,
        multiplier: mult,
        stake: bet.amount,
        payout: bet.payout,
        betId: iidPart || undefined,
      });
    }

    if (
      hasTime &&
      bet.betType &&
      !IGNORED_BET_TYPES.has(bet.betType)
    ) {
      const arr = slotTimes.get(game) || [];
      arr.push(bet.createdAt);
      slotTimes.set(game, arr);
    }

    const cur = currencyMap.get(currency) || {
      totalWager: 0,
      totalPayout: 0,
      bets: 0,
    };
    cur.totalWager += bet.amount;
    cur.totalPayout += bet.payout;
    cur.bets += 1;
    currencyMap.set(currency, cur);

    if (hasTime) {
      const d = dayKey(bet.createdAt);
      const db = daily.get(d) || { wager: 0, payout: 0, bets: 0 };
      db.wager += bet.amount;
      db.payout += bet.payout;
      db.bets += 1;
      daily.set(d, db);

      const h = hourKey(bet.createdAt);
      const hb = hourly.get(h) || { wager: 0, payout: 0, bets: 0 };
      hb.wager += bet.amount;
      hb.payout += bet.payout;
      hb.bets += 1;
      hourly.set(h, hb);

      const m = minuteKey(bet.createdAt);
      const mb = minute.get(m) || { wager: 0, payout: 0, bets: 0 };
      mb.wager += bet.amount;
      mb.payout += bet.payout;
      mb.bets += 1;
      minute.set(m, mb);
    }
  }

  const gameStats: GameStat[] = Array.from(gameMap.entries())
    .map(([game, t]) => ({
      game,
      bets: t.bets,
      wins: t.wins,
      losses: t.losses,
      totalWager: t.totalWager,
      totalPayout: t.totalPayout,
      pnl: t.totalPayout - t.totalWager,
      roi:
        t.totalWager > 0
          ? ((t.totalPayout - t.totalWager) / t.totalWager) * 100
          : 0,
      winRate: t.bets > 0 ? (t.wins / t.bets) * 100 : 0,
      avgBet: t.bets > 0 ? t.totalWager / t.bets : 0,
      biggestWin: t.biggestWin,
      biggestLoss: t.biggestLoss,
      volatility:
        t.bets > 0
          ? Math.sqrt(
              Math.max(
                0,
                t.sumNetSq / t.bets - (t.sumNet / t.bets) ** 2,
              ),
            )
          : 0,
      sumNet: t.sumNet,
      sumNetSq: t.sumNetSq,
    }))
    .sort((a, b) => b.bets - a.bets);

  const seedPairs = Array.from(seedMap.values())
    .map((s) => ({
      serverSeedHash: s.serverSeedHash,
      serverSeedId: s.serverSeedId,
      bets: s.bets,
      start: s.minDate !== Infinity ? dayKey(s.minDate) : "",
      end: s.maxDate !== -Infinity ? dayKey(s.maxDate) : "",
      game: s.game,
    }))
    .sort((a, b) => b.bets - a.bets);

  const topMultipliers = topMult
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 100);

  const slots: Array<{ game: string; bets: number; bonuses: number }> = [];
  let totalSlotBets = 0;
  let totalBonuses = 0;
  for (const [game, times] of slotTimes) {
    times.sort((a, b) => a - b);
    let bonuses = 0;
    for (let i = 1; i < times.length; i++) {
      if (times[i] - times[i - 1] >= 30_000) bonuses += 1;
    }
    totalSlotBets += times.length;
    totalBonuses += bonuses;
    slots.push({ game, bets: times.length, bonuses });
  }
  slots.sort((a, b) => b.bonuses - a.bonuses || b.bets - a.bets);

  const currencyStats = Array.from(currencyMap.entries())
    .map(([currency, t]) => ({
      currency,
      totalWager: t.totalWager,
      totalPayout: t.totalPayout,
      pnl: t.totalPayout - t.totalWager,
      bets: t.bets,
    }))
    .sort((a, b) => b.bets - a.bets);

  const dailyPnL = Array.from(daily.entries())
    .map(([date, t]) => ({
      date,
      pnl: t.payout - t.wager,
      wager: t.wager,
      payout: t.payout,
      bets: t.bets,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const hourlyPnL = Array.from(hourly.entries())
    .map(([timestamp, t]) => ({
      timestamp,
      pnl: t.payout - t.wager,
      wager: t.wager,
      payout: t.payout,
      bets: t.bets,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const minutePnL = Array.from(minute.entries())
    .map(([timestamp, t]) => ({
      timestamp,
      pnl: t.payout - t.wager,
      wager: t.wager,
      payout: t.payout,
      bets: t.bets,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const betDistribution = gameStats.map((g, i) => ({
    game: g.game,
    percentage: bets > 0 ? Math.round((g.bets / bets) * 1000) / 10 : 0,
    bets: g.bets,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const sortedTimeline = timeline.sort((a, b) => a.t - b.t);
  let running = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const point of sortedTimeline) {
    running += point.pnl;
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  return {
    totalWager,
    totalPayout,
    pnl: totalPayout - totalWager,
    totalBets: bets,
    wins,
    losses,
    winRate: bets > 0 ? (wins / bets) * 100 : 0,
    avgBetSize: bets > 0 ? totalWager / bets : 0,
    medianStake: median(stakes),
    maxDrawdown,
    biggestWin,
    biggestWinGame,
    biggestWinBetId,
    biggestLoss,
    biggestLossGame,
    biggestLossBetId,
    gamesPlayed: gameMap.size,
    gameStats,
    seedPairs,
    topMultipliers,
    bonusStats: {
      totalSlotBets,
      totalBonuses,
      hasEnoughData: totalSlotBets >= 30,
      slots,
    },
    currencyStats,
    dailyPnL,
    hourlyPnL,
    minutePnL,
    betDistribution,
    dateRange: {
      start: minDate !== Infinity ? dayKey(minDate) : "",
      end: maxDate !== -Infinity ? dayKey(maxDate) : "",
    },
    lastUpdated: new Date().toISOString(),
    totalFilesProcessed: 1,
  };
}

/** Merge two analyzer payloads (multi-file upload). */
export function mergeStats(
  a: AnalyzerStats,
  b: AnalyzerStats,
): AnalyzerStats {
  const gameMap = new Map<string, GameStat>();
  for (const g of a.gameStats) gameMap.set(g.game, { ...g });
  for (const g of b.gameStats) {
    const cur = gameMap.get(g.game);
    if (cur) {
      cur.bets += g.bets;
      cur.wins += g.wins;
      cur.losses += g.losses;
      cur.totalWager += g.totalWager;
      cur.totalPayout += g.totalPayout;
      cur.pnl = cur.totalPayout - cur.totalWager;
      cur.roi =
        cur.totalWager > 0
          ? ((cur.totalPayout - cur.totalWager) / cur.totalWager) * 100
          : 0;
      cur.winRate = cur.bets > 0 ? (cur.wins / cur.bets) * 100 : 0;
      cur.avgBet = cur.bets > 0 ? cur.totalWager / cur.bets : 0;
      if (g.biggestWin > cur.biggestWin) cur.biggestWin = g.biggestWin;
      if (g.biggestLoss < cur.biggestLoss) cur.biggestLoss = g.biggestLoss;
      if (
        cur.sumNet != null &&
        cur.sumNetSq != null &&
        g.sumNet != null &&
        g.sumNetSq != null
      ) {
        cur.sumNet += g.sumNet;
        cur.sumNetSq += g.sumNetSq;
        cur.volatility =
          cur.bets > 0
            ? Math.sqrt(
                Math.max(
                  0,
                  cur.sumNetSq / cur.bets - (cur.sumNet / cur.bets) ** 2,
                ),
              )
            : 0;
      }
    } else {
      gameMap.set(g.game, { ...g });
    }
  }

  const currencyMap = new Map(a.currencyStats.map((c) => [c.currency, { ...c }]));
  for (const c of b.currencyStats) {
    const cur = currencyMap.get(c.currency);
    if (cur) {
      cur.totalWager += c.totalWager;
      cur.totalPayout += c.totalPayout;
      cur.pnl = cur.totalPayout - cur.totalWager;
      cur.bets += c.bets;
    } else currencyMap.set(c.currency, { ...c });
  }

  const mergeTime = (
    left: AnalyzerStats["dailyPnL"],
    right: AnalyzerStats["dailyPnL"],
    key: "date" | "timestamp",
  ) => {
    const map = new Map<string, (typeof left)[number]>();
    for (const row of left) {
      const k = String(row[key] ?? "");
      map.set(k, { ...row });
    }
    for (const row of right) {
      const k = String(row[key] ?? "");
      const cur = map.get(k);
      if (cur) {
        cur.wager += row.wager;
        cur.payout += row.payout;
        cur.pnl = cur.payout - cur.wager;
        cur.bets += row.bets;
      } else map.set(k, { ...row });
    }
    return Array.from(map.values()).sort((x, y) =>
      String(x[key] ?? "").localeCompare(String(y[key] ?? "")),
    );
  };

  const gameStats = Array.from(gameMap.values()).sort(
    (x, y) => y.bets - x.bets,
  );
  const currencyStats = Array.from(currencyMap.values()).sort(
    (x, y) => y.bets - x.bets,
  );
  const dailyPnL = mergeTime(a.dailyPnL, b.dailyPnL, "date");
  const hourlyPnL = mergeTime(
    a.hourlyPnL || [],
    b.hourlyPnL || [],
    "timestamp",
  );
  const minutePnL = mergeTime(
    a.minutePnL || [],
    b.minutePnL || [],
    "timestamp",
  );

  const totalBets = a.totalBets + b.totalBets;
  const totalWager = a.totalWager + b.totalWager;
  const totalPayout = a.totalPayout + b.totalPayout;
  const wins = a.wins + b.wins;
  const losses = a.losses + b.losses;

  const seedMap = new Map<string, AnalyzerStats["seedPairs"][number]>();
  for (const s of [...(a.seedPairs ?? []), ...(b.seedPairs ?? [])]) {
    const key = s.serverSeedId || s.serverSeedHash;
    const cur = seedMap.get(key);
    if (cur) {
      cur.bets += s.bets;
      if (s.start < cur.start) cur.start = s.start;
      if (s.end > cur.end) cur.end = s.end;
    } else seedMap.set(key, { ...s });
  }

  const topMultipliers = [
    ...(a.topMultipliers ?? []),
    ...(b.topMultipliers ?? []),
  ]
    .sort((x, y) => y.multiplier - x.multiplier)
    .slice(0, 100);

  const slotMap = new Map<string, AnalyzerStats["bonusStats"]["slots"][number]>();
  for (const s of [
    ...(a.bonusStats?.slots ?? []),
    ...(b.bonusStats?.slots ?? []),
  ]) {
    const cur = slotMap.get(s.game);
    if (cur) {
      cur.bets += s.bets;
      cur.bonuses += s.bonuses;
    } else slotMap.set(s.game, { ...s });
  }
  const slots = Array.from(slotMap.values()).sort(
    (x, y) => y.bonuses - x.bonuses || y.bets - x.bets,
  );
  const totalSlotBets = slots.reduce((n, s) => n + s.bets, 0);

  const biggestWin =
    b.biggestWin > a.biggestWin ? b.biggestWin : a.biggestWin;
  const biggestWinGame =
    b.biggestWin > a.biggestWin ? b.biggestWinGame : a.biggestWinGame;
  const biggestWinBetId =
    b.biggestWin > a.biggestWin ? b.biggestWinBetId : a.biggestWinBetId;
  const biggestLoss =
    b.biggestLoss < a.biggestLoss ? b.biggestLoss : a.biggestLoss;
  const biggestLossGame =
    b.biggestLoss < a.biggestLoss ? b.biggestLossGame : a.biggestLossGame;
  const biggestLossBetId =
    b.biggestLoss < a.biggestLoss ? b.biggestLossBetId : a.biggestLossBetId;

  return {
    totalWager,
    totalPayout,
    pnl: totalPayout - totalWager,
    totalBets,
    wins,
    losses,
    winRate: totalBets > 0 ? (wins / totalBets) * 100 : 0,
    avgBetSize: totalBets > 0 ? totalWager / totalBets : 0,
    medianStake:
      totalBets > 0
        ? ((a.medianStake ?? 0) * a.totalBets +
            (b.medianStake ?? 0) * b.totalBets) /
          totalBets
        : 0,
    maxDrawdown: Math.max(a.maxDrawdown ?? 0, b.maxDrawdown ?? 0),
    biggestWin,
    biggestWinGame,
    biggestWinBetId,
    biggestLoss,
    biggestLossGame,
    biggestLossBetId,
    gamesPlayed: gameMap.size,
    gameStats,
    seedPairs: Array.from(seedMap.values()).sort((x, y) => y.bets - x.bets),
    topMultipliers,
    bonusStats: {
      totalSlotBets,
      totalBonuses: slots.reduce((n, s) => n + s.bonuses, 0),
      hasEnoughData: totalSlotBets >= 30,
      slots,
    },
    currencyStats,
    dailyPnL,
    hourlyPnL,
    minutePnL,
    betDistribution: gameStats.map((g, i) => ({
      game: g.game,
      percentage:
        totalBets > 0 ? Math.round((g.bets / totalBets) * 1000) / 10 : 0,
      bets: g.bets,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    dateRange: {
      start:
        a.dateRange.start < b.dateRange.start
          ? a.dateRange.start
          : b.dateRange.start,
      end:
        a.dateRange.end > b.dateRange.end ? a.dateRange.end : b.dateRange.end,
    },
    lastUpdated: new Date().toISOString(),
    totalFilesProcessed: a.totalFilesProcessed + 1,
  };
}

export async function readJsonFile(file: File): Promise<unknown[]> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  if (Array.isArray(parsed)) return parsed;
  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { data?: unknown }).data)
  ) {
    return (parsed as { data: unknown[] }).data;
  }
  return [];
}

/** Pick chart granularity based on data density (port of `es`). */
export function pickSeries(stats: AnalyzerStats) {
  const daily = stats.dailyPnL;
  const hourly = stats.hourlyPnL;
  const minute = stats.minutePnL;
  const useMinute = hourly.length <= 3 && minute.length > hourly.length;
  const useHourly = !useMinute && daily.length <= 3 && hourly.length > daily.length;
  if (useMinute && minute.length > 0) {
    return {
      granularity: "minute" as const,
      points: minute.map((p) => ({
        label: (p.timestamp || "").slice(11, 16),
        date: p.timestamp || "",
        pnl: p.pnl,
      })),
    };
  }
  if (useHourly && hourly.length > 0) {
    return {
      granularity: "hour" as const,
      points: hourly.map((p) => ({
        label: (p.timestamp || "").slice(5, 13),
        date: p.timestamp || "",
        pnl: p.pnl,
      })),
    };
  }
  return {
    granularity: "day" as const,
    points: daily.map((p) => ({
      label: (p.date || "").slice(5),
      date: p.date || "",
      pnl: p.pnl,
    })),
  };
}

export function cumulativeSeries(stats: AnalyzerStats) {
  const { points } = pickSeries(stats);
  let running = 0;
  return points.map((p) => {
    running += p.pnl;
    return { label: p.label, date: p.date, value: running };
  });
}
