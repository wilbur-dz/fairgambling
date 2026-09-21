import {
  calculateBlackjackScore,
  isNaturalBlackjack,
  isSoftHand,
} from "@/lib/blackjack/score";
import {
  classifyHand,
  dealerKey,
  DEALER_BUST_PCT,
  explainAction,
  getBestAction,
  standWinPct,
} from "@/lib/blackjack/strategy";
import {
  ACTION_LABELS,
  DEFAULT_RULES,
  type Action,
  type Card,
  type GameAction,
  type GameState,
  type HandOutcome,
  type PlayerHand,
  type Rank,
  type Rules,
  type Suit,
} from "@/lib/blackjack/types";

const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const SUITS: Suit[] = ["spades", "heart", "diamond", "club"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of RANKS) deck.push({ suit, value });
  }
  return deck;
}

export function createShoe(decks: number): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < decks; i++) shoe.push(...buildDeck());
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

function draw(shoe: Card[], n: number) {
  return { cards: shoe.slice(0, n), remainingShoe: shoe.slice(n) };
}

function canSplitPair(hand: PlayerHand): boolean {
  if (hand.cards.length !== 2) return false;
  const a = hand.cards[0].value.toUpperCase();
  const b = hand.cards[1].value.toUpperCase();
  const norm = (v: string) => (["K", "Q", "J"].includes(v) ? "10" : v);
  return norm(a) === norm(b);
}

export function getAvailableActions(
  hand: PlayerHand,
  _rules: Rules,
  canAct: boolean,
  handCount: number,
): Set<Action> {
  const set = new Set<Action>(["H", "S"]);
  if (canAct && hand.cards.length === 2) {
    set.add("D");
    if (canSplitPair(hand) && handCount < 4) set.add("P");
  }
  return set;
}

function settleOne(hand: PlayerHand, dealer: Card[]): HandOutcome {
  if (hand.outcome === "surrender") return "surrender";
  const p = calculateBlackjackScore(hand.cards);
  const d = calculateBlackjackScore(dealer);
  const pBj = isNaturalBlackjack(hand.cards) && !hand.isSplit;
  const dBj = isNaturalBlackjack(dealer);
  if (p > 21) return "bust";
  if (pBj && dBj) return "push";
  if (pBj) return "blackjack";
  if (dBj) return "lose";
  if (d > 21 || p > d) return "win";
  if (p < d) return "lose";
  return "push";
}

function advanceHand(state: GameState): GameState {
  const next = state.activeHandIndex + 1;
  if (
    next < state.playerHands.length &&
    !state.playerHands[next].isComplete
  ) {
    return {
      ...state,
      activeHandIndex: next,
      lastFeedback: null,
      phase: "player-action",
    };
  }
  const allDone = state.playerHands.every(
    (h) =>
      calculateBlackjackScore(h.cards) > 21 || h.outcome === "surrender",
  );
  if (allDone) {
    return {
      ...state,
      phase: "round-over",
      dealerHoleRevealed: true,
      roundOutcomes: state.playerHands.map((h) =>
        h.outcome === "surrender" ? "surrender" : "bust",
      ),
    };
  }
  return { ...state, phase: "dealer-play" };
}

function isSoft(cards: Card[]): boolean {
  return isSoftHand(cards);
}

