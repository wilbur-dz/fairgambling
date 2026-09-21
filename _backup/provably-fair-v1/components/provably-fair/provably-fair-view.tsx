"use client";

import { useState } from "react";
import { AnalyzerPanel } from "@/components/provably-fair/analyzer-panel";
import { VerifierPanel } from "@/components/provably-fair/verifier-panel";
import { Tabs } from "@/components/ui/tabs";

const TABS = [
  { id: "verifier", label: "Verifier" },
  { id: "analyzer", label: "Analyzer" },
] as const;

const NAV_TABS_SIZE = { paddingY: 9, fontSize: 14 } as const;

/** Provably Fair — Stake originals verifier + seed analyzer (client-side). */
export function ProvablyFairView() {
  const [tab, setTab] = useState<"verifier" | "analyzer">("verifier");

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center sm:justify-start">
          <Tabs
            theme="auto"
            tabs={[...TABS]}
            activeId={tab}
            onChange={(id) => setTab(id as "verifier" | "analyzer")}
            size="md"
            sizeConfig={NAV_TABS_SIZE}
            liquid={false}
          />
        </div>
        {tab === "verifier" ? <VerifierPanel /> : <AnalyzerPanel />}
      </div>
    </main>
  );
}
