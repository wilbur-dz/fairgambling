import {
  ACTION_LABELS,
  type Action,
  type Card,
  type HandType,
  type Rules,
} from "@/lib/blackjack/types";
import { calculateBlackjackScore } from "@/lib/blackjack/score";

type DealerKey = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A";
type StratCode =
  | "H"
  | "S"
  | "D"
  | "Dh"
  | "Ds"
  | "P"
  | "Ph"
  | "R"
  | "Rh"
  | "Rs"
  | "Rp";

type StratRow = Record<DealerKey, StratCode>;

function row(
  d2: StratCode,
  d3: StratCode,
  d4: StratCode,
  d5: StratCode,
  d6: StratCode,
  d7: StratCode,
  d8: StratCode,
  d9: StratCode,
  d10: StratCode,
  dA: StratCode,
): StratRow {
  return {
    "2": d2,
    "3": d3,
    "4": d4,
    "5": d5,
    "6": d6,
    "7": d7,
    "8": d8,
    "9": d9,
    "10": d10,
    A: dA,
  };
}

/** Hard totals — H17 (dealer hits soft 17). */
const HARD_H17: Record<string, StratRow> = {
  "5": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "6": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "7": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "8": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "9": row("H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "10": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"),
  "11": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"),
  "12": row("H", "H", "S", "S", "S", "H", "H", "H", "H", "H"),
  "13": row("S", "S", "S", "S", "S", "H", "H", "H", "H", "H"),
  "14": row("S", "S", "S", "S", "S", "H", "H", "H", "H", "H"),
  "15": row("S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"),
  "16": row("S", "S", "S", "S", "S", "H", "H", "Rh", "Rh", "Rh"),
  "17": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "Rs"),
  "18": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "19": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "20": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "21": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
};

