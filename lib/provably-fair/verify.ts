import {
  CARDS,
  DIAMOND_PALETTE,
  DRAGON_TOWER_CONFIG,
  LIMBO_MAX,
  PLINKO_MULTIPLIERS,
  WHEEL_PAYOUTS,
  type DragonDifficulty,
  type PlinkoRisk,
  type StakeGameId,
  type WheelRisk,
} from "./constants";
import { hmacSha256, stringToBytes } from "./crypto";
import { generateFloats } from "./stake-algorithm";
import type {
  GameParams,
  SeedInputs,
  VerifyResult,
} from "./types";

export function round2(x: number): number {
  return Math.floor(Number((100 * x).toPrecision(12))) / 100;
}

function seedsReady(seeds: SeedInputs): boolean {
  return (
    Boolean(seeds.serverSeed?.trim()) && Boolean(seeds.clientSeed?.trim())
  );
}

/** Fisher–Yates pick using successive floats against a shrinking pool. */
function fyPick(floats: number[], size: number, count: number, offset = 0): number[] {
  const pool = Array.from({ length: size }, (_, i) => i + offset);
  const picked: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(floats[i] * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked;
}

export function verifyDice(seeds: SeedInputs): number {
  const f = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    1,
    0,
    false,
  )[0];
  return round2((10001 * f) / 100);
}

export function verifyLimbo(seeds: SeedInputs, houseEdge = 0.99): number {
  const f = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    1,
    0,
    false,
  )[0];
  const range = 1e8;
  const raw = f * range + 1;
  const mult = Math.min(Math.max((range / raw) * houseEdge, 1), LIMBO_MAX);
  return Math.floor(100 * mult) / 100;
}

export function verifyCrash(seeds: SeedInputs, houseEdge = 0.99): number {
  const digest = hmacSha256(
    stringToBytes(seeds.serverSeed),
    stringToBytes(seeds.clientSeed),
  );
  const n =
    ((digest[0] << 24) | (digest[1] << 16) | (digest[2] << 8) | digest[3]) >>>
    0;
  return Math.max(
    1,
    Math.floor((0x100000000 / (n + 1)) * houseEdge * 100) / 100,
  );
}

export function verifyRoulette(seeds: SeedInputs): number {
  const f = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    1,
    0,
    false,
  )[0];
  return Math.floor(37 * f);
}

export function verifyWheel(
  seeds: SeedInputs,
  segments: number,
  risk: WheelRisk,
): { index: number; multiplier: number } {
  const f = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    1,
    0,
    false,
  )[0];
  const index = Math.floor(f * segments);
  const table = WHEEL_PAYOUTS[segments]?.[risk];
  const multiplier = table?.[index] ?? 0;
  return { index, multiplier };
}

export function verifyPlinko(
  seeds: SeedInputs,
  rows: number,
  risk: PlinkoRisk,
): { path: ("left" | "right")[]; bucket: number; multiplier: number } {
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    rows,
    0,
    false,
  );
  const path = floats.map((f) =>
    Math.floor(2 * f) === 0 ? ("left" as const) : ("right" as const),
  );
  const bucket = path.filter((p) => p === "right").length;
  const multiplier = PLINKO_MULTIPLIERS[rows]?.[risk]?.[bucket] ?? 0;
  return { path, bucket, multiplier };
}

export function verifyMines(
  seeds: SeedInputs,
  mineCount: number,
  gridSize = 25,
): number[] {
  const floatCount = Math.max(gridSize - 1, mineCount);
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    floatCount,
    0,
    false,
  );
  return fyPick(floats, gridSize, mineCount).sort((a, b) => a - b);
}

export function verifyKeno(seeds: SeedInputs): number[] {
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    10,
    0,
    false,
  );
  return fyPick(floats, 40, 10, 1).sort((a, b) => a - b);
}

