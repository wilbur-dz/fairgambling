"use client";

import { useState } from "react";
import { BonusCalculatorPanel } from "@/components/bonus-calculator/bonus-panel";
import { LevelUpCalculatorPanel } from "@/components/bonus-calculator/level-up-panel";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import type { CodeCasino } from "@/lib/livecodes/data";

const MAIN_TABS = [
  { id: "bonus", label: "Bonus Calculator" },
  { id: "level-up", label: "Level Up Calculator" },
] as const;

const NAV_TABS_SIZE = { paddingY: 9, fontSize: 14 } as const;

/**
 * Port of reference `CalculatorsPageClient` — main content only.
 * Bonus Select Casino: `/api/casinos?limit=100`; rates static.
 * Level Up VIP: `/api/casinos/vip-levels` with static fallback.
 */
export function BonusCalculatorView({
  casinos,
  defaultTab = "bonus",
}: {
  casinos: CodeCasino[];
  defaultTab?: "bonus" | "level-up";
}) {
  const [tab, setTab] = useState<"bonus" | "level-up">(defaultTab);

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-col gap-4 md:gap-6">
        <Tabs
          theme="auto"
          tabs={[...MAIN_TABS]}
          activeId={tab}
          onChange={(id) => setTab(id as "bonus" | "level-up")}
          liquid={false}
          size="md"
          sizeConfig={NAV_TABS_SIZE}
          fill
          className="w-full self-stretch md:w-auto md:self-start"
        />
        {tab === "bonus" ? (
          <BonusCalculatorPanel casinos={casinos} />
        ) : (
          <LevelUpCalculatorPanel />
        )}
        <Card variant="glass">
          <p className="text-[14px] leading-relaxed text-[rgba(42,39,78,0.55)] dark:text-white/50">
            <span className="font-semibold">Disclaimer:</span> All data
            presented in these calculators is based on our testing and
            observations. This information should not be claimed as guaranteed
            or used as the sole basis for financial decisions. Always verify
            with official sources and gamble responsibly.
          </p>
        </Card>
      </div>
    </main>
  );
}
