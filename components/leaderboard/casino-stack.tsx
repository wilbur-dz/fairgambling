"use client";

import { useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { casinoDisplayName } from "@/lib/casinos/logos";
import type { LeaderboardCasinoWager } from "@/lib/leaderboard/data";
import { formatLeaderboardWager } from "@/components/leaderboard/format";

type CasinoStackProps = {
  casinos: string[];
  casinoWagers?: LeaderboardCasinoWager[];
  size?: "sm" | "lg";
};

function CasinoIcon({ name, size }: { name: string; size: number }) {
  return (
    <AnalyticsCasinoIcon
      casinoName={name}
      label={casinoDisplayName(name)}
      size={size}
      theme="auto"
    />
  );
}

/** Casino icon cluster with optional hover wager breakdown. */
export function CasinoStack({
  casinos,
  casinoWagers,
  size = "lg",
}: CasinoStackProps) {
  const [open, setOpen] = useState(false);
  const iconSize = size === "sm" ? 26 : 28;
  const visible = size === "sm" ? 1 : 3;
  const hasBreakdown = Boolean(casinoWagers && casinoWagers.length > 0);

  return (
    <div
      className={`relative inline-flex items-center ${
        size === "sm" ? "gap-0.5" : "gap-2"
      }`}
    >
      <button
        type="button"
        className="relative inline-flex cursor-pointer items-center rounded-full bg-[rgba(42,39,78,0.07)] px-2 py-1 dark:bg-transparent dark:px-0 dark:py-0"
        style={{ gap: "inherit" }}
        onClick={() => hasBreakdown && setOpen((v) => !v)}
        onMouseEnter={() => hasBreakdown && setOpen(true)}
        onMouseLeave={() => hasBreakdown && setOpen(false)}
      >
        {casinos.slice(0, visible).map((casino) => (
          <CasinoIcon key={casino} name={casino} size={iconSize} />
        ))}
        {casinos.length > visible ? (
          <span
            className={`text-[rgba(42,39,78,0.45)] dark:text-white/40 ${
              size === "sm"
                ? "absolute left-full top-1/2 ml-0.5 -translate-y-1/2 text-[10px] leading-none"
                : "text-xs"
            }`}
          >
            +{casinos.length - visible}
          </span>
        ) : null}
      </button>

      {hasBreakdown && open && casinoWagers ? (
        <div className="absolute bottom-full right-0 z-50 mb-2">
          <div className="min-w-[180px] rounded-lg border border-[rgba(42,39,78,0.1)] bg-white px-3 py-1.5 shadow-xl dark:border-white/[0.08] dark:bg-[#0f1424]">
            {casinoWagers.map((row, index) => (
              <div key={row.casino}>
                {index > 0 ? (
                  <div className="h-px bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />
                ) : null}
                <div className="flex items-center justify-between gap-6 py-1.5">
                  <div className="flex items-center gap-2">
                    <CasinoIcon name={row.casino} size={18} />
                    <span className="whitespace-nowrap text-xs text-[#2a274e]/80 dark:text-white/80">
                      {casinoDisplayName(row.casino)}
                    </span>
                  </div>
                  <span className="text-xs font-medium tabular-nums text-[#2a274e] dark:text-white">
                    {formatLeaderboardWager(row.wager)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
