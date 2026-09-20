"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { SparklineTrend } from "@/components/ui/sparkline-trend";
import { Tabs } from "@/components/ui/tabs";
import { casinoDisplayName } from "@/lib/casinos/logos";
import type { HomeAnalytics } from "@/lib/home/data";

type AnalyticsTab = "biggest" | "trending" | "newcomers";

const TABS: Array<{ id: AnalyticsTab; label: string }> = [
  { id: "biggest", label: "Biggest" },
  { id: "trending", label: "Trending" },
  { id: "newcomers", label: "Newcomers" },
];

function formatDepositVolume(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(0)}`;
}

function tabHint(tab: AnalyticsTab): string {
  if (tab === "biggest") return "Top casinos by 30d volume";
  if (tab === "trending") return "Highest month-over-month growth";
  return "Launched in the last 18 months";
}

/** `u` — Biggest / Trending / Newcomers from home-bundle analytics. */
export function HomeAnalyticsCard({ data }: { data: HomeAnalytics | null }) {
  const [tab, setTab] = useState<AnalyticsTab>("biggest");
  const rows = (data ? data[tab] : []).slice(0, 5);

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="w-full"
      contentClassName="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/analytics"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img
            src="/icons/fairgambling-text.svg"
            alt="FairGambling"
            className="h-[18px] w-auto opacity-90 dark:hidden"
          />
          <img
            src="/icons/fairgambling-text-dark.svg"
            alt=""
            className="hidden h-[18px] w-auto opacity-90 dark:block"
          />
          <span className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            Analytics
          </span>
        </Link>
        <Tabs
          size="sm"
          theme="auto"
          fill
          className="w-[261px]"
          sizeConfig={{ paddingY: 6, fontSize: 13 }}
          tabs={TABS}
          activeId={tab}
          onChange={(id) => setTab(id as AnalyticsTab)}
        />
      </div>

      <div className="flex flex-col">
        {rows.map((row) => {
          const up = row.depositVolumeChange >= 0;
          return (
            <Link
              key={row.casinoId}
              href="/analytics"
              className="flex items-center gap-1.5 border-b border-[#2a274e]/[0.08] py-3 transition-colors last:border-0 hover:bg-[#2a274e]/[0.02] min-[425px]:gap-2.5 sm:gap-3 dark:border-white/[0.06] dark:hover:bg-white/[0.02]"
            >
              <span className="w-4 shrink-0 text-[13px] font-semibold text-[#2a274e]/40 dark:text-white/40">
                {row.rank}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2 min-[425px]:gap-2.5">
                <AnalyticsCasinoIcon
                  casinoName={row.casinoName}
                  logoUrl={row.logoUrl}
                  size={28}
                  theme="auto"
                />
                <span className="min-w-0 truncate text-sm font-semibold text-[#2a274e] dark:text-white">
                  {casinoDisplayName(row.casinoName)}
                </span>
              </span>
              <span className="w-[68px] shrink-0 text-right text-sm font-semibold tabular-nums text-[#2a274e] min-[425px]:w-[76px] sm:w-24 dark:text-white">
                {formatDepositVolume(row.depositVolume)}
              </span>
              <span
                className={`flex w-[46px] shrink-0 items-center justify-end gap-0.5 text-[11px] font-semibold tabular-nums min-[425px]:w-[52px] sm:w-[72px] sm:gap-1 sm:text-[13px] ${
                  up
                    ? "text-[#1f9d57] dark:text-[#00ff86]"
                    : "text-[#FB3748]"
                }`}
              >
                <span className="text-[8px] leading-none sm:text-[10px]">
                  {up ? "▲" : "▼"}
                </span>
                {Math.abs(row.depositVolumeChange).toFixed(1)}%
              </span>
              <span className="block w-[60px] shrink-0 min-[425px]:w-[72px] sm:w-[84px]">
                <SparklineTrend
                  trend={up ? "up" : "down"}
                  width={84}
                  height={36}
                  responsive
                />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="flex items-center gap-1.5 text-[12px] text-[#2a274e]/40 dark:text-white/40">
          <Info size={13} />
          {tabHint(tab)}
        </span>
        <Link
          href="/analytics"
          className="text-[13px] font-medium text-[#2a274e]/80 underline-offset-4 transition-colors hover:text-[#2a274e] hover:underline dark:text-white/80 dark:hover:text-white"
        >
          View all ({data?.totalCasinos ?? 0}) →
        </Link>
      </div>
    </Card>
  );
}
