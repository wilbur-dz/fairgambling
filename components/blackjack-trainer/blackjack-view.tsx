"use client";

import Image from "next/image";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ActionButtons } from "@/components/blackjack-trainer/action-buttons";
import {
  DealerHand,
  FeedbackPanel,
  IdlePlaceholders,
  PlayerHands,
} from "@/components/blackjack-trainer/table";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  createInitialState,
  dealerShouldStand,
  gameReducer,
  getAvailableActions,
} from "@/lib/blackjack/engine";
import type { Action } from "@/lib/blackjack/types";

const TABS = [
  { id: "trainer", label: "Trainer" },
  { id: "strategy", label: "Strategy Table" },
  { id: "calculator", label: "Live Advisor" },
];

/**
 * Port of reference `BlackjackTrainerView` — Trainer tab interactive.
 * Strategy Table / Live Advisor placeholders for now.
 */
export function BlackjackView() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(),
  );
  const [tab, setTab] = useState("trainer");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.phase !== "dealer-play") return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!state.dealerHoleRevealed) {
      timerRef.current = setTimeout(
        () => dispatch({ type: "REVEAL_DEALER_HOLE" }),
        400,
      );
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (dealerShouldStand(state.dealerCards, state.rules)) {
      timerRef.current = setTimeout(
        () => dispatch({ type: "SETTLE_HAND" }),
        300,
      );
    } else {
      timerRef.current = setTimeout(
        () => dispatch({ type: "DEALER_DRAW" }),
        500,
      );
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    state.phase,
    state.dealerHoleRevealed,
    state.dealerCards,
    state.rules,
  ]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (tab !== "trainer") return;

      if (state.phase === "player-action") {
        const map: Record<string, Action> = {
          h: "H",
          s: "S",
          d: "D",
          p: "P",
        };
        const action = map[e.key.toLowerCase()];
        if (action) {
          e.preventDefault();
          dispatch({ type: "PLAYER_ACTION", action });
        }
      }

      if (
        (state.phase === "round-over" || state.phase === "idle") &&
        (e.key === " " || e.key === "Enter")
      ) {
        e.preventDefault();
        dispatch({ type: "DEAL_NEW_HAND" });
      }
    },
    [tab, state.phase],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const active = state.playerHands[state.activeHandIndex];
  const canAct = !!active && active.cards.length === 2 && !active.isSplit;
  const available = active
    ? getAvailableActions(
        active,
        state.rules,
        canAct,
        state.playerHands.length,
      )
    : new Set<Action>();
  const playing =
    state.phase === "player-action" && active && !active.isComplete;
  const canDeal = state.phase === "idle" || state.phase === "round-over";
  const dealLabel = state.phase === "idle" ? "Deal Hand" : "Next Hand";

  return (
    <main className="flex flex-col gap-4 px-4 pb-6 pt-6 md:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#2a274e] dark:text-white">
            Blackjack Trainer
          </h1>
          <p className="mt-1 text-sm text-[rgba(42,39,78,0.5)] dark:text-white/50">
            Master perfect basic strategy with instant feedback on every
            decision
          </p>
        </div>
      </div>

      <Tabs
        theme="auto"
        tabs={TABS}
        activeId={tab}
        onChange={setTab}
        size="md"
        fill
      />

      {tab === "trainer" ? (
        <div className="light-element dark-element relative overflow-hidden rounded-[24px] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/icons/logo-dark.svg"
              alt="FairGambling"
              width={28}
              height={26}
            />
            <span className="text-base font-semibold tracking-wide text-[rgba(42,39,78,0.6)] dark:text-white/60">
              Blackjack
            </span>
            {state.sessionTotal > 0 ? (
              <span className="ml-auto text-xs text-[rgba(42,39,78,0.45)] dark:text-white/40">
                {state.sessionCorrect}/{state.sessionTotal} · streak{" "}
                {state.streak}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <div className="hidden w-[280px] shrink-0 flex-col gap-3 lg:flex">
              <ActionButtons
                availableActions={available}
                onAction={(action) =>
                  dispatch({ type: "PLAYER_ACTION", action })
                }
                disabled={!playing}
              />
              {canDeal ? (
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => dispatch({ type: "DEAL_NEW_HAND" })}
                >
                  {dealLabel}
                </Button>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-4 py-0 sm:gap-5 sm:py-4">
              {state.phase === "idle" ? (
                <IdlePlaceholders />
              ) : (
                <>
                  <DealerHand
                    cards={state.dealerCards}
                    holeRevealed={state.dealerHoleRevealed}
                  />
                  {state.phase === "dealer-play" ? (
                    <p className="animate-pulse text-xs text-[rgba(42,39,78,0.5)] dark:text-white/50">
                      Dealer playing...
                    </p>
                  ) : null}
                  <PlayerHands
                    hands={state.playerHands}
                    activeIndex={state.activeHandIndex}
                    showOutcomes={state.phase === "round-over"}
                  />
                </>
              )}

              <div className="mx-auto flex w-full max-w-lg flex-col gap-3 lg:hidden">
                <ActionButtons
                  availableActions={available}
                  onAction={(action) =>
                    dispatch({ type: "PLAYER_ACTION", action })
                  }
                  disabled={!playing}
                />
                {canDeal ? (
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => dispatch({ type: "DEAL_NEW_HAND" })}
                  >
                    {dealLabel}
                  </Button>
                ) : null}
              </div>

              <div className="flex w-full max-w-lg min-h-[100px] items-start justify-center sm:min-h-[140px]">
                <FeedbackPanel
                  feedback={state.lastFeedback}
                  idleLabel={
                    state.phase === "idle"
                      ? "Press Deal or Space to start"
                      : "Make a decision to see feedback"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "strategy" ? (
        <div className="light-element dark-element rounded-[24px] p-6 text-sm text-[rgba(42,39,78,0.6)] dark:text-white/60">
          Strategy table coming next — Trainer already uses full H17/S17
          basic-strategy charts under the hood.
        </div>
      ) : null}

      {tab === "calculator" ? (
        <div className="light-element dark-element rounded-[24px] p-6 text-sm text-[rgba(42,39,78,0.6)] dark:text-white/60">
          Live Advisor coming next — pick cards manually to look up the
          optimal play.
        </div>
      ) : null}
    </main>
  );
}
