"use client";

import Link from "next/link";
import {
  CasinoTag,
  DegenBadge,
  LiveBadge,
  MoneyTypeBadge,
  StreamerAvatar,
} from "@/components/streamers/shared";
import { ThemedCard } from "@/components/ui/themed-card";
import { formatMarketValue, mvOf, streamerHref } from "@/lib/streamers/data";
import type { StreamerRecord } from "@/lib/streamers/types";
import {
  formatCompactNumber,
  formatRelativeLastLive,
} from "@/lib/streamers/view-format";

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35">
        {label}
      </span>
      <span className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
        {value}
      </span>
    </div>
  );
}

export function StreamerCard({ streamer }: { streamer: StreamerRecord }) {
  const dealLabel = streamer.estMonthlyPayment
    ? streamer.estMonthlyPayment
    : streamer.leaderboard
      ? "Leaderboard active"
      : "No public deal";
  const mvLabel = formatMarketValue(mvOf(streamer));

  return (
    <ThemedCard
      variant="glass"
      blur
      padded={false}
      className="overflow-hidden"
      contentClassName="flex h-full flex-col gap-3.5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <StreamerAvatar
            name={streamer.username}
            src={streamer.avatarUrl}
            size={48}
          />
          {streamer.live ? (
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#12151f] bg-[#f7575f]" />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-[#2a274e] dark:text-white">
              {streamer.username}
            </span>
            {streamer.live ? (
              <LiveBadge viewers={streamer.liveViewers} />
            ) : (
              <span className="shrink-0 text-[10px] font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30">
                OFFLINE
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-[rgba(42,39,78,0.05)] px-2 py-0.5 text-[11px] text-[rgba(42,39,78,0.7)] dark:bg-white/[0.05] dark:text-white/70">
              <CasinoTag name={streamer.currentCasino} size={14} />
            </span>
            <MoneyTypeBadge value={streamer.rawFake} size={12} />
            <DegenBadge level={streamer.degen} inline />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-[rgba(42,39,78,0.06)] pt-3 dark:border-white/[0.06]">
        <StatCell
          label="Followers"
          value={streamer.followers > 0 ? formatCompactNumber(streamer.followers) : "—"}
        />
        <StatCell
          label="Avg viewers · 30D"
          value={
            streamer.avgViewers30d > 0
              ? formatCompactNumber(streamer.avgViewers30d)
              : "—"
          }
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35">
            Deal
          </span>
          <span
            className={`truncate text-[15px] font-semibold ${
              streamer.estMonthlyPayment || streamer.leaderboard
                ? "text-[#4ad17d]"
                : "text-[rgba(42,39,78,0.4)] dark:text-white/40"
            }`}
          >
            {dealLabel}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35">
            Market Value
          </span>
          <span className="w-fit bg-gradient-to-r from-[#6c2bd9] via-[#9A80F9] to-[#6c2bd9] bg-clip-text text-[16px] font-bold text-transparent [filter:drop-shadow(0_0_10px_rgba(136,116,255,0.25))] dark:from-[#c9bcff] dark:via-white dark:to-[#c9bcff] dark:[filter:drop-shadow(0_0_10px_rgba(136,116,255,0.5))]">
            {mvLabel ?? "—"}
          </span>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[rgba(42,39,78,0.06)] pt-3 dark:border-white/[0.06]">
        <span
          className="text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/35"
          suppressHydrationWarning
        >
          {streamer.live
            ? "Live now"
            : streamer.lastStreamed
              ? `Last live ${formatRelativeLastLive(streamer.lastStreamed)}`
              : "No recent stream data"}
        </span>
        <Link
          href={streamerHref(streamer.username)}
          className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-white/20 bg-[rgba(142,142,255,0.06)] px-4 py-1.5 text-[12px] font-medium text-[#9A80F9] transition-colors hover:bg-[rgba(142,142,255,0.12)]"
        >
          Profile
        </Link>
      </div>
    </ThemedCard>
  );
}
