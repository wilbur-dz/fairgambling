export type Suit = "spades" | "heart" | "diamond" | "club";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = { suit: Suit; value: Rank };

export type Action = "H" | "S" | "D" | "P" | "R";

export type HandType = "hard" | "soft" | "pair";

export type GamePhase =
  | "idle"
  | "player-action"
  | "dealer-play"
  | "round-over";

export type HandOutcome =
  | "blackjack"
  | "win"
  | "push"
  | "lose"
  | "bust"
  | "surrender";

export type PlayerHand = {
  cards: Card[];
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isComplete: boolean;
  outcome?: HandOutcome;
};

export type Rules = {
  dealerHitsS17: boolean;
  das: boolean;
  surrender: "none" | "late";
  decks: number;
};

export type Feedback = {
  correct: boolean;
  playerAction: Action;
  correctAction: Action;
  message: string;
  explanation: string;
  handType: HandType;
  playerLabel: string;
  dealerUpcardLabel: string;
  dealerBustPct: number;
  playerWinPct: number;
  playerScore: number;
};

export type GameState = {
  phase: GamePhase;
  shoe: Card[];
  dealerCards: Card[];
  dealerHoleRevealed: boolean;
  playerHands: PlayerHand[];
  activeHandIndex: number;
  lastFeedback: Feedback | null;
  streak: number;
  bestStreak: number;
  sessionCorrect: number;
  sessionTotal: number;
  rules: Rules;
  roundOutcomes: HandOutcome[];
};

export type GameAction =
  | { type: "DEAL_NEW_HAND" }
  | { type: "PLAYER_ACTION"; action: Action }
  | { type: "REVEAL_DEALER_HOLE" }
  | { type: "DEALER_DRAW" }
  | { type: "SETTLE_HAND" }
  | { type: "UPDATE_RULES"; rules: Partial<Rules> }
  | { type: "RESET_GAME" };

export const DEFAULT_RULES: Rules = {
  dealerHitsS17: true,
  das: true,
  surrender: "none",
  decks: 8,
};

export const ACTION_LABELS: Record<Action, string> = {
  H: "Hit",
  S: "Stand",
  D: "Double",
  P: "Split",
  R: "Surrender",
};
