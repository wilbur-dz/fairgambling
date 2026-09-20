"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  CASINO_DISPLAY_NAMES,
  MOCK_DEPOSIT_FEED,
  MOCK_LEADERBOARD,
  MOCK_LIVE_BETS,
  formatFeedTime,
  formatFeedUsd,
  formatGameName,
  type DepositFeedRow,
  type LeaderboardEntry,
  type LiveBetRow,
} from "@/lib/home/data";
import {
  fetchDepositsClient,
  fetchLiveBetsClient,
} from "@/lib/home/client-feeds";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";

type ActivityTabId = "live-bets" | "deposits" | "leaderboard";

const TABS: {
  id: ActivityTabId;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "live-bets", label: "Live Bets", icon: Activity },
  { id: "deposits", label: "Deposit Feed", icon: TrendingUp },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const ROW =
  "grid items-center gap-2 px-1 py-3 border-b transition-colors sm:gap-3 border-[#2a274e]/[0.08] dark:border-white/[0.06]";
const COL_LABEL =
  "text-[11px] font-medium uppercase tracking-wide text-[#2a274e]/40 dark:text-white/40";
const HEAD_BORDER = "border-[#2a274e]/10 dark:border-white/[0.08]";
const HOVER = "hover:bg-[#2a274e]/[0.02] dark:hover:bg-white/[0.02]";
const TEXT = "text-[#2a274e] dark:text-white";
const MUTED = "text-[#2a274e]/40 dark:text-white/40";
const TOOLTIP =
  "whitespace-nowrap rounded-lg border px-3 py-2 shadow-lg border-[#2a274e]/10 bg-white text-[#2a274e] dark:border-white/10 dark:bg-[#0f1424] dark:text-white";

const RANK_COLORS: Record<number, string> = {
  1: "#E0A710",
  2: "#96ABB4",
  3: "#BD7F6F",
};

function casinoLabel(slug: string): string {
  return CASINO_DISPLAY_NAMES[slug] ?? slug;
}

function formatLeaderboardWager(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
}

function FeedCasinoIcon({ slug, size = 20 }: { slug: string; size?: number }) {
  const light = getCasinoLogoUrl(slug, "light");
  const dark = getCasinoLogoUrl(slug, "dark");
  if (!light) {
    return (
      <div className="size-5 rounded bg-[#2a274e]/[0.06] dark:bg-white/[0.06]" />
    );
  }
  return (
    <>
      <Image
        src={light}
        alt=""
        width={size}
        height={size}
        className="rounded dark:hidden"
        unoptimized
      />
      {dark ? (
        <Image
          src={dark}
          alt=""
          width={size}
          height={size}
          className="hidden rounded dark:block"
          unoptimized
        />
      ) : null}
    </>
  );
}

