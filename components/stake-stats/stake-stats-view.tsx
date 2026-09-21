"use client";

import { useState } from "react";
import { AnalyzerPanel } from "@/components/stake-stats/analyzer-panel";
import { PnlPanel } from "@/components/stake-stats/pnl-panel";
import { Tabs } from "@/components/ui/tabs";

const TABS = [
  { id: "analyzer", label: "Bet Analyzer" },
  { id: "pnl", label: "P&L Calculator" },
] as const;

const NAV_TABS_SIZE = { paddingY: 9, fontSize: 14 } as const;

/**
 * Port of reference Stake Stats page — main interactive content only.
 * All processing is client-side (JSON archives / deposit·withdrawal CSVs).
 */
export function StakeStatsView() {
  const [tab, setTab] = useState<"analyzer" | "pnl">("analyzer");

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center sm:justify-start">
          <Tabs
            theme="auto"
            tabs={[...TABS]}
            activeId={tab}
            onChange={(id) => setTab(id as "analyzer" | "pnl")}
            size="md"
            sizeConfig={NAV_TABS_SIZE}
            liquid={false}
          />
        </div>
        {tab === "analyzer" ? <AnalyzerPanel /> : <PnlPanel />}
      </div>
    </main>
  );
}
