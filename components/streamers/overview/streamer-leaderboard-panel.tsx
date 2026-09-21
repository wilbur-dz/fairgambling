"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Info, Share2 } from "lucide-react";
import { MoneyLegend, StreamerCasinoIcon } from "@/components/streamers/shared";
import { MarketValueInfoModal } from "@/components/streamers/shared/market-value-info-modal";
import { ShareTopStreamersModal } from "@/components/streamers/shared/share-top-streamers-modal";
import { ThemedCard } from "@/components/ui/themed-card";
import { Dropdown } from "@/components/ui/dropdown";
import { Tabs } from "@/components/ui/tabs";
import { Watermark } from "@/components/ui/watermark";
import { LIST_TABS, mvOf } from "@/lib/streamers/data";
import {
  LEADERBOARD_DESKTOP_COLUMNS,
  LEADERBOARD_STATS_AWARE_KEYS,
  LIST_TAB_DEFAULT_SORT,
  TABLE_HEAD_CLASS,
  type ListTabId,
  type SortState,
} from "@/lib/streamers/leaderboard-config";
import type { StreamerRecord } from "@/lib/streamers/types";
import {
  isNewcomerStreamer,
  leaderboardSortValue,
} from "@/lib/streamers/view-format";
import {
  LeaderboardDesktopRow,
  LeaderboardMobileRow,
} from "./leaderboard-table-rows";
import { StreamerRequestEmpty } from "./streamer-request-empty";
import { StreamerSearchInput } from "./streamer-search-input";

