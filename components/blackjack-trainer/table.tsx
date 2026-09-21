"use client";

import type { ReactNode } from "react";
import {
  calculateBlackjackScore,
  isNaturalBlackjack,
} from "@/lib/blackjack/score";
import {
  ACTION_LABELS,
  type Action,
  type Card,
  type Feedback,
  type HandOutcome,
  type PlayerHand,
} from "@/lib/blackjack/types";
import {
  CardBack,
  PlayingCard,
} from "@/components/blackjack-trainer/playing-card";

function ScorePill({
  children,
  danger,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
        danger
          ? "bg-red-500/10 text-red-500"
          : "bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.7)] dark:bg-white/5 dark:text-white/70"
      }`}
    >
      {children}
    </span>
  );
}

export function DealerHand({
  cards,
  holeRevealed,
}: {
  cards: Card[];
  holeRevealed: boolean;
}) {
  if (cards.length === 0) return null;
  const up = calculateBlackjackScore([cards[0]]);
  const total = calculateBlackjackScore(cards);

  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-[rgba(42,39,78,0.45)] dark:text-[#8B8B9E]">
        Dealer
      </span>
      <div className="flex origin-top scale-[0.75] sm:scale-100">
        {cards.map((card, i) => (
          <div
            key={`dealer-${i}`}
            className="animate-deal-card"
            style={{ marginLeft: i === 0 ? 0 : -20 }}
          >
            {i === 1 && !holeRevealed ? (
              <CardBack />
            ) : (
              <PlayingCard suit={card.suit} value={card.value} />
            )}
          </div>
        ))}
      </div>
      <ScorePill danger={holeRevealed && total > 21}>
        {holeRevealed ? total : `${up} + ?`}
      </ScorePill>
    </div>
  );
}

export function PlayerHands({
  hands,
  activeIndex,
  showOutcomes,
}: {
  hands: PlayerHand[];
  activeIndex: number;
  showOutcomes: boolean;
}) {
  if (hands.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wider text-[rgba(42,39,78,0.45)] dark:text-[#8B8B9E]">
        {hands.length > 1 ? `Your Hands (${hands.length})` : "Your Hand"}
      </span>
      <div
        className={`flex flex-wrap justify-center ${hands.length > 1 ? "gap-6" : ""}`}
      >
        {hands.map((hand, hi) => {
          const score = calculateBlackjackScore(hand.cards);
          const active = hi === activeIndex && !hand.isComplete;
          const bj = isNaturalBlackjack(hand.cards) && !hand.isSplit;
          return (
            <div
              key={hi}
              className={`flex flex-col items-center gap-2 rounded-xl p-2 ${
                active
                  ? "ring-2 ring-[#4F2DEC] ring-offset-2 ring-offset-[#f4f4f4] dark:ring-[#6969FF] dark:ring-offset-[#111525]"
                  : ""
              }`}
            >
              {hands.length > 1 ? (
                <span className="text-[10px] font-medium text-[rgba(42,39,78,0.4)] dark:text-white/40">
                  Hand {hi + 1}
                  {hand.isDoubled ? " (doubled)" : ""}
                </span>
              ) : null}
              <div className="flex origin-top scale-[0.75] sm:scale-100">
                {hand.cards.map((card, ci) => (
                  <div
                    key={`${hi}-${ci}`}
                    className="animate-deal-card"
                    style={{ marginLeft: ci === 0 ? 0 : -20 }}
                  >
                    <PlayingCard suit={card.suit} value={card.value} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <ScorePill danger={score > 21}>
                  {bj ? "BJ" : score}
                </ScorePill>
                {showOutcomes && hand.outcome ? (
                  <OutcomeBadge outcome={hand.outcome} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: HandOutcome }) {
  const map: Record<HandOutcome, { label: string; className: string }> = {
    blackjack: { label: "Blackjack!", className: "text-yellow-400" },
    win: { label: "Win", className: "text-green-500" },
    push: { label: "Push", className: "text-zinc-400" },
    lose: { label: "Lose", className: "text-red-500" },
    bust: { label: "Bust", className: "text-red-500" },
    surrender: { label: "Surrender", className: "text-zinc-400" },
  };
  const m = map[outcome];
  return (
    <span className={`text-xs font-semibold ${m.className}`}>{m.label}</span>
  );
}

export function FeedbackPanel({
  feedback,
  idleLabel,
}: {
  feedback: Feedback | null;
  idleLabel: string;
}) {
  if (!feedback) {
    return (
      <div className="flex min-h-[80px] w-full items-center justify-center rounded-2xl border border-dashed border-[rgba(42,39,78,0.12)] bg-white dark:border-white/[0.06] dark:bg-[#161C32]/50 sm:min-h-[120px]">
        <span className="px-4 text-center text-xs uppercase tracking-wider text-[rgba(42,39,78,0.35)] dark:text-white/15">
          {idleLabel}
        </span>
      </div>
    );
  }

  const { correct, playerAction, correctAction, explanation, playerLabel, dealerUpcardLabel } =
    feedback;

  return (
    <div className="w-full animate-[fadeSlideIn_0.25s_ease-out_both] overflow-hidden rounded-2xl bg-[#f8f8fa] dark:bg-[#161C32]">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-3.5 ${
          correct ? "bg-green-500/[0.07]" : "bg-red-500/[0.07]"
        }`}
      >
        <span
          className={`text-[13px] font-extrabold tracking-wide uppercase sm:text-[15px] ${
            correct ? "text-green-400" : "text-red-400"
          }`}
        >
          {correct ? "✓ CORRECT" : "✗ INCORRECT"}
        </span>
        <div className="flex items-center gap-2">
          <ActionChip
            label={ACTION_LABELS[playerAction as Action]}
            tone={correct ? "good" : "bad"}
          />
          <span className="text-[12px] text-[rgba(42,39,78,0.25)] sm:text-[13px] dark:text-white/25">
            →
          </span>
          <ActionChip label={ACTION_LABELS[correctAction as Action]} tone="neutral" />
        </div>
      </div>
      <div className="space-y-2 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-x-1.5 overflow-x-auto whitespace-nowrap text-[11px] sm:gap-x-2 sm:text-[14px]">
          <span className="font-semibold text-[rgba(42,39,78,0.8)] dark:text-white/80">
            {playerLabel}
          </span>
          <span className="text-[rgba(42,39,78,0.25)] dark:text-white/20">vs</span>
          <span className="font-semibold text-[rgba(42,39,78,0.8)] dark:text-white/80">
            Dealer {dealerUpcardLabel}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.55)] sm:text-[14px] dark:text-white/55">
          {explanation}
        </p>
      </div>
    </div>
  );
}

