"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import type { PayoutsPayload } from "@/lib/calendar/data";
import { formatUsd } from "@/lib/calendar/format";

const TF_TABS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "365d", label: "365D" },
] as const;

type TfId = (typeof TF_TABS)[number]["id"];

const ROW_BORDER = "border-[rgba(42,39,78,0.06)] dark:border-white/[0.06]";

/** Bonus payouts leaderboard — `GET /api/casinos/bonus-payouts`. */
export function BonusPayouts({ data }: { data: PayoutsPayload | null }) {
  const [tf, setTf] = useState<TfId>("30d");
  const rows = data?.byTf?.[tf] ?? [];

  return (
    <Card
      id="bonus-payouts"
      variant="panel"
      blur
      padded={false}
      className="scroll-mt-24 p-4 lg:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
            Bonus Payouts by Casino
          </h2>
          <p className="mt-0.5 text-[12px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
            Publicly reported bonus amounts paid out to players
          </p>
        </div>
        <Tabs
          theme="auto"
          tabs={[...TF_TABS]}
          activeId={tf}
          onChange={(id) => setTf(id as TfId)}
          size="sm"
          sizeConfig={{ paddingY: 6 }}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[rgba(42,39,78,0.12)] py-14 text-center dark:border-white/10">
          <BarChart3 className="size-7 text-[rgba(42,39,78,0.25)] dark:text-white/25" />
          <p className="text-[14px] font-medium text-[rgba(42,39,78,0.7)] dark:text-white/70">
            Payout tracking coming soon
          </p>
          <p className="max-w-[420px] text-[12px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
            We’re verifying publicly reported bonus payouts across tracked
            casinos. This leaderboard populates once the data is confirmed.
          </p>
        </div>
      ) : (
        <div className="scrollbar-hide mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-[12px] font-medium uppercase text-[rgba(42,39,78,0.4)] dark:text-white/40">
                <th className="border-b border-[rgba(42,39,78,0.1)] px-2 pb-3 dark:border-white/10">
                  #
                </th>
                <th className="border-b border-[rgba(42,39,78,0.1)] px-2 pb-3 dark:border-white/10">
                  Casino
                </th>
                <th className="border-b border-[rgba(42,39,78,0.1)] px-2 pb-3 text-right dark:border-white/10">
                  Total Paid
                </th>
                <th className="border-b border-[rgba(42,39,78,0.1)] px-2 pb-3 dark:border-white/10">
                  Share
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.slug || row.casino}
                  className="transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]"
                >
                  <td
                    className={`border-b ${ROW_BORDER} px-2 py-3 text-[14px] font-medium text-[rgba(42,39,78,0.4)] dark:text-white/40`}
                  >
                    {index + 1}
                  </td>
                  <td className={`border-b ${ROW_BORDER} px-2 py-3`}>
                    <span className="flex items-center gap-2.5">
                      <AnalyticsCasinoIcon
                        casinoName={row.casino}
                        size={24}
                        theme="auto"
                      />
                      <span className="truncate text-[14px] font-medium text-[#2a274e] dark:text-white">
                        {row.casino}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`border-b ${ROW_BORDER} px-2 py-3 text-right text-[14px] font-semibold text-[#1f9d57] dark:text-[#4ad17d]`}
                  >
                    {formatUsd(row.totalPaid)}
                  </td>
                  <td className={`border-b ${ROW_BORDER} px-2 py-3`}>
                    <span className="flex items-center gap-2">
                      <span className="w-9 text-[14px] font-medium text-[#2a274e] dark:text-white">
                        {Math.round(row.share)}%
                      </span>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10">
                        <span
                          className="block h-full rounded-full bg-[#8874ff]"
                          style={{ width: `${row.share}%` }}
                        />
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