function SortChevron({
  columnKey,
  sort,
}: {
  columnKey: string;
  sort: SortState;
}) {
  const up = sort.key === columnKey && sort.dir === "asc";
  const down = sort.key === columnKey && sort.dir === "desc";
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path
        d="M0.833 3.75L3.083 1.5M3.083 1.5L5.333 3.75M3.083 1.5V8.25"
        stroke={up ? "#8874ff" : "#414E62"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.167 8.25L8.917 10.5M8.917 10.5L6.667 8.25M8.917 10.5V3.75"
        stroke={down ? "#8874ff" : "#414E62"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StreamerLeaderboardPanel({
  streamers,
}: {
  streamers: StreamerRecord[];
}) {
  const [listTab, setListTab] = useState<ListTabId>("Most Valuable");
  const [search, setSearch] = useState("");
  const [casinoFilter, setCasinoFilter] = useState<Set<string> | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [sort, setSort] = useState<SortState>(LIST_TAB_DEFAULT_SORT["Most Valuable"]);
  const [mvInfoOpen, setMvInfoOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const casinoOptions = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of streamers) {
      const casino = row.currentCasino;
      if (!casino || casino === "—") continue;
      totals.set(casino, (totals.get(casino) ?? 0) + (mvOf(row) ?? 0));
    }
    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [streamers]);

  const { rows, rankByUsername } = useMemo(() => {
    const q = search.trim().toLowerCase();
    let pool = q
      ? streamers
      : streamers.filter(
          (row) =>
            row.hasStats ||
            row.followers > 0 ||
            row.avgViewers30d > 0 ||
            row.hoursWatched30d > 0,
        );

    if (casinoFilter) {
      pool = pool.filter((row) => casinoFilter.has(row.currentCasino));
    }
    if (listTab === "Live") pool = pool.filter((row) => row.live);
    if (listTab === "Newcomers") pool = pool.filter(isNewcomerStreamer);

    const statsAware = LEADERBOARD_STATS_AWARE_KEYS.has(sort.key);
    const sorted = [...pool].sort((a, b) => {
      if (statsAware) {
        const statDiff = Number(b.hasStats ?? false) - Number(a.hasStats ?? false);
        if (statDiff) return statDiff;
      }
      const diff =
        leaderboardSortValue(a, sort.key) - leaderboardSortValue(b, sort.key);
      return sort.dir === "desc" ? -diff : diff;
    });

    const ranks = new Map(sorted.map((row, i) => [row.username, i + 1]));
    const filtered = q
      ? sorted.filter((row) => row.username.toLowerCase().includes(q))
      : sorted;

    return { rows: filtered, rankByUsername: ranks };
  }, [streamers, listTab, search, sort, casinoFilter]);

  const visible = rows.slice(0, visibleCount);

  const toggleSort = (key: SortState["key"]) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  };

  return (
    <ThemedCard variant="panel" blur padded={false} className="p-4 lg:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          theme="auto"
          tabs={LIST_TABS.map((id) => ({
            id,
            label: id,
            leftIcon:
              id === "Live" ? (
                <span className="size-1.5 rounded-full bg-[#f7575f]" />
              ) : undefined,
          }))}
          activeId={listTab}
          onChange={(id) => {
            const tab = id as ListTabId;
            setListTab(tab);
            setSort(LIST_TAB_DEFAULT_SORT[tab] ?? { key: "payment", dir: "desc" });
            setVisibleCount(10);
          }}
          size="sm"
          fill
          className="flex w-full sm:inline-flex sm:w-auto"
        />
        <div className="order-last flex w-full justify-center sm:order-none sm:w-auto sm:flex-1">
          <StreamerSearchInput
            onQuery={(q) => {
              setSearch(q);
              setVisibleCount(10);
            }}
          />
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <span className="hidden lg:block">
            <MoneyLegend />
          </span>
          <button
            type="button"
            onClick={() => setMvInfoOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.5] px-3 py-2 text-[12px] font-medium text-[rgba(42,39,78,0.6)] transition-colors hover:text-[#2a274e] dark:border-white/15 dark:bg-white/[0.03] dark:text-white/60 dark:hover:text-white"
          >
            <Info size={13} /> How Market Value Works
          </button>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            onMouseEnter={() => {
              fetch("/api/og/streamers?metric=market-value").catch(() => {});
            }}
            aria-label="Share a top streamers snapshot"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.5] px-3 py-2 text-[12px] font-medium text-[rgba(42,39,78,0.6)] transition-colors hover:text-[#2a274e] dark:border-white/15 dark:bg-white/[0.03] dark:text-white/60 dark:hover:text-white"
          >
            <Share2 size={13} /> Share
          </button>
          <Dropdown
            theme="auto"
            multiple
            searchable
            size="sm"
            align="right"
            className="min-w-0 flex-1 [&>button]:w-full [&>button]:justify-between sm:flex-none sm:[&>button]:w-auto sm:[&>button]:justify-start"
            options={casinoOptions.map((c) => ({ value: c, label: c }))}
            renderIcon={(name, size) => (
              <StreamerCasinoIcon casinoName={name} size={size} />
            )}
            value={casinoFilter}
            onChange={(v) => {
              setCasinoFilter(v);
              setVisibleCount(10);
            }}
            allLabel="All Casinos"
            noun="Casino"
          />
        </div>
      </div>

      <MarketValueInfoModal open={mvInfoOpen} onClose={() => setMvInfoOpen(false)} />
      {shareOpen ? (
        <ShareTopStreamersModal
          streamers={streamers}
          casinoOptions={casinoOptions}
          onClose={() => setShareOpen(false)}
        />
      ) : null}

      {visible.length === 0 ? (
        <StreamerRequestEmpty query={search.trim()} />
      ) : (
        <Watermark
          opacity={0.05}
          logoWidth={280}
          repeat={visible.length >= 8 ? 2 : 1}
          className="mt-4"
        >
          <div className="scrollbar-hide overflow-x-auto sm:hidden">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {[
                    "#",
                    "Streamer",
                    "Market Value",
                    "Est. Payment",
                    "Casino",
                    "Followers",
                    "Avg Viewers",
                    "Last Live",
                  ].map((label, i) => (
                    <th
                      key={label}
                      className={`whitespace-nowrap px-2.5 pb-2.5 text-[10.5px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35 ${
                        [2, 3, 5, 6].includes(i) ? "text-right" : ""
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <LeaderboardMobileRow
                    key={row.username}
                    streamer={row}
                    rank={rankByUsername.get(row.username) ?? i + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="scrollbar-hide hidden overflow-x-auto sm:block">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <colgroup>
                {LEADERBOARD_DESKTOP_COLUMNS.map((col) => (
                  <col key={col.label} style={{ width: col.w }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {LEADERBOARD_DESKTOP_COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      onClick={col.key ? () => toggleSort(col.key!) : undefined}
                      className={`${TABLE_HEAD_CLASS} ${col.right ? "text-right" : ""} ${
                        col.center ? "text-center" : ""
                      } ${col.key ? "group cursor-pointer select-none" : ""}`}
                    >
                      <span
                        className={`inline-flex items-center gap-1 rounded-md transition-all ${
                          col.key
                            ? "-mx-2 -my-1 px-2 py-1 group-hover:bg-[rgba(42,39,78,0.06)] group-hover:text-[rgba(42,39,78,0.9)] dark:group-hover:bg-white/[0.06] dark:group-hover:text-white/90"
                            : ""
                        }`}
                      >
                        {col.label}
                        {col.key ? (
                          <SortChevron columnKey={col.key} sort={sort} />
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <LeaderboardDesktopRow
                    key={row.username}
                    streamer={row}
                    rank={rankByUsername.get(row.username) ?? i + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Watermark>
      )}

      {rows.length > 10 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/streamers/all"
            onClick={(e) => {
              e.preventDefault();
              setVisibleCount((n) =>
                n >= rows.length ? 10 : Math.min(n + 10, rows.length),
              );
            }}
            className="nd-gradient-border inline-flex items-center gap-1.5 rounded-full bg-[rgba(42,39,78,0.04)] px-5 py-2.5 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(42,39,78,0.07)] hover:text-[#2a274e] dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:text-white"
          >
            {visibleCount >= rows.length
              ? "Show less"
              : `Show more (${rows.length - visibleCount} left)`}
            <ChevronDown
              size={14}
              className={`text-[rgba(42,39,78,0.4)] transition-transform dark:text-white/40 ${
                visibleCount >= rows.length ? "rotate-180" : ""
              }`}
            />
          </Link>
          {visibleCount < rows.length ? (
            <Link
              href="/streamers/all"
              onClick={(e) => {
                e.preventDefault();
                setVisibleCount(rows.length);
              }}
              className="nd-gradient-border inline-flex items-center gap-1.5 rounded-full bg-[rgba(42,39,78,0.04)] px-5 py-2.5 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(42,39,78,0.07)] hover:text-[#2a274e] dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              Show all ({rows.length})
            </Link>
          ) : null}
        </div>
      ) : null}
    </ThemedCard>
  );
}
