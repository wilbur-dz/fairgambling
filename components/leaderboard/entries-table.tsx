"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CasinoStack } from "@/components/leaderboard/casino-stack";
import { formatLeaderboardWager } from "@/components/leaderboard/format";
import { RankMedal } from "@/components/leaderboard/rank-medal";
import { Button } from "@/components/ui/button";
import { Watermark } from "@/components/ui/watermark";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/leaderboard/api";
import type { LeaderboardEntry } from "@/lib/leaderboard/data";

const ROW =
  "flex h-[52px] items-center rounded-[12px] border px-2 transition-colors sm:px-4 md:h-[58px]";
const ROW_ALT =
  "bg-white hover:bg-[#f9f9fa] dark:bg-[rgba(163,178,217,0.055)] dark:hover:bg-[rgba(163,178,217,0.085)]";
const ROW_YOU =
  "border-[rgba(154,128,249,0.5)] bg-[rgba(136,116,255,0.14)] shadow-[0_0_20px_rgba(136,116,255,0.12)] hover:bg-[rgba(136,116,255,0.18)]";
const HEAD =
  "text-[12px] font-medium uppercase text-[rgba(42,39,78,0.4)] dark:text-white/30";
const NUM =
  "whitespace-nowrap text-[13px] tracking-[0.01em] tabular-nums text-[#2a274e] md:text-[15px] dark:text-white";

type EntriesTableProps = {
  entries: LeaderboardEntry[];
  showPrize?: boolean;
  currentUser?: LeaderboardEntry | null;
  onUsernameClick?: (username: string) => void;
  /** When set, View More calls the API instead of slicing locally. */
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  loadingMore?: boolean;
};

function EntryRow({
  entry,
  showPrize,
  isYou,
  onUsernameClick,
}: {
  entry: LeaderboardEntry;
  showPrize: boolean;
  isYou: boolean;
  onUsernameClick?: (username: string) => void;
}) {
  return (
    <div
      className={`${ROW} ${
        isYou
          ? ROW_YOU
          : `border-[rgba(42,39,78,0.08)] hover:border-[rgba(154,128,249,0.4)] dark:border-[rgba(234,236,240,0.09)] ${ROW_ALT}`
      }`}
    >
      <div className="flex w-8 shrink-0 items-center justify-center sm:w-10">
        {entry.rank <= 3 ? (
          <RankMedal rank={entry.rank} />
        ) : (
          <span className="text-[12px] font-medium tabular-nums text-[rgba(42,39,78,0.4)] md:text-[13px] dark:text-white/40">
            {entry.rank}
          </span>
        )}
      </div>

      <button
        type="button"
        disabled={entry.deactivated}
        onClick={() => {
          if (!entry.deactivated) onUsernameClick?.(entry.username);
        }}
        className={`flex min-w-0 flex-[2] items-center gap-2 text-left sm:flex-[1.5] sm:gap-3 ${
          entry.deactivated
            ? "cursor-default"
            : "cursor-pointer transition-opacity hover:opacity-80"
        }`}
      >
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full sm:h-7 sm:w-7">
          {entry.deactivated ? (
            <div className="h-full w-full bg-[rgba(42,39,78,0.08)] dark:bg-white/10" />
          ) : entry.avatarUrl ? (
            <Image
              src={entry.avatarUrl}
              alt={entry.username}
              width={28}
              height={28}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8874ff] to-[#5105a1] text-[10px] font-medium text-white sm:text-xs">
              {entry.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span
          className={`min-w-0 truncate text-[13px] font-semibold md:text-[15px] ${
            entry.deactivated
              ? "italic text-[rgba(42,39,78,0.4)] dark:text-white/40"
              : "text-[#2a274e] hover:underline dark:text-white"
          }`}
        >
          {entry.username}
        </span>
        {isYou ? (
          <span className="shrink-0 rounded-full bg-[#8874ff] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            You
          </span>
        ) : null}
      </button>

      <div className="flex-1 text-right">
        <span className={NUM}>{formatLeaderboardWager(entry.wager)}</span>
      </div>

      <div className="flex flex-1 items-center justify-center sm:justify-end">
        <div className="flex items-center sm:hidden">
          <CasinoStack
            casinos={entry.casinos}
            casinoWagers={entry.casinoWagers}
            size="sm"
          />
        </div>
        <div className="hidden items-center sm:flex">
          <CasinoStack
            casinos={entry.casinos}
            casinoWagers={entry.casinoWagers}
            size="lg"
          />
        </div>
      </div>

      {showPrize ? (
        <div className="w-14 text-right sm:flex-1">
          {entry.prize ? (
            <span className={NUM}>{entry.prize}</span>
          ) : (
            <span className="text-[13px] text-[rgba(42,39,78,0.4)] md:text-[15px] dark:text-white/40">
              —
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Ranked entries list — fields map 1:1 from `/api/leaderboard/current`. */
export function EntriesTable({
  entries,
  showPrize = true,
  currentUser = null,
  onUsernameClick,
  onLoadMore,
  hasMore: hasMoreProp,
  loadingMore = false,
}: EntriesTableProps) {
  if (entries.length === 0) return null;

  const hasMore =
    hasMoreProp ??
    (onLoadMore ? false : entries.length > LEADERBOARD_PAGE_SIZE);
  const youInTop = Boolean(
    currentUser && currentUser.rank <= LEADERBOARD_PAGE_SIZE,
  );
  const gapToBoard =
    currentUser && !youInTop
      ? (entries[entries.length - 1]?.wager ?? 0) - currentUser.wager
      : 0;

  return (
    <div className="relative rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 p-3 sm:p-4 dark:border-0 dark:bg-[#0f1424]">
      <Watermark
        opacity={0.05}
        logoWidth={300}
        repeat={Math.max(1, Math.ceil(entries.length / 12))}
      >
        <div className="flex items-center border-x border-transparent px-2 pb-2 sm:px-4">
          <div className="w-8 shrink-0 text-center sm:w-10">
            <span className={HEAD}>#</span>
          </div>
          <div className="min-w-0 flex-[2] sm:flex-[1.5]">
            <span className={HEAD}>Username</span>
          </div>
          <div className="flex-1 text-right">
            <span className={HEAD}>Wager</span>
          </div>
          <div className="flex-1 text-center sm:text-right">
            <span className={HEAD}>Casino</span>
          </div>
          {showPrize ? (
            <div className="w-14 text-right sm:flex-1">
              <span className={HEAD}>Prize</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => (
            <EntryRow
              key={`${entry.rank}-${entry.username}`}
              entry={entry}
              showPrize={showPrize}
              isYou={Boolean(
                youInTop && currentUser?.username === entry.username,
              )}
              onUsernameClick={onUsernameClick}
            />
          ))}
        </div>
      </Watermark>

      {hasMore && onLoadMore ? (
        <div className="flex justify-center pt-3">
          <Button
            variant="ghost"
            theme="auto"
            size="sm"
            disabled={loadingMore}
            rightIcon={loadingMore ? undefined : <ChevronDown />}
            onClick={() => void onLoadMore()}
          >
            {loadingMore ? "Loading…" : "View More"}
          </Button>
        </div>
      ) : null}

      {currentUser && !youInTop ? (
        <div className="mt-2.5 flex flex-col gap-2">
          <EntryRow
            entry={currentUser}
            showPrize={showPrize}
            isYou
            onUsernameClick={onUsernameClick}
          />
          {gapToBoard > 0 ? (
            <p className="px-2 text-center text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Wager to leaderboard: {formatLeaderboardWager(gapToBoard)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
