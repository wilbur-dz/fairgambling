export type NormalizedBet = {
  id: string;
  amount: number;
  payout: number;
  gameName: string;
  currency: string;
  createdAt: number;
  iid?: string;
  serverSeedHash?: string;
  serverSeedId?: string;
  multiplier: number;
  betType?: string;
};

export type GameStat = {
  game: string;
  bets: number;
  wins: number;
  losses: number;
  totalWager: number;
  totalPayout: number;
  pnl: number;
  roi: number;
  winRate: number;
  avgBet: number;
  biggestWin: number;
  biggestLoss: number;
  volatility: number;
  sumNet?: number;
  sumNetSq?: number;
};

export type CurrencyStat = {
  currency: string;
  totalWager: number;
  totalPayout: number;
  pnl: number;
  bets: number;
};

export type TimeBucket = {
  date?: string;
  timestamp?: string;
  pnl: number;
  wager: number;
  payout: number;
  bets: number;
  label?: string;
};

export type SeedPair = {
  serverSeedHash: string;
  serverSeedId?: string;
  bets: number;
  start: string;
  end: string;
  game: string;
};

export type TopMultiplier = {
  game: string;
  multiplier: number;
  stake: number;
  payout: number;
  betId?: string;
};

export type BonusSlot = {
  game: string;
  bets: number;
  bonuses: number;
};

export type BetDistribution = {
  game: string;
  percentage: number;
  bets: number;
  color: string;
};

export type AnalyzerStats = {
  totalWager: number;
  totalPayout: number;
  pnl: number;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  avgBetSize: number;
  medianStake: number;
  maxDrawdown: number;
  biggestWin: number;
  biggestWinGame: string;
  biggestWinBetId: string;
  biggestLoss: number;
  biggestLossGame: string;
  biggestLossBetId: string;
  gamesPlayed: number;
  gameStats: GameStat[];
  seedPairs: SeedPair[];
  topMultipliers: TopMultiplier[];
  bonusStats: {
    totalSlotBets: number;
    totalBonuses: number;
    hasEnoughData: boolean;
    slots: BonusSlot[];
  };
  currencyStats: CurrencyStat[];
  dailyPnL: TimeBucket[];
  hourlyPnL: TimeBucket[];
  minutePnL: TimeBucket[];
  betDistribution: BetDistribution[];
  dateRange: { start: string; end: string };
  lastUpdated: string;
  totalFilesProcessed: number;
};

export type CsvTx = {
  date: number;
  amount: number;
  currency: string;
};

export type PnlAsset = {
  currency: string;
  depositCoin: number;
  withdrawalCoin: number;
  depositUsd: number;
  withdrawalUsd: number;
  netUsd: number;
};

export type PnlResult = {
  depositedUsd: number;
  withdrawnUsd: number;
  netUsd: number;
  netPct: number;
  txCount: number;
  hasDeposits: boolean;
  hasWithdrawals: boolean;
  assets: PnlAsset[];
  currencies: string[];
  timeline: Array<Record<string, number | string>>;
  dateRange: { start: string; end: string };
};

export const CHART_COLORS = [
  "#4F2DEC",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
  "#F97316",
];
