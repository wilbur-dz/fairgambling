"use client";

import { useState } from "react";
import { AnalyzerPanel } from "@/components/provably-fair/analyzer-panel";
import { CasinoGamePickers } from "@/components/provably-fair/casino-game-pickers";
import { VerifierPanel } from "@/components/provably-fair/verifier-panel";
import { Tabs } from "@/components/ui/tabs";
import type { StakeGameId } from "@/lib/provably-fair/constants";

const TABS = [
  { id: "verifier", label: "Provably Fair Verifier" },
  { id: "analyzer", label: "Seed Analyzer" },
] as const;

const NAV_TABS_SIZE = { paddingY: 9, fontSize: 14 } as const;

/**
 * Provably Fair — layout matches mock/9:
 * top row = tabs + casino/game pickers; card = seeds | result.
 */
export function ProvablyFairView() {
  const [tab, setTab] = useState<"verifier" | "analyzer">("verifier");
  const [game, setGame] = useState<StakeGameId>("dice");

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <Tabs
            theme="auto"
            tabs={[...TABS]}
            activeId={tab}
            onChange={(id) => setTab(id as "verifier" | "analyzer")}
            size="md"
            sizeConfig={NAV_TABS_SIZE}
            liquid={false}
            className="w-full shrink-0 self-stretch sm:w-auto sm:self-start"
          />
          <CasinoGamePickers
            game={game}
            onGameChange={setGame}
            mode={tab}
            compact
          />
        </div>
        {tab === "verifier" ? (
          <VerifierPanel game={game} />
        ) : (
          <AnalyzerPanel game={game} />
        )}
      </div>
    </main>
  );
}