export function createInitialState(rules: Rules = DEFAULT_RULES): GameState {
  return {
    phase: "idle",
    shoe: createShoe(rules.decks),
    dealerCards: [],
    dealerHoleRevealed: false,
    playerHands: [],
    activeHandIndex: 0,
    lastFeedback: null,
    streak: 0,
    bestStreak: 0,
    sessionCorrect: 0,
    sessionTotal: 0,
    rules,
    roundOutcomes: [],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "DEAL_NEW_HAND": {
      const totalCards = 52 * state.rules.decks;
      let next = state;
      if (state.shoe.length < 0.25 * totalCards) {
        next = { ...state, shoe: createShoe(state.rules.decks) };
      }
      const playerDraw = draw(next.shoe, 2);
      const dealerDraw = draw(playerDraw.remainingShoe, 2);
      const dealt: GameState = {
        ...next,
        shoe: dealerDraw.remainingShoe,
        dealerCards: dealerDraw.cards,
        dealerHoleRevealed: false,
        playerHands: [
          {
            cards: playerDraw.cards,
            bet: 1,
            isDoubled: false,
            isSplit: false,
            isComplete: false,
          },
        ],
        activeHandIndex: 0,
        lastFeedback: null,
        phase: "player-action",
        roundOutcomes: [],
      };
      if (isNaturalBlackjack(playerDraw.cards)) {
        return {
          ...dealt,
          playerHands: [{ ...dealt.playerHands[0], isComplete: true }],
          phase: "dealer-play",
        };
      }
      return dealt;
    }

    case "PLAYER_ACTION": {
      if (state.phase !== "player-action") return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (!hand || hand.isComplete) return state;
      const act = action.action;
      const canAct = hand.cards.length === 2 && !hand.isSplit;
      if (
        !getAvailableActions(
          hand,
          state.rules,
          canAct,
          state.playerHands.length,
        ).has(act)
      ) {
        return state;
      }

      const correct = getBestAction(
        hand.cards,
        state.dealerCards[0],
        state.rules,
        canAct,
      );
      const classified = classifyHand(hand.cards);
      const up = dealerKey(state.dealerCards[0]);
      const isCorrect = act === correct;
      const feedback = {
        correct: isCorrect,
        playerAction: act,
        correctAction: correct,
        message: isCorrect
          ? `Correct! ${ACTION_LABELS[correct]} is the right play with ${classified.label}.`
          : `Incorrect. With ${classified.label} vs dealer ${up === "A" ? "Ace" : up}, the correct play is ${ACTION_LABELS[correct]}.`,
        explanation: explainAction(
          correct,
          hand.cards,
          state.dealerCards[0],
          state.rules,
        ),
        handType: classified.type,
        playerLabel: classified.label,
        dealerUpcardLabel: up === "A" ? "Ace" : up,
        dealerBustPct: DEALER_BUST_PCT[up][0],
        playerWinPct: standWinPct(
          calculateBlackjackScore(hand.cards),
          up,
        ),
        playerScore: calculateBlackjackScore(hand.cards),
      };
      const streak = isCorrect ? state.streak + 1 : 0;
      let next: GameState = {
        ...state,
        lastFeedback: feedback,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        sessionCorrect: state.sessionCorrect + (isCorrect ? 1 : 0),
        sessionTotal: state.sessionTotal + 1,
      };

      switch (act) {
        case "H": {
          const { cards, remainingShoe } = draw(next.shoe, 1);
          const newCards = [...hand.cards, cards[0]];
          const score = calculateBlackjackScore(newCards);
          const bust = score > 21;
          const twentyOne = score === 21;
          const hands = [...next.playerHands];
          hands[state.activeHandIndex] = {
            ...hand,
            cards: newCards,
            isComplete: bust || twentyOne,
            outcome: bust ? "bust" : undefined,
          };
          next = { ...next, shoe: remainingShoe, playerHands: hands };
          return bust || twentyOne ? advanceHand(next) : next;
        }
        case "S": {
          const hands = [...next.playerHands];
          hands[state.activeHandIndex] = { ...hand, isComplete: true };
          return advanceHand({ ...next, playerHands: hands });
        }
        case "D": {
          const { cards, remainingShoe } = draw(next.shoe, 1);
          const newCards = [...hand.cards, cards[0]];
          const score = calculateBlackjackScore(newCards);
          const hands = [...next.playerHands];
          hands[state.activeHandIndex] = {
            ...hand,
            cards: newCards,
            isDoubled: true,
            isComplete: true,
            outcome: score > 21 ? "bust" : undefined,
          };
          return advanceHand({
            ...next,
            shoe: remainingShoe,
            playerHands: hands,
          });
        }
        case "P": {
          const left = hand.cards[0];
          const right = hand.cards[1];
          const first = draw(next.shoe, 1);
          const second = draw(first.remainingShoe, 1);
          const h1: PlayerHand = {
            cards: [left, first.cards[0]],
            bet: 1,
            isDoubled: false,
            isSplit: true,
            isComplete: false,
          };
          const h2: PlayerHand = {
            cards: [right, second.cards[0]],
            bet: 1,
            isDoubled: false,
            isSplit: true,
            isComplete: false,
          };
          if (left.value.toUpperCase() === "A") {
            h1.isComplete = true;
            h2.isComplete = true;
          }
          const hands = [...next.playerHands];
          hands[state.activeHandIndex] = h1;
          hands.splice(state.activeHandIndex + 1, 0, h2);
          next = { ...next, shoe: second.remainingShoe, playerHands: hands };
          return h1.isComplete
            ? advanceHand(next)
            : { ...next, phase: "player-action" };
        }
        case "R": {
          const hands = [...next.playerHands];
          hands[state.activeHandIndex] = {
            ...hand,
            isComplete: true,
            outcome: "surrender",
          };
          return advanceHand({ ...next, playerHands: hands });
        }
        default:
          return next;
      }
    }

    case "REVEAL_DEALER_HOLE":
      return { ...state, dealerHoleRevealed: true };

    case "DEALER_DRAW": {
      if (state.shoe.length === 0)
        return { ...state, phase: "round-over" };
      const { cards, remainingShoe } = draw(state.shoe, 1);
      return {
        ...state,
        dealerCards: [...state.dealerCards, cards[0]],
        shoe: remainingShoe,
      };
    }

    case "SETTLE_HAND": {
      const outcomes = state.playerHands.map((h) =>
        settleOne(h, state.dealerCards),
      );
      return {
        ...state,
        playerHands: state.playerHands.map((h, i) => ({
          ...h,
          outcome: outcomes[i],
        })),
        roundOutcomes: outcomes,
        phase: "round-over",
      };
    }

    case "UPDATE_RULES": {
      const rules = { ...state.rules, ...action.rules };
      const reshoe =
        action.rules.decks !== undefined &&
        action.rules.decks !== state.rules.decks;
      return {
        ...state,
        rules,
        shoe: reshoe ? createShoe(rules.decks) : state.shoe,
        phase: "idle",
        dealerCards: [],
        playerHands: [],
        lastFeedback: null,
        roundOutcomes: [],
      };
    }

    case "RESET_GAME":
      return createInitialState(state.rules);

    default:
      return state;
  }
}

/** Dealer should hit? 0 = hit, 1 = stand */
export function dealerShouldStand(cards: Card[], rules: Rules): boolean {
  const score = calculateBlackjackScore(cards);
  if (score < 17) return false;
  if (score > 17) return true;
  if (rules.dealerHitsS17 && isSoft(cards)) return false;
  return true;
}
