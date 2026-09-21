"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { getComplaintsGlobalStatsClient } from "@/lib/complaints/api";
import type { ComplaintsGlobalStats } from "@/lib/complaints/types";
import {
  formatComplaintDisputeCount,
  formatComplaintFundsRecoveredLarge,
  formatComplaintResponseTime,
} from "@/lib/complaints/display";

/** Port of reference `ResolutionSummary` (41978). */
export function ResolutionSummary() {
  const [stats, setStats] = useState<ComplaintsGlobalStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getComplaintsGlobalStatsClient()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    const resolutionRate =
      stats && stats.totalDisputes > 0
        ? Math.round((stats.resolved / stats.totalDisputes) * 1000) / 10
        : null;

    return [
      {
        label: "Total Disputes",
        value: stats ? formatComplaintDisputeCount(stats.totalDisputes) : "—",
      },
      {
        label: "Resolution Rate",
        value: resolutionRate != null ? `${resolutionRate}%` : "—",
      },
      {
        label: "Funds Recovered",
        value: stats
          ? formatComplaintFundsRecoveredLarge(stats.fundsRecoveredUsd)
          : "—",
      },
      {
        label: "Avr Response Time",
        value: stats
          ? formatComplaintResponseTime(stats.avgResolutionHours)
          : "—",
      },
    ];
  }, [stats]);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="relative">
          <Card
            variant="glass"
            padded={false}
            className="relative h-auto rounded-[20px] bg-white/[0.02] px-4 py-3 backdrop-blur-[20px] md:p-4"
            contentClassName="flex flex-col gap-1.5"
          >
            <span className="text-[12px] uppercase text-[rgba(42,39,78,0.6)] md:text-[14px] dark:text-white/60">
              {item.label}
            </span>
            <span className="text-[24px] font-semibold leading-none text-[#2a274e] md:text-[32px] dark:text-white">
              {item.value}
            </span>
          </Card>
        </div>
      ))}
    </div>
  );
}
