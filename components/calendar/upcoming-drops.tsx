"use client";

import { useEffect, useState } from "react";
import { CalendarCasinoMark } from "@/components/calendar/casino-mark";
import { Countdown } from "@/components/calendar/countdown";
import {
  BONUS_META,
  MONTHLY_INTERVAL_MS,
  type CalendarOccurrence,
} from "@/lib/calendar/data";
import { formatDateLabel } from "@/lib/calendar/format";

function ProgressBar({
  targetMs,
  intervalMs,
}: {
  targetMs: number;
  intervalMs: number;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = 100 * Math.max(0, Math.min(1, 1 - (targetMs - now) / intervalMs));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10">
      <div
        className="h-full rounded-full bg-[#8874ff] transition-[width] duration-1000"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Next 4 upcoming bonus drop cards. */
export function UpcomingDrops({ drops }: { drops: CalendarOccurrence[] | null }) {
  if (drops == null) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[150px] animate-pulse rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 dark:border-[0.5px] dark:border-white/20 dark:bg-white/[0.02]"
          />
        ))}
      </div>
    );
  }

  if (drops.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 backdrop-blur-[35.5px] dark:border-[0.5px] dark:border-white/20 dark:bg-white/[0.01]">
        <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
          No upcoming bonus drops — select at least one casino below.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {drops.map((drop, index) => {
        const meta = BONUS_META[drop.type];
        const title = drop.isLeaderboard
          ? `${drop.casinoName} Weekly`
          : `${drop.casinoName} ${meta.label}`;
        const subtitle = drop.isLeaderboard
          ? "Weekly Reset"
          : `${meta.label} Bonus`;
        const intervalMs =
          drop.type === "weekly" ? 6048e5 : MONTHLY_INTERVAL_MS;

        return (
          <div
            key={`${drop.casinoId}-${drop.type}-${index}`}
            className="flex flex-col gap-4 rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 p-4 backdrop-blur-[35.5px] dark:border-[0.5px] dark:border-white/20 dark:bg-white/[0.01]"
          >
            <div className="flex items-center gap-3">
              <CalendarCasinoMark
                name={drop.casinoName}
                isLeaderboard={drop.isLeaderboard}
                size={26}
              />
              <div className="flex min-w-0 flex-col justify-center gap-0.5">
                <span className="truncate text-[16px] font-semibold leading-none text-[#2a274e] dark:text-white">
                  {title}
                </span>
                <span className="truncate text-[12px] leading-tight text-[rgba(42,39,78,0.4)] dark:text-white/30">
                  {subtitle} · {formatDateLabel(drop.instantUtc)}
                </span>
              </div>
            </div>
            <Countdown
              targetMs={drop.instantUtc}
              className="block text-[24px] font-semibold leading-none text-[#2a274e] dark:text-white"
            />
            <ProgressBar targetMs={drop.instantUtc} intervalMs={intervalMs} />
          </div>
        );
      })}
    </div>
  );
}
