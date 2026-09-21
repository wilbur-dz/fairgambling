"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MoneyLegend } from "@/components/streamers/shared";
import { ThemedCard } from "@/components/ui/themed-card";
import { Tabs } from "@/components/ui/tabs";
import type { StreamerRecord } from "@/lib/streamers/types";
import { StreamerCard } from "./streamer-card";

export function AllStreamersPanel({ streamers }: { streamers: StreamerRecord[] }) {
  const [liveOnly, setLiveOnly] = useState(false);
  const [query, setQuery] = useState("");

  const liveCount = streamers.filter((s) => s.live).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return streamers.filter(
      (row) =>
        (!liveOnly || row.live) &&
        (!q || row.username.toLowerCase().includes(q)),
    );
  }, [streamers, liveOnly, query]);

  return (
    <ThemedCard variant="panel" blur padded={false} className="p-4 lg:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          theme="auto"
          tabs={[
            { id: "all", label: `All · ${streamers.length}` },
            {
              id: "live",
              label: `Live Now · ${liveCount}`,
              leftIcon: (
                <span className="size-1.5 rounded-full bg-[#f7575f]" />
              ),
            },
          ]}
          activeId={liveOnly ? "live" : "all"}
          onChange={(id) => setLiveOnly(id === "live")}
          size="sm"
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden lg:block">
            <MoneyLegend />
          </span>
          <div className="flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.5] px-3 py-2 dark:border-white/15 dark:bg-white/[0.03]">
            <Search
              size={13}
              className="text-[rgba(42,39,78,0.4)] dark:text-white/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search streamer…"
              className="w-40 bg-transparent text-[12px] text-[rgba(42,39,78,0.8)] placeholder:text-[rgba(42,39,78,0.4)] focus:outline-none dark:text-white/80 dark:placeholder:text-white/40"
            />
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
          No streamers match this filter
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((row) => (
            <StreamerCard key={row.username} streamer={row} />
          ))}
        </div>
      )}
    </ThemedCard>
  );
}