const SOFT_H17: Record<string, StratRow> = {
  "13": row("H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "14": row("H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "15": row("H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "16": row("H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "17": row("H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "18": row("Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"),
  "19": row("S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"),
  "20": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "21": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
};

const PAIR_H17: Record<string, StratRow> = {
  "2": row("Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"),
  "3": row("Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"),
  "4": row("H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"),
  "5": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"),
  "6": row("Ph", "P", "P", "P", "P", "H", "H", "H", "H", "H"),
  "7": row("P", "P", "P", "P", "P", "P", "H", "H", "H", "H"),
  "8": row("P", "P", "P", "P", "P", "P", "P", "P", "P", "Rp"),
  "9": row("P", "P", "P", "P", "P", "S", "P", "P", "S", "S"),
  "10": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  A: row("P", "P", "P", "P", "P", "P", "P", "P", "P", "P"),
};

/** Hard totals — S17. */
const HARD_S17: Record<string, StratRow> = {
  "5": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "6": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "7": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "8": row("H", "H", "H", "H", "H", "H", "H", "H", "H", "H"),
  "9": row("H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "10": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"),
  "11": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"),
  "12": row("H", "H", "S", "S", "S", "H", "H", "H", "H", "H"),
  "13": row("S", "S", "S", "S", "S", "H", "H", "H", "H", "H"),
  "14": row("S", "S", "S", "S", "S", "H", "H", "H", "H", "H"),
  "15": row("S", "S", "S", "S", "S", "H", "H", "H", "Rh", "H"),
  "16": row("S", "S", "S", "S", "S", "H", "H", "Rh", "Rh", "Rh"),
  "17": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "18": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "19": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "20": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "21": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
};

const SOFT_S17: Record<string, StratRow> = {
  "13": row("H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "14": row("H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "15": row("H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "16": row("H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "17": row("H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"),
  "18": row("S", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"),
  "19": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "20": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  "21": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
};

const PAIR_S17: Record<string, StratRow> = {
  "2": row("Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"),
  "3": row("Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"),
  "4": row("H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"),
  "5": row("Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"),
  "6": row("Ph", "P", "P", "P", "P", "H", "H", "H", "H", "H"),
  "7": row("P", "P", "P", "P", "P", "P", "H", "H", "H", "H"),
  "8": row("P", "P", "P", "P", "P", "P", "P", "P", "P", "P"),
  "9": row("P", "P", "P", "P", "P", "S", "P", "P", "S", "S"),
  "10": row("S", "S", "S", "S", "S", "S", "S", "S", "S", "S"),
  A: row("P", "P", "P", "P", "P", "P", "P", "P", "P", "P"),
};

export const DEALER_BUST_PCT: Record<DealerKey, number[]> = {
  "2": [35.3, 14, 13.1, 13, 12.1, 12.5],
  "3": [37.6, 13.1, 13.1, 12.3, 11.9, 12],
  "4": [40.3, 13.1, 11.6, 11.5, 11.7, 11.8],
  "5": [42.9, 11.9, 12.3, 11.7, 10.6, 10.6],
  "6": [42.1, 16.5, 10.6, 10.7, 10.1, 10],
  "7": [26.2, 36.9, 13.8, 7.8, 7.9, 7.4],
  "8": [24.4, 12.8, 35.9, 12.7, 6.8, 7.4],
  "9": [23.3, 12, 12, 35, 12.1, 5.6],
  "10": [23.4, 11.2, 11.3, 11.3, 33.7, 9.1],
  A: [11.7, 13.5, 13.5, 13.3, 13, 36],
};

export function cardValue(card: Card): number {
  const v = card.value.toUpperCase();
  if (v === "A") return 11;
  if (["K", "Q", "J", "10"].includes(v)) return 10;
  return parseInt(v, 10) || 0;
}

export function dealerKey(card: Card): DealerKey {
  const v = card.value.toUpperCase();
  if (v === "A") return "A";
  if (["K", "Q", "J", "10"].includes(v)) return "10";
  return v as DealerKey;
}

export function classifyHand(cards: Card[]): {
  type: HandType;
  key: string;
  label: string;
} {
  if (cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1])) {
    const t = cards[0].value.toUpperCase();
    const key = ["K", "Q", "J"].includes(t) ? "10" : t;
    return { type: "pair", key, label: `${key},${key}` };
  }
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const v = cardValue(c);
    if (v === 11) aces++;
    total += v;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  if (aces > 0 && total <= 21) {
    return { type: "soft", key: String(total), label: `Soft ${total}` };
  }
  return { type: "hard", key: String(total), label: `Hard ${total}` };
}

function resolveCode(
  code: StratCode,
  rules: Rules,
  canDouble: boolean,
  canSplit: boolean,
): Action {
  switch (code) {
    case "S":
      return "S";
    case "D":
    case "Dh":
      return canDouble ? "D" : "H";
    case "Ds":
      return canDouble ? "D" : "S";
    case "P":
      return canSplit ? "P" : "H";
    case "Ph":
      return rules.das && canSplit ? "P" : "H";
    case "R":
    case "Rh":
      return rules.surrender === "late" ? "R" : "H";
    case "Rs":
      return rules.surrender === "late" ? "R" : "S";
    case "Rp":
      if (rules.surrender === "late") return "R";
      return canSplit ? "P" : "H";
    case "H":
    default:
      return "H";
  }
}

/**
 * Best basic-strategy action for the current hand.
 * `canAct` = first two cards of a non-split hand (doubles/splits allowed).
 */
export function getBestAction(
  cards: Card[],
  dealerUp: Card,
  rules: Rules,
  canAct: boolean,
): Action {
  const up = dealerKey(dealerUp);
  const canDouble = canAct && cards.length === 2;
  const canSplit = canAct && cards.length === 2;
  const hard = rules.dealerHitsS17 ? HARD_H17 : HARD_S17;
  const soft = rules.dealerHitsS17 ? SOFT_H17 : SOFT_S17;
  const pairs = rules.dealerHitsS17 ? PAIR_H17 : PAIR_S17;
  const hand = classifyHand(cards);

  let code: StratCode | undefined;
  if (hand.type === "pair" && canSplit) {
    code = pairs[hand.key]?.[up];
  }
  if (!code || hand.type !== "pair") {
    if (hand.type === "pair") {
      code = pairs[hand.key]?.[up];
      if (code && resolveCode(code, rules, canDouble, canSplit) !== "P") {
        const total = calculateBlackjackScore(cards);
        const isSoftAce =
          cards.some((c) => c.value.toUpperCase() === "A") &&
          total <= 21 &&
          total >= 13;
        code = isSoftAce
          ? soft[String(total)]?.[up]
          : hard[String(total)]?.[up];
      }
    } else {
      code =
        hand.type === "soft"
          ? soft[hand.key]?.[up]
          : hard[hand.key]?.[up];
    }
  }

  if (!code) {
    return calculateBlackjackScore(cards) >= 17 ? "S" : "H";
  }

  const action = resolveCode(code, rules, canDouble, canSplit);
  if (action === "R" && !canAct) return "H";
  return action;
}

export function explainAction(
  action: Action,
  cards: Card[],
  dealerUp: Card,
  rules: Rules,
): string {
  const hand = classifyHand(cards);
  const up = dealerKey(dealerUp);
  const total = calculateBlackjackScore(cards);

  if (hand.type === "pair") {
    const key = hand.key;
    if (key === "A")
      return "Always split Aces. Two chances at 21 is much better than a hand totaling 12.";
    if (key === "10")
      return "Never split 10s. 20 is an excellent hand — don't break it up.";
    if (key === "8")
      return action === "R"
        ? "With H17, surrender 8s vs Ace. The dealer's advantage is overwhelming."
        : "Always split 8s. 16 is the worst hand, but two hands starting with 8 have much better expected value.";
    if (key === "9")
      return action === "S"
        ? "Don't split 9s vs 7. Your 18 beats the dealer's likely 17."
        : "Split 9s against most cards. Two 9s give you better chances than standing on 18.";
    if (key === "5")
      return "Never split 5s — treat them as a 10 and double. You're in great shape.";
    if (key === "7" || key === "6")
      return "Split 7s against weak-to-medium dealer cards. Two 7s are better than a 14.";
    if (key === "4")
      return "Don't split 4s (unless DAS vs 5-6). An 8 is a decent starting point.";
    if (key === "3" || key === "2")
      return "Split 3s against weak/medium cards with DAS. Each 3 can improve.";
  }

  if (hand.type === "soft") {
    if (total >= 19)
      return action === "D"
        ? "With S17, double soft 19 vs 6. The dealer's 6 is so weak that maximizing your bet is worth it."
        : "Always stand on soft 19 or higher. You already have an excellent hand.";
    if (total === 18) {
      if (action === "D")
        return "Double soft 18 against a weak dealer card. You have a strong hand and the dealer is vulnerable.";
      if (action === "H")
        return "Hit soft 18 vs a strong dealer card. 18 isn't strong enough to win often, and you can't bust since the Ace can become 1.";
      return "Stand on soft 18. It's already a strong hand, and the risk of worsening it isn't worth the potential gain.";
    }
    return action === "D"
      ? "Double your soft hand against the dealer's weak card. You have upside potential and can't bust."
      : "Hit your low soft hand. You can't bust, and hitting will improve your total.";
  }

  if (total >= 17)
    return action === "R"
      ? "With H17 rules, surrender hard 17 vs Ace. The dealer hitting soft 17 gives them too much of an advantage."
      : "Always stand on 17 or higher. The risk of busting is too great.";
  if ((total === 16 || total === 15) && action === "R")
    return "Surrender 16 against a strong card. This is the worst hand in blackjack — minimize your losses.";
  if (total === 11 || (total === 10 && action === "D"))
    return "Always double on 11. You have the best chance of hitting 21 or a strong total.";
  if (total === 9 && action === "D")
    return "Double on 9 vs a weak dealer card. You're likely to get a good total with one more card.";
  if (total === 12 && (up === "2" || up === "3"))
    return "12 vs 2 is a close call, but hitting is slightly better because the dealer's 2 isn't weak enough to justify standing on 12.";
  if (total <= 11)
    return "With a low total, you need to hit to improve your hand. There's no risk of busting.";
  if (action === "S" && cardValue(dealerUp) <= 6)
    return "Stand on your stiff hand because the dealer's low card makes them likely to bust.";
  if (action === "H" && cardValue(dealerUp) >= 7)
    return "Hit your stiff total. The dealer's strong upcard means they're unlikely to bust, so you need to improve.";

  return `With ${hand.label} vs dealer ${up === "A" ? "Ace" : up}, ${ACTION_LABELS[action].toLowerCase()} is the mathematically optimal play.`;
}

export function standWinPct(score: number, dealerUp: DealerKey): number {
  const a = DEALER_BUST_PCT[dealerUp];
  if (!a || score > 21) return 0;
  let s = a[0];
  if (score >= 18) s += a[1];
  if (score >= 19) s += a[2];
  if (score >= 20) s += a[3];
  if (score >= 21) s += a[4];
  return Math.round(s * 10) / 10;
}
