import type { Card } from "@/lib/blackjack/types";

/** Soft-aware blackjack hand total. */
export function calculateBlackjackScore(cards: Card[]): number {
  if (!cards?.length) return 0;
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (!card?.value) continue;
    const v = card.value.toUpperCase();
    if (v === "A") {
      aces++;
      total += 11;
    } else if (v === "J" || v === "Q" || v === "K" || v === "10") {
      total += 10;
    } else {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n >= 2 && n <= 9) total += n;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function isSoftHand(cards: Card[]): boolean {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    const v = card.value.toUpperCase();
    if (v === "A") {
      aces++;
      total += 11;
    } else if (["K", "Q", "J", "10"].includes(v)) {
      total += 10;
    } else {
      total += parseInt(v, 10) || 0;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return aces > 0 && total <= 21;
}

export function isNaturalBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateBlackjackScore(cards) === 21;
}