function FeedSkeleton({ cols }: { cols: number }) {
  return (
    <div className="pt-1">
      {Array.from({ length: 12 }).map((_, row) => (
        <div
          key={row}
          className="flex items-center gap-4 border-b border-[#2a274e]/[0.08] px-1 py-3 dark:border-white/[0.06]"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              className={`h-3 animate-pulse rounded bg-[#2a274e]/[0.06] dark:bg-white/[0.06] ${
                col === 0 ? "w-20" : col === cols - 1 ? "ml-auto w-16" : "w-24"
              } ${col === 1 ? "max-w-[100px] flex-1" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ViewAllLink({ href }: { href: string }) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        theme="auto"
        size="sm"
        rightIcon={<ArrowUpRight />}
      >
        View All
      </Button>
    </Link>
  );
}

function ViewAllRow({ href }: { href: string }) {
  return (
    <div className="flex justify-center py-4">
      <ViewAllLink href={href} />
    </div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  const fill = RANK_COLORS[rank];
  if (!fill) return null;
  return (
    <div className="relative size-8 shrink-0">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M25.3334 12.0013C25.3334 17.156 21.1547 21.3346 16.0001 21.3346C10.8454 21.3346 6.66675 17.156 6.66675 12.0013C6.66675 6.84665 10.8454 2.66797 16.0001 2.66797C21.1547 2.66797 25.3334 6.84665 25.3334 12.0013Z"
          fill={fill}
        />
        <path
          d="M9.45735 21.2539L8.95232 23.096C8.11453 26.1518 7.69564 27.6796 8.25463 28.5162C8.45053 28.8092 8.71333 29.0446 9.01829 29.1998C9.88845 29.6428 11.232 28.9428 13.9191 27.5427C14.8132 27.0768 15.2603 26.8439 15.7352 26.7932C15.9113 26.7744 16.0887 26.7744 16.2648 26.7932C16.7397 26.8439 17.1868 27.0768 18.0809 27.5427C20.768 28.9428 22.1116 29.6428 22.9817 29.1998C23.2867 29.0446 23.5495 28.8092 23.7453 28.5162C24.3044 27.6796 23.8855 26.1518 23.0477 23.096L22.5427 21.2539C20.6944 22.5628 18.4371 23.332 16 23.332C13.5629 23.332 11.3055 22.5628 9.45735 21.2539Z"
          fill={fill}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white"
        style={{ paddingBottom: 6 }}
      >
        {rank}
      </span>
    </div>
  );
}

function CasinoWagerTooltip({
  casinoWagers,
}: {
  casinoWagers: { casino: string; wager: number }[];
}) {
  return (
    <div className={TOOLTIP}>
      {casinoWagers.map((item) => (
        <div
          key={item.casino}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 shrink-0 items-center justify-center">
              <FeedCasinoIcon slug={item.casino} size={12} />
            </div>
            <span className="text-[11px] text-[#2a274e]/60 dark:text-white/60">
              {casinoLabel(item.casino)}
            </span>
          </div>
          <span className={`text-[11px] font-medium tabular-nums ${TEXT}`}>
            {formatLeaderboardWager(item.wager)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LiveBetsPanel({ bets }: { bets: LiveBetRow[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready && bets.length === 0) return <FeedSkeleton cols={7} />;

  const grid =
    "grid-cols-[90px_1fr_70px_70px] sm:grid-cols-[120px_100px_1fr_1fr_80px_80px_100px]";

  return (
    <div>
      <div className={`${ROW} ${grid} ${HEAD_BORDER}`}>
        <span className={COL_LABEL}>Casino</span>
        <span className={`${COL_LABEL} hidden sm:block`}>Time</span>
        <span className={COL_LABEL}>Player</span>
        <span className={`${COL_LABEL} hidden sm:block`}>Game</span>
        <span className={`${COL_LABEL} text-right`}>Bet</span>
        <span className={`${COL_LABEL} hidden text-right sm:block`}>Multi</span>
        <span className={`${COL_LABEL} text-right`}>Payout</span>
      </div>
      {bets.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className={`text-xs ${MUTED}`}>No live bets right now.</p>
        </div>
      ) : (
        bets.map((bet, index) => (
          <div
            key={bet.id}
            className={`${ROW} ${grid} cursor-pointer ${HOVER}${
              index >= 8 ? " hidden sm:grid" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-5 shrink-0 items-center justify-center">
                <FeedCasinoIcon slug={bet.casino} />
              </div>
              <span className={`truncate text-sm font-semibold ${TEXT}`}>
                {casinoLabel(bet.casino)}
              </span>
            </div>
            <span
              className={`hidden text-sm tabular-nums sm:block ${MUTED}`}
              suppressHydrationWarning
            >
              {formatFeedTime(bet.timestamp)}
            </span>
            <span
              className={`truncate text-sm ${
                bet.player === "Hidden"
                  ? `italic ${MUTED}`
                  : "font-medium text-[#8874ff]"
              }`}
            >
              {bet.player}
            </span>
            <span className="hidden truncate text-sm text-[#2a274e]/70 sm:block dark:text-white/70">
              {formatGameName(bet.game, bet.casino)}
            </span>
            <span
              className={`text-right text-sm font-medium tabular-nums ${TEXT}`}
            >
              {formatFeedUsd(bet.betAmountUsd)}
            </span>
            <span
              className={`hidden text-right text-sm tabular-nums sm:block ${
                bet.multiplier > 1
                  ? "text-[#1f9d57] dark:text-[#00ff86]"
                  : MUTED
              }`}
            >
              {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : "—"}
            </span>
            <span
              className={`text-right text-sm font-semibold tabular-nums ${
                bet.isWin
                  ? "text-[#1f9d57] dark:text-[#00ff86]"
                  : "text-[#f7575f]"
              }`}
            >
              {bet.isWin
                ? formatFeedUsd(bet.payoutUsd)
                : `-${formatFeedUsd(bet.betAmountUsd)}`}
            </span>
          </div>
        ))
      )}
      <ViewAllRow href="/bet-feed" />
    </div>
  );
}

function DepositFeedPanel({ deposits }: { deposits: DepositFeedRow[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready && deposits.length === 0) return <FeedSkeleton cols={7} />;

  const grid =
    "grid-cols-[90px_50px_70px_1fr] sm:grid-cols-[120px_110px_1fr_60px_90px_90px_100px]";
  const rows = deposits.slice(0, 15);

  return (
    <>
      <div className={`${ROW} ${grid} ${HEAD_BORDER}`}>
        <span className={COL_LABEL}>Casino</span>
        <span className={`${COL_LABEL} hidden sm:block`}>Time</span>
        <span className={`${COL_LABEL} hidden sm:block`}>Tx</span>
        <span className={`${COL_LABEL} hidden sm:block`}>Type</span>
        <span className={COL_LABEL}>Chain</span>
        <span className={COL_LABEL}>Coin</span>
        <span className={`${COL_LABEL} text-right`}>Amount</span>
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className={`text-xs ${MUTED}`}>Waiting for deposits…</p>
        </div>
      ) : (
        rows.map((row, index) => {
          const shortHash =
            row.txHash.length > 12
              ? `${row.txHash.slice(0, 6)}…${row.txHash.slice(-4)}`
              : row.txHash;
          return (
            <div
              key={row.txHash}
              className={`${ROW} ${grid} ${HOVER}${
                index >= 8 ? " hidden sm:grid" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center">
                  <FeedCasinoIcon slug={row.casinoSlug} />
                </div>
                <span className={`truncate text-sm font-semibold ${TEXT}`}>
                  {row.casinoName}
                </span>
              </div>
              <span
                className={`hidden text-sm tabular-nums sm:block ${MUTED}`}
                suppressHydrationWarning
              >
                {formatFeedTime(row.transactionDate)}
              </span>
              <span className="hidden truncate font-mono text-sm text-[#8874ff] sm:block">
                {shortHash}
              </span>
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-1 rounded bg-[#1f9d57]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#1f9d57] dark:bg-[#00ff86]/10 dark:text-[#00ff86]">
                  ↑ DEP
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="hidden text-sm text-[#2a274e]/70 min-[420px]:inline dark:text-white/70">
                  {row.chain}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[#2a274e]/70 dark:text-white/70">
                  {row.coin.split("-")[0]}
                </span>
              </div>
              <span className="text-right text-sm font-semibold tabular-nums text-[#1f9d57] dark:text-[#00ff86]">
                {formatFeedUsd(row.amountUsd)}
              </span>
            </div>
          );
        })
      )}
      <ViewAllRow href="/analytics" />
    </>
  );
}

function ActivityLeaderboardPanel({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const timer = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return <FeedSkeleton cols={4} />;
  if (entries.length === 0) {
    return (
      <div
        className={`flex items-center justify-center py-10 text-center text-sm ${MUTED}`}
      >
        No entries yet — be the first on the board.
      </div>
    );
  }

  const visible = !isMobile || expanded ? entries : entries.slice(0, 8);
  const grid =
    "grid-cols-[28px_1fr_70px_60px] sm:grid-cols-[40px_1fr_100px_120px_80px]";

  return (
    <>
      <div className={`${ROW} ${grid} ${HEAD_BORDER}`}>
        <span className={`${COL_LABEL} text-center`}>#</span>
        <span className={COL_LABEL}>Username</span>
        <span className={`${COL_LABEL} text-right`}>Wager</span>
        <span className={`${COL_LABEL} hidden text-center sm:block`}>
          Casinos
        </span>
        <span className={`${COL_LABEL} text-right`}>Prize</span>
      </div>
      {visible.map((entry) => {
        const topThree = entry.rank <= 3;
        const hasWagers =
          Array.isArray(entry.casinoWagers) && entry.casinoWagers.length > 0;
        return (
          <div key={entry.rank} className={`${ROW} ${grid} ${HOVER}`}>
            <div className="flex justify-center">
              {topThree ? (
                <RankMedal rank={entry.rank} />
              ) : (
                <span className={`text-sm font-medium ${MUTED}`}>
                  {entry.rank}
                </span>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2 text-left">
              <div className="size-6 shrink-0 overflow-hidden rounded-full">
                {entry.avatarUrl ? (
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.username}
                    width={24}
                    height={24}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-[10px] font-bold text-white">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className={`truncate text-sm font-medium ${TEXT}`}>
                {entry.username}
              </span>
            </div>
            <div className="group relative">
              <span
                className={`block cursor-default text-right text-sm font-semibold tabular-nums ${TEXT}`}
              >
                {formatLeaderboardWager(entry.wager)}
              </span>
              {hasWagers ? (
                <div className="absolute bottom-full right-0 z-50 mb-2 hidden group-hover:block">
                  <CasinoWagerTooltip casinoWagers={entry.casinoWagers!} />
                </div>
              ) : null}
            </div>
            <div className="hidden items-center justify-center sm:flex">
              <div className="group relative flex items-center gap-1">
                {entry.casinos.slice(0, 3).map((casino) => (
                  <div
                    key={casino}
                    className="flex size-5 shrink-0 items-center justify-center"
                  >
                    <FeedCasinoIcon slug={casino} size={18} />
                  </div>
                ))}
                {entry.casinos.length > 3 ? (
                  <span className={`text-[10px] ${MUTED}`}>
                    +{entry.casinos.length - 3}
                  </span>
                ) : null}
                {hasWagers ? (
                  <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 group-hover:block">
                    <CasinoWagerTooltip casinoWagers={entry.casinoWagers!} />
                  </div>
                ) : null}
              </div>
            </div>
            <span
              className={`text-right text-sm font-semibold tabular-nums ${TEXT}`}
            >
              {entry.prize ?? "—"}
            </span>
          </div>
        );
      })}
      <div className="flex justify-center gap-3 py-4">
        {isMobile && !expanded && entries.length > 8 ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-sm font-medium text-[#2a274e]/40 transition-colors hover:text-[#2a274e]/70 dark:text-white/40 dark:hover:text-white/70"
          >
            Show more ({entries.length - 8})
          </button>
        ) : null}
        <ViewAllLink href="/leaderboard" />
      </div>
    </>
  );
}

/** `eW` / `te` — Live activity tabs (bets / deposits / leaderboard). */
export function HomeActivityTabs({
  liveBets = MOCK_LIVE_BETS,
  deposits = MOCK_DEPOSIT_FEED,
  leaderboardEntries = MOCK_LEADERBOARD.entries,
}: {
  liveBets?: LiveBetRow[];
  deposits?: DepositFeedRow[];
  leaderboardEntries?: LeaderboardEntry[];
}) {
  const [tab, setTab] = useState<ActivityTabId>("live-bets");
  const [visited, setVisited] = useState(
    () => new Set<ActivityTabId>(["live-bets"]),
  );
  const [betsRows, setBetsRows] = useState(liveBets);
  const [depositRows, setDepositRows] = useState(deposits);

  useEffect(() => {
    setBetsRows(liveBets);
  }, [liveBets]);

  useEffect(() => {
    setDepositRows(deposits);
  }, [deposits]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (tab === "live-bets") {
        try {
          const next = await fetchLiveBetsClient(20);
          if (!cancelled && next.length > 0) setBetsRows(next);
        } catch (err) {
          console.error("[home] live bets refresh failed", err);
        }
        return;
      }
      if (tab === "deposits") {
        try {
          const next = await fetchDepositsClient(20);
          if (!cancelled && next.length > 0) setDepositRows(next);
        } catch (err) {
          console.error("[home] deposits refresh failed", err);
        }
      }
    };

    void refresh();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const selectTab = (id: ActivityTabId) => {
    setTab(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[#2a274e]/10 dark:border-white/[0.08]">
        {TABS.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 py-3.5 text-sm font-medium transition-colors sm:px-4 ${
                active
                  ? "border-[#8874ff] text-[#2a274e] dark:text-white"
                  : "border-transparent text-[#2a274e]/40 hover:text-[#2a274e]/70 dark:text-white/40 dark:hover:text-white/70"
              }`}
            >
              <Icon
                size={15}
                className={`shrink-0 ${active ? "text-[#8874ff]" : ""}`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {visited.has("live-bets") ? (
        <div className={tab === "live-bets" ? undefined : "hidden"}>
          <LiveBetsPanel bets={betsRows} />
        </div>
      ) : null}
      {visited.has("deposits") ? (
        <div className={tab === "deposits" ? undefined : "hidden"}>
          <DepositFeedPanel deposits={depositRows} />
        </div>
      ) : null}
      {visited.has("leaderboard") ? (
        <div className={tab === "leaderboard" ? undefined : "hidden"}>
          <ActivityLeaderboardPanel entries={leaderboardEntries} />
        </div>
      ) : null}
    </div>
  );
}
