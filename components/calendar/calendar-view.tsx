"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BonusLegend } from "@/components/calendar/bonus-legend";
import { BonusPayouts } from "@/components/calendar/bonus-payouts";
import { MonthCalendar } from "@/components/calendar/month-calendar";
import { UpcomingDrops } from "@/components/calendar/upcoming-drops";
import { Card } from "@/components/ui/card";
import {
  INCLUDED_CASINOS,
  type PayoutsPayload,
} from "@/lib/calendar/data";
import {
  getGridOccurrences,
  getNextOccurrences,
  localDateKey,
} from "@/lib/calendar/occurrences";

const ALL_IDS = INCLUDED_CASINOS.map((c) => c.id);

function shiftMonth(
  cursor: { year: number; month0: number },
  delta: number,
) {
  let month0 = cursor.month0 + delta;
  let year = cursor.year;
  while (month0 < 0) {
    month0 += 12;
    year -= 1;
  }
  while (month0 > 11) {
    month0 -= 12;
    year += 1;
  }
  return { year, month0 };
}

export type CalendarViewProps = {
  payouts: PayoutsPayload | null;
};

/**
 * Bonus Calendar — main content from mock/6.
 * Schedule from static INCLUDED_CASINOS; payouts from bonus-payouts API.
 */
export function CalendarView({ payouts }: CalendarViewProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [cursor, setCursor] = useState<{
    year: number;
    month0: number;
  } | null>(null);
  const [selected, setSelected] = useState(() => new Set(ALL_IDS));

  useEffect(() => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month0: d.getMonth() });
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const occurrencesByDay = useMemo(
    () =>
      cursor
        ? getGridOccurrences(INCLUDED_CASINOS, cursor.year, cursor.month0, {
            casinoIds: selected,
          })
        : new Map(),
    [cursor, selected],
  );

  const drops = useMemo(
    () =>
      nowMs == null
        ? null
        : getNextOccurrences(INCLUDED_CASINOS, nowMs, 4, {
            casinoIds: selected,
          }),
    [nowMs, selected],
  );

  const todayKey = nowMs == null ? null : localDateKey(nowMs);

  const onPrevMonth = useCallback(
    () => setCursor((c) => (c ? shiftMonth(c, -1) : c)),
    [],
  );
  const onNextMonth = useCallback(
    () => setCursor((c) => (c ? shiftMonth(c, 1) : c)),
    [],
  );
  const onToggleCasino = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const onToggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === ALL_IDS.length ? new Set() : new Set(ALL_IDS),
    );
  }, []);

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <UpcomingDrops drops={drops} />
      {cursor ? (
        <MonthCalendar
          year={cursor.year}
          month0={cursor.month0}
          occurrencesByDay={occurrencesByDay}
          casinos={INCLUDED_CASINOS}
          selected={selected}
          nowMs={nowMs}
          todayKey={todayKey}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onToggleCasino={onToggleCasino}
          onToggleAll={onToggleAll}
        />
      ) : (
        <Card variant="panel" blur className="h-[680px] animate-pulse" />
      )}
      <BonusLegend className="px-1" />
      <BonusPayouts data={payouts} />
    </main>
  );
}
