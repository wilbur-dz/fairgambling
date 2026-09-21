"use client";

import { useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Watermark } from "@/components/ui/watermark";
import type {
  CodesBiggestRow,
  CodesByCasinoRow,
  CodesStatsPayload,
  CodesStatsPeriod,
} from "@/lib/livecodes/data";
import {
  formatCompactUsd,
  formatDropWhen,
} from "@/lib/livecodes/normalize";

const PERIODS: { id: CodesStatsPeriod; label: string }[] = [
  { id: "24h", label: "24H" },
  { id: "7d", label: "7D" },
  { id: "90d", label: "90D" },
];

function PeriodTabs({
  title,
  period,
  onPeriod,
}: {
  title: string;
  period: CodesStatsPeriod;
  onPeriod: (id: CodesStatsPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-[16px] font-medium text-[#2a274e] dark:text-white">
        {title}
      </h3>
      <div className="flex items-center gap-1 rounded-full border border-[rgba(42,39,78,0.12)] p-0.5 dark:border-white/15">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPeriod(item.id)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              period === item.id
                ? "bg-[rgba(136,116,255,0.14)] text-[#6b56e0] dark:text-[#9A80F9]"
                : "text-[rgba(42,39,78,0.5)] hover:text-[#2a274e] dark:text-white/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type LiveCodesStatsProps = {
  stats: CodesStatsPayload | null;
};

/** Stats from `GET /api/codes/stats` (24H / 7D / 90D). */
export function LiveCodesStats({ stats }: LiveCodesStatsProps) {
  const [byCasinoPeriod, setByCasinoPeriod] =
    useState<CodesStatsPeriod>("7d");
  const [biggestPeriod, setBiggestPeriod] = useState<CodesStatsPeriod>("7d");

  const byCasino: CodesByCasinoRow[] = (
    stats?.byCasino[byCasinoPeriod] ?? []
  ).slice(0, 5);
  const biggest: CodesBiggestRow[] = (
    stats?.biggest[biggestPeriod] ?? []
  ).slice(0, 5);

  const th =
    "whitespace-nowrap border-b px-2 pb-3 text-[12px] font-medium uppercase text-[rgba(42,39,78,0.4)] dark:text-white/40";
  const td = "border-b border-[rgba(42,39,78,0.08)] px-2 py-2.5 text-[13px]";
  const ink = "text-[#2a274e] dark:text-white";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
      <Card
        variant="glass"
        theme="auto"
        padded={false}
        className="light-element dark-glass-element rounded-[20px] p-4 sm:p-5"
        contentClassName="flex flex-col gap-4 md:gap-5"
      >
        <PeriodTabs
          title="Code Drops by Casino"
          period={byCasinoPeriod}
          onPeriod={setByCasinoPeriod}
        />
        <Watermark opacity={0.05} logoWidth={220}>
          <div className="scrollbar-hide overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left lg:table-fixed lg:min-w-[440px]">
              <thead>
                <tr>
                  {[
                    "Casino",
                    "Codes",
                    "Total Value",
                    "Avg Value",
                    "Claims",
                    "Share",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`${th} ${index >= 1 ? "text-right" : ""} ${
                        index === 0 ? "w-full lg:w-auto" : ""
                      } ${index === 3 || index === 4 ? "hidden lg:table-cell" : ""}`}
                    >
                      {index === 0 ? (
                        <span className="hidden lg:inline">{label}</span>
                      ) : index === 2 ? (
                        <>
                          <span className="lg:hidden">Value</span>
                          <span className="hidden lg:inline">Total Value</span>
                        </>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byCasino.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-2 py-10 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40"
                    >
                      No code drops in this period
                    </td>
                  </tr>
                ) : (
                  byCasino.map((row) => {
                    const sharePct = Math.round(row.share);
                    return (
                      <tr
                        key={row.slug}
                        className="transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]"
                      >
                        <td className={td}>
                          <span className="flex items-center gap-2">
                            <AnalyticsCasinoIcon
                              casinoName={row.casino}
                              size={22}
                              theme="auto"
                            />
                            <span
                              className={`hidden truncate font-medium lg:inline ${ink}`}
                            >
                              {row.casino}
                            </span>
                          </span>
                        </td>
                        <td className={`${td} text-right ${ink}`}>
                          {row.codes.toLocaleString("en-US")}
                        </td>
                        <td
                          className={`${td} text-right font-semibold text-[#22c55e]`}
                        >
                          {formatCompactUsd(row.totalValue)}
                        </td>
                        <td
                          className={`${td} hidden text-right lg:table-cell ${ink}`}
                        >
                          {formatCompactUsd(row.avgValue)}
                        </td>
                        <td
                          className={`${td} hidden text-right lg:table-cell ${ink}`}
                        >
                          {row.claims
                            ? row.claims.toLocaleString("en-US")
                            : "-"}
                        </td>
                        <td className={`${td} text-right`}>
                          <span className="inline-flex items-center justify-end gap-2">
                            <span className={`font-medium ${ink}`}>
                              {sharePct}%
                            </span>
                            <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-[rgba(42,39,78,0.1)] lg:block dark:bg-white/10">
                              <span
                                className="block h-full rounded-full bg-[#8874ff]"
                                style={{
                                  width: `${Math.min(100, Math.max(0, sharePct))}%`,
                                }}
                              />
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Watermark>
      </Card>

      <Card
        variant="glass"
        theme="auto"
        padded={false}
        className="light-element dark-glass-element rounded-[20px] p-4 sm:p-5"
        contentClassName="flex flex-col gap-4 md:gap-5"
      >
        <PeriodTabs
          title="Biggest Code Drops"
          period={biggestPeriod}
          onPeriod={setBiggestPeriod}
        />
        <Watermark opacity={0.05} logoWidth={220}>
          <div className="scrollbar-hide overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left lg:table-fixed lg:min-w-[480px]">
              <thead>
                <tr>
                  {[
                    "#",
                    "Casino",
                    "Code",
                    "Value",
                    "Claims",
                    "Total Paid",
                    "When",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`${th} ${
                        index >= 3 && index <= 5 ? "text-right" : ""
                      } ${index === 2 ? "w-full lg:w-auto" : ""} ${
                        index === 0 || index >= 4 ? "hidden lg:table-cell" : ""
                      }`}
                    >
                      {index === 1 ? (
                        <span className="hidden lg:inline">{label}</span>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {biggest.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-10 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40"
                    >
                      No code drops in this period
                    </td>
                  </tr>
                ) : (
                  biggest.map((row, index) => (
                    <tr
                      key={`${row.slug}-${row.code}-${index}`}
                      className="transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]"
                    >
                      <td
                        className={`${td} hidden font-medium lg:table-cell ${ink}`}
                      >
                        {index + 1}
                      </td>
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <AnalyticsCasinoIcon
                            casinoName={row.casino}
                            size={22}
                            theme="auto"
                          />
                          <span
                            className={`hidden truncate font-medium lg:inline ${ink}`}
                          >
                            {row.casino}
                          </span>
                        </span>
                      </td>
                      <td
                        className={`${td} max-w-[120px] truncate font-mono text-[12px] text-[#6b56e0] dark:text-[#9A80F9]`}
                      >
                        {row.code}
                      </td>
                      <td className={`${td} text-right font-semibold ${ink}`}>
                        {formatCompactUsd(row.value)}
                      </td>
                      <td
                        className={`${td} hidden text-right lg:table-cell ${ink}`}
                      >
                        {row.claims
                          ? row.claims.toLocaleString("en-US")
                          : "-"}
                      </td>
                      <td
                        className={`${td} hidden text-right font-medium lg:table-cell ${ink}`}
                      >
                        {formatCompactUsd(row.totalPaid)}
                      </td>
                      <td
                        className={`${td} hidden whitespace-nowrap text-[rgba(42,39,78,0.5)] lg:table-cell dark:text-white/45`}
                      >
                        {formatDropWhen(row.when)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Watermark>
      </Card>
    </div>
  );
}
