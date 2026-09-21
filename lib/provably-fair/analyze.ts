import type { StakeGameId } from "./constants";
import type {
  AnalyzerParams,
  AnalyzerSummary,
  GameParams,
  SeedInputs,
} from "./types";
import {
  verifyDice,
  verifyLimbo,
  verifyMines,
  verifyPlinko,
  verifyKeno,
  verifyRoulette,
  verifyFlip,
  verifyWheel,
  verifyDiamonds,
} from "./verify";
import type { PlinkoRisk, WheelRisk } from "./constants";

const MAX_SPAN = 10000;

type BetRow = {
  nonce: number;
  win: boolean;
  payout: number;
  betSize: number;
  roll?: number;
};

function summarize(
  game: string,
  bets: BetRow[],
  bankroll: number,
): AnalyzerSummary {
  let balance = bankroll;
  let wagered = 0;
  let returned = 0;
  let winStreak = 0;
  let loseStreak = 0;
  let longestWin = 0;
  let longestLose = 0;
  let wins = 0;

  for (const bet of bets) {
    wagered += bet.betSize;
    returned += bet.payout * bet.betSize;
    balance = balance - bet.betSize + bet.payout * bet.betSize;
    if (bet.win) {
      wins++;
      winStreak++;
      longestLose = Math.max(longestLose, loseStreak);
      loseStreak = 0;
    } else {
      loseStreak++;
      longestWin = Math.max(longestWin, winStreak);
      winStreak = 0;
    }
  }
  longestWin = Math.max(longestWin, winStreak);
  longestLose = Math.max(longestLose, loseStreak);

  const overCount = bets.filter((b) => (b.roll ?? 0) > 50).length;
  const underCount = bets.length - overCount;
  const roi = wagered > 0 ? ((returned - wagered) / wagered) * 100 : 0;

  return {
    game,
    totalBets: bets.length,
    wins,
    losses: bets.length - wins,
    winRate: bets.length ? (wins / bets.length) * 100 : 0,
    roi: parseFloat(roi.toFixed(2)),
    pnl: parseFloat((returned - wagered).toFixed(8)),
    longestWinStreak: longestWin,
    longestLoseStreak: longestLose,
    startingBankroll: bankroll,
    endingBankroll: parseFloat(balance.toFixed(8)),
    overCount,
    underCount,
  };
}

function clampRange(start: number, end: number): [number, number] {
  let a = Math.max(0, Math.floor(start));
  let b = Math.max(0, Math.floor(end));
  if (b < a) [a, b] = [b, a];
  if (b - a > MAX_SPAN) b = a + MAX_SPAN;
  return [a, b];
}

export function analyzeDice(
  seeds: SeedInputs,
  params: AnalyzerParams,
): AnalyzerSummary | null {
  if (!seeds.serverSeed?.trim()) return null;
  const [start, end] = clampRange(params.nonceStart, params.nonceEnd);
  const target = params.target ?? 50.5;
  const condition = params.condition ?? "over";
  const betSize = params.bettingSize || 1;
  const bets: BetRow[] = [];

  for (let nonce = start; nonce <= end; nonce++) {
    const roll = verifyDice({ ...seeds, nonce });
    const win = condition === "over" ? roll > target : roll < target;
    const payout = win
      ? condition === "over"
        ? 99 / (100 - target)
        : 99 / target
      : 0;
    bets.push({ nonce, win, payout, betSize, roll });
  }

  return summarize("dice", bets, params.bankroll || 0);
}

export function analyzeLimbo(
  seeds: SeedInputs,
  params: AnalyzerParams,
): AnalyzerSummary | null {
  if (!seeds.serverSeed?.trim()) return null;
  const [start, end] = clampRange(params.nonceStart, params.nonceEnd);
  const target = params.targetMultiplier ?? 2;
  const betSize = params.bettingSize || 1;
  const bets: BetRow[] = [];

  for (let nonce = start; nonce <= end; nonce++) {
    const mult = verifyLimbo({ ...seeds, nonce });
    const win = mult >= target;
    bets.push({ nonce, win, payout: win ? target : 0, betSize });
  }

  return summarize("limbo", bets, params.bankroll || 0);
}

