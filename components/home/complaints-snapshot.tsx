"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClickNav } from "@/components/ui/click-nav";
import {
  COMPLAINT_CASINO_AVATARS,
  MOCK_COMPLAINT_STATS,
  SHOW_COMPLAINT_STATS,
  formatAvgResponseHours,
  formatDisputeCount,
  formatFundsRecovered,
  type ComplaintGlobalStats,
} from "@/lib/home/data";

function buildStatItems(stats: ComplaintGlobalStats | null | undefined) {
  const resolutionRate =
    stats && stats.totalDisputes > 0
      ? Math.round((stats.resolved / stats.totalDisputes) * 1000) / 10
      : null;

  return [
    {
      label: "Total Disputes",
      value: stats ? formatDisputeCount(stats.totalDisputes) : "—",
    },
    {
      label: "Resolution Rate",
      value: resolutionRate != null ? `${resolutionRate}%` : "—",
    },
    {
      label: "Funds Recovered",
      value: stats ? formatFundsRecovered(stats.fundsRecoveredUsd) : "—",
    },
    {
      label: "Avg Response",
      value: stats
        ? formatAvgResponseHours(stats.avgResolutionHours)
        : "—",
    },
  ];
}

/** `G` — Complaints snapshot from global-stats. */
export function ComplaintsSnapshot({
  stats = MOCK_COMPLAINT_STATS,
}: {
  stats?: ComplaintGlobalStats | null;
}) {
  const items = useMemo(() => buildStatItems(stats), [stats]);

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="w-full"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          Complaints
        </h2>
        <Link href="/complaints">
          <Button
            variant="ghost"
            theme="auto"
            size="sm"
            rightIcon={<ArrowUpRight />}
          >
            View All
          </Button>
        </Link>
      </div>

      {SHOW_COMPLAINT_STATS ? (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex h-[70px] flex-col justify-center gap-2 rounded-[16px] bg-[#2a274e]/[0.03] px-[14px] dark:bg-white/[0.02]"
            >
              <span className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
                {item.value}
              </span>
              <span className="text-[10px] font-semibold uppercase text-[#2a274e]/50 dark:text-[#94a3b8] dark:opacity-60">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="-m-1 flex items-center overflow-hidden p-1">
          {COMPLAINT_CASINO_AVATARS.map((name) => (
            <span
              key={name}
              className="inline-flex rounded-full ring-[1.5px] ring-[#2a274e]/[0.14] dark:ring-[#0f1424]"
              style={{ marginRight: -4 }}
            >
              <AnalyticsCasinoIcon
                casinoName={name}
                size={26}
                theme="auto"
              />
            </span>
          ))}
          <span className="z-10 ml-2.5 shrink-0 whitespace-nowrap rounded-full bg-[#2a274e]/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#2a274e]/55 dark:bg-white/[0.06] dark:text-white/55">
            +99 more
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ClickNav href="/complaints/new">
            <Button variant="primary" size="md" className="w-full">
              Submit a Complaint
            </Button>
          </ClickNav>
          <Link href="/complaints">
            <Button variant="ghost" theme="auto" size="md" className="w-full">
              Open Disputes
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
