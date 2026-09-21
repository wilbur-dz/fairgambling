import type {
  DragonDifficulty,
  PlinkoRisk,
  StakeGameId,
  WheelRisk,
} from "./constants";

export type SeedInputs = {
  clientSeed: string;
  serverSeed: string;
  nonce: number;
};

export type GameParams = {
  mineCount?: number;
  gridSize?: number;
  rows?: number;
  risk?: PlinkoRisk | WheelRisk | string;
  segments?: number;
  coins?: number;
  difficulty?: DragonDifficulty | string;
  cardCount?: number;
};

export type DiceResult = { game: "dice"; roll: number };
export type LimboResult = { game: "limbo"; multiplier: number };
export type CrashResult = { game: "crash"; crashPoint: number };
export type RouletteResult = { game: "roulette"; pocket: number };
export type WheelResult = {
  game: "wheel";
  index: number;
  multiplier: number;
};
export type PlinkoResult = {
  game: "plinko";
  path: ("left" | "right")[];
  bucket: number;
  multiplier: number;
};
export type MinesResult = { game: "mines"; mines: number[]; gridSize: number };
export type KenoResult = { game: "keno"; drawn: number[] };
export type FlipResult = { game: "flip"; outcomes: ("heads" | "tails")[] };
export type DiamondsResult = { game: "diamonds"; gems: string[] };
export type CardsResult = {
  game: "hilo" | "blackjack";
  cards: string[];
};
export type DragonResult = {
  game: "dragon-tower";
  levels: {
    level: number;
    eggPositions: number[];
    safePositions: number[];
  }[];
};

export type VerifyResult =
  | DiceResult
  | LimboResult
  | CrashResult
  | RouletteResult
  | WheelResult
  | PlinkoResult
  | MinesResult
  | KenoResult
  | FlipResult
  | DiamondsResult
  | CardsResult
  | DragonResult;

export type AnalyzerParams = {
  nonceStart: number;
  nonceEnd: number;
  bettingSize: number;
  bankroll: number;
  condition?: "over" | "under";
  target?: number;
  targetMultiplier?: number;
};

export type AnalyzerSummary = {
  game: StakeGameId | string;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  roi: number;
  pnl: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  startingBankroll: number;
  endingBankroll: number;
  overCount?: number;
  underCount?: number;
};