export function analyzeMines(
  seeds: SeedInputs,
  params: AnalyzerParams,
  gameParams: GameParams,
): AnalyzerSummary | null {
  if (!seeds.serverSeed?.trim()) return null;
  const [start, end] = clampRange(params.nonceStart, params.nonceEnd);
  const mineCount = gameParams.mineCount ?? 3;
  const gridSize = gameParams.gridSize ?? 25;
  const betSize = params.bettingSize || 1;
  const bets: BetRow[] = [];

  // Analyzer heuristic: treat first tile (0) as chosen; win if not a mine.
  for (let nonce = start; nonce <= end; nonce++) {
    const mines = verifyMines({ ...seeds, nonce }, mineCount, gridSize);
    const win = !mines.includes(0);
    const safe = gridSize - mineCount;
    const payout = win ? gridSize / safe : 0;
    bets.push({ nonce, win, payout, betSize });
  }

  return summarize("mines", bets, params.bankroll || 0);
}

export function analyzeGame(
  game: StakeGameId | string,
  seeds: SeedInputs,
  analyzer: AnalyzerParams,
  gameParams: GameParams = {},
): AnalyzerSummary | null {
  switch (game) {
    case "dice":
      return analyzeDice(seeds, analyzer);
    case "limbo":
      return analyzeLimbo(seeds, analyzer);
    case "mines":
      return analyzeMines(seeds, analyzer, gameParams);
    case "plinko": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const rows = gameParams.rows ?? 16;
      const risk = (gameParams.risk as PlinkoRisk) ?? "low";
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const r = verifyPlinko({ ...seeds, nonce }, rows, risk);
        const win = r.multiplier >= 1;
        bets.push({ nonce, win, payout: r.multiplier, betSize });
      }
      return summarize("plinko", bets, analyzer.bankroll || 0);
    }
    case "keno": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const drawn = verifyKeno({ ...seeds, nonce });
        // No player picks — just report draws; treat as informational (no win).
        bets.push({ nonce, win: false, payout: 0, betSize });
        void drawn;
      }
      return summarize("keno", bets, analyzer.bankroll || 0);
    }
    case "roulette": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const pocket = verifyRoulette({ ...seeds, nonce });
        // Red/black style: even (excl 0) = win at 2x as a simple proxy.
        const win = pocket !== 0 && pocket % 2 === 0;
        bets.push({ nonce, win, payout: win ? 2 : 0, betSize, roll: pocket });
      }
      return summarize("roulette", bets, analyzer.bankroll || 0);
    }
    case "flip": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const coins = gameParams.coins ?? 1;
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const outcomes = verifyFlip({ ...seeds, nonce }, coins);
        const heads = outcomes.filter((o) => o === "heads").length;
        const win = heads > coins / 2;
        bets.push({ nonce, win, payout: win ? 2 : 0, betSize });
      }
      return summarize("flip", bets, analyzer.bankroll || 0);
    }
    case "wheel": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const segments = gameParams.segments ?? 10;
      const risk = (gameParams.risk as WheelRisk) ?? "low";
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const r = verifyWheel({ ...seeds, nonce }, segments, risk);
        const win = r.multiplier > 0;
        bets.push({ nonce, win, payout: r.multiplier, betSize });
      }
      return summarize("wheel", bets, analyzer.bankroll || 0);
    }
    case "diamonds": {
      if (!seeds.serverSeed?.trim()) return null;
      const [start, end] = clampRange(analyzer.nonceStart, analyzer.nonceEnd);
      const betSize = analyzer.bettingSize || 1;
      const bets: BetRow[] = [];
      for (let nonce = start; nonce <= end; nonce++) {
        const gems = verifyDiamonds({ ...seeds, nonce });
        const unique = new Set(gems).size;
        const win = unique <= 3;
        bets.push({ nonce, win, payout: win ? 2 : 0, betSize });
      }
      return summarize("diamonds", bets, analyzer.bankroll || 0);
    }
    default:
      return null;
  }
}
