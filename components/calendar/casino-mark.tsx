"use client";

import Image from "next/image";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";

/** Casino mark used on calendar chips — FG icon for leaderboard. */
export function CalendarCasinoMark({
  name,
  isLeaderboard,
  size = 26,
  className = "",
}: {
  name: string;
  isLeaderboard?: boolean;
  size?: number;
  className?: string;
}) {
  if (isLeaderboard) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Image
          src="/icons/fg-icon.svg"
          alt=""
          width={size}
          height={Math.round((62 * size) / 68)}
          style={{ height: "auto" }}
        />
      </span>
    );
  }

  return (
    <AnalyticsCasinoIcon casinoName={name} size={size} className={className} />
  );
}
