"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import {
  CasinoTag,
  DegenBadge,
  LanguageFlag,
  LiveBadge,
  MoneyTypeBadge,
  StreamerAvatarLink,
} from "@/components/streamers/shared";
import {
  TABLE_CELL_CLASS,
  MOBILE_CELL_CLASS,
  MOBILE_STICKY_RANK,
  MOBILE_STICKY_NAME,
  MOBILE_STICKY_BG,
} from "@/lib/streamers/leaderboard-config";
import { formatMarketValue, mvOf, streamerHref } from "@/lib/streamers/data";
import type { StreamerRecord } from "@/lib/streamers/types";
import {
  formatCompactNumber,
  formatRelativeLastLive,
  marketValueHue,
  paymentBadgeStyle,
} from "@/lib/streamers/view-format";

type RowProps = { streamer: StreamerRecord; rank: number };

export function LeaderboardMobileRow({ streamer, rank }: RowProps) {
  const router = useRouter();
  const mv = mvOf(streamer);

  return (
    <tr
      onClick={() => router.push(streamerHref(streamer.username))}
      className="cursor-pointer transition-colors active:bg-white/[0.5] dark:bg-white/[0.03]"
    >
      <td
        className={`${MOBILE_CELL_CLASS} ${MOBILE_STICKY_RANK} ${MOBILE_STICKY_BG} text-[rgba(42,39,78,0.4)] dark:text-white/35`}
      >
        {rank}
      </td>
      <td className={`${MOBILE_CELL_CLASS} ${MOBILE_STICKY_NAME} ${MOBILE_STICKY_BG}`}>
        <Link
          href={streamerHref(streamer.username)}
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <StreamerAvatarLink
            name={streamer.username}
            src={streamer.avatarUrl}
            size={32}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[12.5px] font-medium text-[#2a274e] dark:text-white">
              {streamer.username}
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              {streamer.live ? (
                <LiveBadge viewers={streamer.liveViewers} />
              ) : (
                <span className="font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30">
                  OFFLINE
                </span>
              )}
            </span>
          </span>
        </Link>
      </td>
      <td className={`${MOBILE_CELL_CLASS} text-right`}>
        {mv ? (
          <span
            className="text-[13.5px] font-bold"
            style={{ color: marketValueHue(mv) }}
          >
            {formatMarketValue(mv)}
          </span>
        ) : (
          <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">—</span>
        )}
      </td>
      <td className={`${MOBILE_CELL_CLASS} text-right`}>
        {streamer.estMonthlyPayment ? (
          <span className="font-semibold text-[#4ad17d]">
            {streamer.estMonthlyPayment}
          </span>
        ) : (
          <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">—</span>
        )}
      </td>
      <td className={`${MOBILE_CELL_CLASS} overflow-hidden`}>
        <CasinoTag
          name={streamer.currentCasino}
          size={20}
          className="text-[11.5px] text-[rgba(42,39,78,0.8)] dark:text-white/80"
        />
      </td>
      <td
        className={`${MOBILE_CELL_CLASS} text-right ${
          streamer.followers > 0
            ? "font-semibold text-[#2a274e] dark:text-white"
            : "text-[rgba(42,39,78,0.3)] dark:text-white/30"
        }`}
      >
        {streamer.followers > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Users size={11} className="text-[rgba(42,39,78,0.4)] dark:text-white/35" />
            {formatCompactNumber(streamer.followers)}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className={`${MOBILE_CELL_CLASS} text-right text-[rgba(42,39,78,0.8)] dark:text-white/80`}>
        {streamer.avgViewers30d > 0 ? formatCompactNumber(streamer.avgViewers30d) : "—"}
      </td>
      <td
        className={`${MOBILE_CELL_CLASS} ${
          streamer.live
            ? "font-medium text-[#3ddc97]"
            : "text-[rgba(42,39,78,0.6)] dark:text-white/60"
        }`}
        suppressHydrationWarning
      >
        {streamer.live
          ? "now"
          : streamer.lastStreamed
            ? formatRelativeLastLive(streamer.lastStreamed)
            : "—"}
      </td>
    </tr>
  );
}

export function LeaderboardDesktopRow({ streamer, rank }: RowProps) {
  const router = useRouter();
  const mv = mvOf(streamer);
  const paymentStyle = streamer.estMonthlyPayment
    ? paymentBadgeStyle(streamer.estMonthlyPayment)
    : null;

  return (
    <tr
      onClick={() => router.push(streamerHref(streamer.username))}
      className="cursor-pointer transition-colors hover:bg-[rgba(42,39,78,0.03)] dark:hover:bg-white/[0.03]"
    >
      <td className={`${TABLE_CELL_CLASS} text-[rgba(42,39,78,0.4)] dark:text-white/35`}>
        {rank}
      </td>
      <td className={`${TABLE_CELL_CLASS} overflow-hidden`}>
        <Link
          href={streamerHref(streamer.username)}
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <StreamerAvatarLink
            name={streamer.username}
            src={streamer.avatarUrl}
            size={32}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[12px] font-medium text-[#2a274e] dark:text-white">
              {streamer.username}
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              {streamer.live ? (
                <LiveBadge viewers={streamer.liveViewers} />
              ) : (
                <span className="font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30">
                  OFFLINE
                </span>
              )}
            </span>
          </span>
        </Link>
      </td>
      <td className={TABLE_CELL_CLASS}>
        <span className="flex justify-center">
          {streamer.imageUrl ? (
            <img
              src={streamer.imageUrl}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-[rgba(42,39,78,0.1)] dark:ring-white/10"
            />
          ) : (
            <span className="text-[rgba(42,39,78,0.2)] dark:text-white/20">—</span>
          )}
        </span>
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right`}>
        {mv ? (
          <span
            className="text-[14px] font-bold"
            style={{ color: marketValueHue(mv) }}
          >
            {formatMarketValue(mv)}
          </span>
        ) : (
          <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">—</span>
        )}
      </td>
      <td className={TABLE_CELL_CLASS}>
        <LanguageFlag lang={streamer.language} title={streamer.language ?? undefined} />
      </td>
      <td className={`${TABLE_CELL_CLASS} overflow-hidden`}>
        <CasinoTag
          name={streamer.currentCasino}
          size={24}
          className="text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80"
        />
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right`}>
        {streamer.estMonthlyPayment && paymentStyle ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold"
            style={paymentStyle}
          >
            {streamer.estMonthlyPayment}
          </span>
        ) : (
          <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">—</span>
        )}
      </td>
      <td className={TABLE_CELL_CLASS}>
        <DegenBadge level={streamer.degen} />
      </td>
      <td className={TABLE_CELL_CLASS}>
        <MoneyTypeBadge value={streamer.rawFake} size={12} />
      </td>
      <td
        className={`${TABLE_CELL_CLASS} text-right text-[12px] ${
          streamer.followers > 0
            ? "font-semibold text-[#2a274e] dark:text-white"
            : "text-[rgba(42,39,78,0.3)] dark:text-white/30"
        }`}
      >
        {streamer.followers > 0 ? formatCompactNumber(streamer.followers) : "—"}
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80`}>
        {streamer.avgViewers30d > 0 ? formatCompactNumber(streamer.avgViewers30d) : "—"}
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80`}>
        {streamer.hoursWatched30d > 0
          ? `${formatCompactNumber(streamer.hoursWatched30d)} hrs`
          : "—"}
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80`}>
        {streamer.streamHours30d && streamer.streamHours30d > 0
          ? `${formatCompactNumber(streamer.streamHours30d)} hrs`
          : "—"}
      </td>
      <td
        className={`${TABLE_CELL_CLASS} text-[12px] ${
          streamer.live
            ? "font-medium text-[#3ddc97]"
            : "text-[rgba(42,39,78,0.6)] dark:text-white/60"
        }`}
        suppressHydrationWarning
      >
        {streamer.live
          ? "now"
          : streamer.lastStreamed
            ? formatRelativeLastLive(streamer.lastStreamed)
            : "—"}
      </td>
      <td className={`${TABLE_CELL_CLASS} text-right text-[12px]`}>
        {streamer.monthlyLeaderboardUsd && streamer.monthlyLeaderboardUsd > 0 ? (
          <span className="font-semibold text-[#e8b33c]">
            {formatMarketValue(streamer.monthlyLeaderboardUsd)} / mo
          </span>
        ) : (
          <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">—</span>
        )}
      </td>
    </tr>
  );
}
