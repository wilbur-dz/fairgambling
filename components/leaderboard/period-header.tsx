"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LEADERBOARD_BIWEEKLY_ANCHOR,
  LEADERBOARD_PERIOD,
} from "@/lib/leaderboard/data";

type PeriodKey = "daily" | "weekly" | "biweekly" | "monthly";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const UNITS: { key: keyof CountdownParts; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function nextPeriodEnd(period: PeriodKey, now: Date): Date {
  if (period === "daily") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
  }
  if (period === "weekly") {
    const day = now.getUTCDay();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + (day === 0 ? 1 : 8 - day),
      ),
    );
  }
  if (period === "biweekly") {
    const weeks = Math.floor(
      (now.getTime() - LEADERBOARD_BIWEEKLY_ANCHOR.getTime()) / 604_800_000,
    );
    return new Date(
      LEADERBOARD_BIWEEKLY_ANCHOR.getTime() + (weeks + 1) * 604_800_000,
    );
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function computeCountdown(period: PeriodKey): CountdownParts {
  const now = new Date();
  const totalSeconds = Math.floor(
    Math.max(0, nextPeriodEnd(period, now).getTime() - now.getTime()) / 1000,
  );
  const days = Math.floor(totalSeconds / 86400);
  return {
    days,
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function PeriodCountdown({ period }: { period: PeriodKey }) {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setParts(computeCountdown(period));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [period]);

  const value = parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div
      role="timer"
      aria-label={`Period ends in ${value.days} days ${value.hours} hours ${value.minutes} minutes ${value.seconds} seconds`}
      className="relative flex h-12 w-full min-w-0 items-center justify-between rounded-[14px] border border-[#e4e4e7] bg-[#e4e4e7]/30 p-[3px] sm:w-[320px] lg:h-14 lg:w-[360px] dark:border-0 dark:bg-white/[0.02]"
    >
      {UNITS.map((unit, index) => (
        <div key={unit.key} className="flex flex-1 items-center">
          {index > 0 ? (
            <div className="h-7 w-px shrink-0 bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />
          ) : null}
          <div className="flex flex-1 flex-col items-center justify-center gap-1 sm:gap-1.5">
            <span className="text-sm font-semibold leading-none tabular-nums text-[#2a274e] sm:text-base dark:text-white">
              {value[unit.key]}
            </span>
            <span className="text-[9px] font-medium leading-none text-[rgba(42,39,78,0.5)] sm:text-[11px] dark:text-white/50">
              {unit.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Period title card + live countdown timer. */
export function PeriodHeader() {
  return (
    <Card variant="panel" padded={false} className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#2a274e] sm:text-base dark:text-white">
            FairGambling Rewards Leaderboard
          </h3>
          <p className="mt-1 text-xs text-[rgba(42,39,78,0.55)] sm:text-sm dark:text-white/50">
            Play under our code on any casino and compete for cross-site
            rewards. Unlike single-casino leaderboards, your wager is combined
            across all partnered casinos.
          </p>
        </div>
        <div className="shrink-0">
          <PeriodCountdown period={LEADERBOARD_PERIOD} />
        </div>
      </div>
    </Card>
  );
}
