"use client";

import { useMemo, useState } from "react";
import { Building2, Users } from "lucide-react";
import {
  BubbleView,
  formatBubbleMarketValue,
} from "@/components/streamers/analytics/bubble-view";
import { StreamerAvatar, StreamerCasinoIcon } from "@/components/streamers/shared";
import { ThemedCard } from "@/components/ui/themed-card";
import { Watermark } from "@/components/ui/watermark";
import { formatMarketValue, mvOf } from "@/lib/streamers/data";
import type { StreamerRecord } from "@/lib/streamers/types";
import {
  BUBBLE_CHART_COLORS,
  STREAMER_TOP_LIMITS,
} from "@/lib/streamers/view-format";

type ViewMode = "casino" | "streamer";

export function MarketValueBubblePanel({
  streamers,
}: {
  streamers: StreamerRecord[];
}) {
  const [mode, setMode] = useState<ViewMode>("streamer");
  const [topLimit, setTopLimit] = useState<(typeof STREAMER_TOP_LIMITS)[number]>(25);

  const casinoData = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of streamers) {
      const casino = row.currentCasino;
      if (!casino || casino === "—" || casino === "Multi") continue;
      const mv = mvOf(row);
      if (mv) map.set(casino, (map.get(casino) ?? 0) + mv);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    return entries.map(([label, value], i) => ({
      id: label,
      label,
      value,
      share: (value / total) * 100,
      color: BUBBLE_CHART_COLORS[i % BUBBLE_CHART_COLORS.length],
    }));
  }, [streamers]);

  const streamerData = useMemo(() => {
    const ranked = streamers
      .map((row) => ({ row, mv: mvOf(row) ?? 0 }))
      .filter((x) => x.mv > 0)
      .sort((a, b) => b.mv - a.mv);
    const slice =
      topLimit === "all" ? ranked : ranked.slice(0, topLimit);
    const total = slice.reduce((s, x) => s + x.mv, 0) || 1;
    return slice.map(({ row, mv }, i) => ({
      id: row.username,
      label: row.username,
      value: mv,
      share: (mv / total) * 100,
      color: BUBBLE_CHART_COLORS[i % BUBBLE_CHART_COLORS.length],
    }));
  }, [streamers, topLimit]);

  const data = mode === "casino" ? casinoData : streamerData;

  return (
    <ThemedCard
      variant="panel"
      blur
      padded={false}
      className="p-4 lg:p-5"
      contentClassName="flex h-full flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
          {mode === "casino"
            ? "Casinos by Streamer Market Value"
            : "Streamers by Market Value"}
        </h2>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {mode === "streamer" ? (
            <div className="nd-gradient-border-auto relative flex flex-1 items-center gap-0.5 rounded-full p-1 backdrop-blur-[35.5px] dark:bg-white/[0.01] sm:inline-flex sm:flex-none">
              {STREAMER_TOP_LIMITS.map((limit) => (
                <button
                  key={String(limit)}
                  type="button"
                  onClick={() => setTopLimit(limit)}
                  className={`flex-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all sm:flex-none ${
                    topLimit === limit
                      ? "nd-gradient-border bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] text-white dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
                      : "text-[rgba(42,39,78,0.5)] hover:bg-[rgba(42,39,78,0.04)] hover:text-[#2a274e] dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
                  }`}
                >
                  {limit === "all" ? "All" : limit}
                </button>
              ))}
            </div>
          ) : null}
          <div className="nd-gradient-border-auto relative flex max-sm:flex-1 items-center gap-1 rounded-full p-1 backdrop-blur-[35.5px] dark:bg-white/[0.01] sm:inline-flex">
            {(["casino", "streamer"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                title={id === "casino" ? "By casino" : "By streamer"}
                aria-label={id === "casino" ? "By casino" : "By streamer"}
                className={`inline-flex max-sm:flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium transition-all sm:px-3 ${
                  mode === id
                    ? "nd-gradient-border bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] text-white dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
                    : "text-[rgba(42,39,78,0.5)] hover:bg-[rgba(42,39,78,0.04)] hover:text-[#2a274e] dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
                }`}
              >
                {id === "casino" ? <Building2 size={13} /> : <Users size={13} />}
                <span className="hidden sm:inline">
                  {id === "casino" ? "By casino" : "By streamer"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="relative mt-2 flex min-h-[420px] flex-1 flex-col">
        <Watermark opacity={0.06} logoWidth={240} className="flex flex-1 flex-col">
          <BubbleView
            data={data}
            isLoading={false}
            groupBy={mode}
            heightClassName="min-h-[400px] flex-1"
            ariaContext={
              mode === "casino"
                ? "estimated streamer market value by casino"
                : "estimated streamer market value"
            }
            valueFormat={(v) => formatMarketValue(v) ?? formatBubbleMarketValue(v)}
            renderIcon={
              mode === "streamer"
                ? (id, label, size) => (
                    <StreamerAvatar name={label} size={size} />
                  )
                : (id, label, size) => (
                    <StreamerCasinoIcon casinoName={label} size={size} />
                  )
            }
          />
        </Watermark>
      </div>
    </ThemedCard>
  );
}