function ActionChip({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "bad" | "neutral";
}) {
  const cls =
    tone === "good"
      ? "bg-green-500/15 text-green-400"
      : tone === "bad"
        ? "bg-red-500/15 text-red-400"
        : "bg-[rgba(42,39,78,0.08)] text-[rgba(42,39,78,0.8)] dark:bg-white/[0.07] dark:text-white/80";
  return (
    <span
      className={`rounded-lg px-2 py-1 text-[12px] font-semibold sm:px-3 sm:text-[13px] ${cls}`}
    >
      {label}
    </span>
  );
}

export function IdlePlaceholders() {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[rgba(42,39,78,0.35)] dark:text-white/20">
          Dealer
        </span>
        <div className="flex h-[120px] w-[86px] origin-top scale-[0.75] items-center justify-center rounded-lg border border-dashed border-[rgba(42,39,78,0.15)] bg-white dark:border-white/10 dark:bg-white/[0.03] sm:scale-100">
          <span className="text-2xl text-[rgba(42,39,78,0.25)] dark:text-white/15">
            ?
          </span>
        </div>
        <ScorePill>?</ScorePill>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[rgba(42,39,78,0.35)] dark:text-white/20">
          Your Hand
        </span>
        <div className="rounded-xl p-2">
          <div className="flex h-[120px] w-[86px] origin-top scale-[0.75] items-center justify-center rounded-lg border border-dashed border-[rgba(42,39,78,0.15)] bg-white dark:border-white/10 dark:bg-white/[0.03] sm:scale-100">
            <span className="text-2xl text-[rgba(42,39,78,0.25)] dark:text-white/15">
              ?
            </span>
          </div>
          <div className="mt-2 flex items-center justify-center">
            <ScorePill>?</ScorePill>
          </div>
        </div>
      </div>
    </>
  );
}
