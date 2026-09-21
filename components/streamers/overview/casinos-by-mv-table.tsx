"use client";

import { useMemo, useState } from "react";
import { StreamerCasinoIcon } from "@/components/streamers/shared";
import { ThemedCard } from "@/components/ui/themed-card";
import { Watermark } from "@/components/ui/watermark";
import { formatMarketValue, mvOf } from "@/lib/streamers/data";
import { TABLE_CELL_CLASS, TABLE_HEAD_CLASS } from "@/lib/streamers/leaderboard-config";
import type { StreamerRecord } from "@/lib/streamers/types";

type SortKey = "casino" | "streamers" | "value";

export function CasinosByMarketValueTable({
  streamers,
}: {
  streamers: StreamerRecord[];
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "value",
    dir: -1,
  });

  const rows = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    for (const row of streamers) {
      const casino = row.currentCasino;
      if (!casino || casino === "—" || casino === "Multi") continue;
      const mv = mvOf(row);
      const entry = map.get(casino) ?? { count: 0, value: 0 };
      entry.count += 1;
      if (mv) entry.value += mv;
      map.set(casino, entry);
    }
    const list = [...map.entries()].map(([casino, stats]) => ({
      casino,
      streamers: stats.count,
      value: stats.value,
    }));
    const total = list.reduce((s, r) => s + r.value, 0) || 1;
    return list.map((r) => ({
      ...r,
      share: (r.value / total) * 100,
      valueLabel: formatMarketValue(r.value) ?? "—",
    }));
  }, [streamers]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        let cmp = 0;
        if (sort.key === "casino") cmp = a.casino.localeCompare(b.casino);
        else if (sort.key === "streamers") cmp = a.streamers - b.streamers;
        else cmp = a.value - b.value;
        return cmp * sort.dir;
      }),
    [rows, sort],
  );

  const header = (
    label: string,
    key: SortKey | null,
    right?: boolean,
    hideSm?: boolean,
    widthClass?: string,
  ) => (
    <th
      key={label}
      onClick={
        key
          ? () =>
              setSort((s) =>
                s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: -1 },
              )
          : undefined
      }
      className={`${TABLE_HEAD_CLASS} sticky top-0 z-10 !px-2.5 backdrop-blur-md ${widthClass ?? ""} ${
        right ? "text-right" : ""
      } ${key ? "group cursor-pointer select-none" : ""} ${hideSm ? "hidden sm:table-cell" : ""}`}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-md transition-all ${
          key
            ? "-mx-2 -my-1 px-2 py-1 group-hover:bg-[rgba(42,39,78,0.06)] group-hover:text-[rgba(42,39,78,0.9)] dark:group-hover:bg-white/[0.06] dark:group-hover:text-white/90"
            : ""
        }`}
      >
        {label}
      </span>
    </th>
  );

  return (
    <ThemedCard variant="panel" blur padded={false} className="p-4 lg:p-5">
      <h2 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
        Casinos by Streamer Market Value
      </h2>
      <div className="relative mt-4">
        <div className="scrollbar-hide max-h-[560px] overflow-x-clip overflow-y-auto">
          <Watermark opacity={0.06} logoWidth={220}>
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {header("#", null, false, false, "w-8 sm:w-9 !pl-3")}
                  {header("Casino", "casino")}
                  {header("Streamers", "streamers", true, true, "w-[92px]")}
                  {header("Share", null, true, true, "w-[126px]")}
                  {header("Market Value", "value", true, false, "w-[86px] sm:w-[104px]")}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, index) => (
                  <tr
                    key={row.casino}
                    className="transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]"
                  >
                    <td
                      className={`${TABLE_CELL_CLASS} !px-2.5 !pl-3 text-[rgba(42,39,78,0.4)] dark:text-white/35`}
                    >
                      {index + 1}
                    </td>
                    <td className={`${TABLE_CELL_CLASS} !px-2.5`}>
                      <span className="flex min-w-0 items-center gap-2">
                        <StreamerCasinoIcon casinoName={row.casino} size={20} />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium text-[#2a274e] dark:text-white">
                            {row.casino.trim().toLowerCase() === "free agent" ? (
                              <>
                                Free Agent{" "}
                                <span className="font-normal text-[rgba(42,39,78,0.4)] sm:hidden xl:inline dark:text-white/40">
                                  (no deal currently)
                                </span>
                              </>
                            ) : (
                              row.casino
                            )}
                          </span>
                          <span className="text-[10.5px] leading-tight text-[rgba(42,39,78,0.4)] sm:hidden dark:text-white/40">
                            {row.streamers} streamer{row.streamers === 1 ? "" : "s"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td
                      className={`${TABLE_CELL_CLASS} hidden !px-2.5 text-right text-[rgba(42,39,78,0.8)] sm:table-cell dark:text-white/80`}
                    >
                      {row.streamers}
                    </td>
                    <td className={`${TABLE_CELL_CLASS} hidden !px-2.5 sm:table-cell`}>
                      <span className="flex items-center gap-3">
                        <span className="min-w-[36px] text-[12.5px] font-medium text-[rgba(42,39,78,0.8)] dark:text-white/80">
                          {row.share.toFixed(1)}%
                        </span>
                        <span className="relative h-1.5 w-12 shrink-0 rounded-full bg-[rgba(42,39,78,0.12)] dark:bg-[#414e62]">
                          <span
                            className="absolute left-0 top-0 block h-full rounded-full bg-[#9a80f9]"
                            style={{ width: `${Math.min(row.share, 100)}%` }}
                          />
                        </span>
                      </span>
                    </td>
                    <td
                      className={`${TABLE_CELL_CLASS} !px-2.5 text-right font-medium text-[#2a274e] dark:text-white`}
                    >
                      {row.valueLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Watermark>
        </div>
      </div>
    </ThemedCard>
  );
}