export function verifyFlip(seeds: SeedInputs, coins: number): ("heads" | "tails")[] {
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    20,
    0,
    false,
  );
  return floats
    .map((f) => (f <= 0.5 ? ("tails" as const) : ("heads" as const)))
    .slice(0, coins);
}

export function verifyDiamonds(seeds: SeedInputs): string[] {
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    5,
    0,
    false,
  );
  return floats.map((f) => DIAMOND_PALETTE[Math.floor(7 * f)]);
}

export function verifyCards(
  seeds: SeedInputs,
  cardCount: number,
  emptyNonceWhenZero = true,
): string[] {
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    cardCount,
    0,
    emptyNonceWhenZero,
  );
  return floats.map((f) => CARDS[Math.floor(52 * f)]);
}

export function verifyDragonTower(
  seeds: SeedInputs,
  difficulty: DragonDifficulty,
): {
  level: number;
  eggPositions: number[];
  safePositions: number[];
}[] {
  const cfg = DRAGON_TOWER_CONFIG[difficulty];
  const levels = cfg.levels ?? 9;
  const floats = generateFloats(
    seeds.serverSeed,
    seeds.clientSeed,
    seeds.nonce,
    9 * cfg.eggs,
    0,
    false,
  );
  const result: {
    level: number;
    eggPositions: number[];
    safePositions: number[];
  }[] = [];

  for (let level = 0; level < levels; level++) {
    const levelFloats = floats.slice(level * cfg.eggs, (level + 1) * cfg.eggs);
    const eggs = fyPick(levelFloats, cfg.tiles, cfg.eggs).sort((a, b) => a - b);
    const safe = Array.from({ length: cfg.tiles }, (_, i) => i).filter(
      (i) => !eggs.includes(i),
    );
    result.push({
      level: level + 1,
      eggPositions: eggs,
      safePositions: safe,
    });
  }
  return result;
}

export function verifyStake(
  game: StakeGameId | string,
  seeds: SeedInputs,
  params: GameParams = {},
): VerifyResult | null {
  if (!seedsReady(seeds)) return null;

  switch (game) {
    case "dice":
      return { game: "dice", roll: verifyDice(seeds) };
    case "limbo":
      return { game: "limbo", multiplier: verifyLimbo(seeds) };
    case "crash":
      return { game: "crash", crashPoint: verifyCrash(seeds) };
    case "roulette":
      return { game: "roulette", pocket: verifyRoulette(seeds) };
    case "wheel": {
      const segments = params.segments ?? 10;
      const risk = (params.risk as WheelRisk) ?? "low";
      const r = verifyWheel(seeds, segments, risk);
      return { game: "wheel", ...r };
    }
    case "plinko": {
      const rows = params.rows ?? 16;
      const risk = (params.risk as PlinkoRisk) ?? "low";
      const r = verifyPlinko(seeds, rows, risk);
      return { game: "plinko", ...r };
    }
    case "mines": {
      const mineCount = params.mineCount ?? 3;
      const gridSize = params.gridSize ?? 25;
      return {
        game: "mines",
        mines: verifyMines(seeds, mineCount, gridSize),
        gridSize,
      };
    }
    case "keno":
      return { game: "keno", drawn: verifyKeno(seeds) };
    case "flip":
      return {
        game: "flip",
        outcomes: verifyFlip(seeds, params.coins ?? 1),
      };
    case "diamonds":
      return { game: "diamonds", gems: verifyDiamonds(seeds) };
    case "hilo":
      return {
        game: "hilo",
        cards: verifyCards(seeds, params.cardCount ?? 52, true),
      };
    case "blackjack":
      return {
        game: "blackjack",
        cards: verifyCards(seeds, params.cardCount ?? 10, true),
      };
    case "dragon-tower": {
      const difficulty = (params.difficulty as DragonDifficulty) ?? "medium";
      return {
        game: "dragon-tower",
        levels: verifyDragonTower(seeds, difficulty),
      };
    }
    default:
      return null;
  }
}
