"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Watermark } from "@/components/ui/watermark";
import {
  type LeaderboardEntry,
  type LeaderboardPayload,
} from "@/lib/home/data";

const ROW_BORDER = "border-[#2a274e]/[0.08] dark:border-white/[0.06]";
const HEAD_BORDER = "border-[#2a274e]/10 dark:border-white/[0.08]";
const TEXT = "text-[#2a274e] dark:text-white";
const MUTED = "text-[#2a274e]/40 dark:text-white/40";

function formatLeaderboardWager(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const casinos = Array.isArray(entry.casinos) ? entry.casinos : [];

  return (
    <tr className="transition-colors hover:bg-[#2a274e]/[0.02] dark:hover:bg-white/[0.02]">
      <td className={`border-b ${ROW_BORDER} py-3 pr-3`}>
        <span className="flex items-center gap-2.5">
          {entry.avatarUrl ? (
            <Image
              src={entry.avatarUrl}
              alt={entry.username}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <PlayerAvatar name={entry.username || "?"} size={28} />
          )}
          <span className={`truncate text-sm font-semibold ${TEXT}`}>
            {entry.username || "Anonymous"}
          </span>
        </span>
      </td>
      <td
        className={`border-b ${ROW_BORDER} px-3 py-3 text-sm font-bold tabular-nums ${TEXT}`}
      >
        {formatLeaderboardWager(entry.wager)}
      </td>
      <td className={`border-b ${ROW_BORDER} px-3 py-3`}>
        <span className="flex items-center">
          {casinos.slice(0, 3).map((casino, index) => (
            <span
              key={casino}
              className="inline-flex rounded-full ring-2 ring-[#2a274e]/[0.14] dark:ring-[#0f1424]"
              style={{ marginLeft: index ? -6 : 0 }}
            >
              <AnalyticsCasinoIcon
                casinoName={casino}
                size={22}
                theme="auto"
              />
            </span>
          ))}
          {casinos.length > 3 ? (
            <span className={`ml-1.5 text-[12px] ${MUTED}`}>
              +{casinos.length - 3}
            </span>
          ) : null}
        </span>
      </td>
      <td
        className={`border-b ${ROW_BORDER} px-3 py-3 text-right text-sm font-bold tabular-nums ${TEXT}`}
      >
        {entry.prize ?? "—"}
      </td>
    </tr>
  );
}

/** `ed` — Leaderboard preview from leaderboard payload. */
export function LeaderboardPreview({
  payload,
}: {
  payload: LeaderboardPayload | null;
}) {
  const entries = (payload?.entries ?? []).slice(0, 5);

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="h-[444px] w-full"
      contentClassName="flex h-full flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-[18px] font-medium ${TEXT}`}>Leaderboard</h2>
        <Link href="/leaderboard">
          <Button
            variant="ghost"
            theme="auto"
            size="sm"
            rightIcon={<ArrowUpRight />}
          >
            View All
          </Button>
        </Link>
      </div>

      <p className="text-[13px] leading-snug text-[#2a274e]/50 dark:text-white/50">
        Play under the FairGambling code and compete for weekly rewards. Your
        wager is combined across all partnered casinos.
      </p>

      <Watermark opacity={0.05} logoWidth={300}>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <table
            className="w-full border-separate border-spacing-0"
            style={{ minWidth: 440 }}
          >
            <thead>
              <tr className={`text-[12px] uppercase ${MUTED}`}>
                <th
                  className={`border-b ${HEAD_BORDER} py-2.5 pr-3 text-left font-medium`}
                >
                  Player
                </th>
                <th
                  className={`border-b ${HEAD_BORDER} px-3 py-2.5 text-left font-medium`}
                >
                  Wager
                </th>
                <th
                  className={`border-b ${HEAD_BORDER} px-3 py-2.5 text-left font-medium`}
                >
                  Casinos
                </th>
                <th
                  className={`border-b ${HEAD_BORDER} px-3 py-2.5 text-right font-medium`}
                >
                  Prize
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`py-6 text-center text-sm ${MUTED}`}
                  >
                    Leaderboard updating…
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <LeaderboardRow
                    key={`${entry.rank}-${entry.userId}`}
                    entry={entry}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Watermark>
    </Card>
  );
}
