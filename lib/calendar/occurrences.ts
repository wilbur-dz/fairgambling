import {
  INCLUDED_CASINOS,
  PRIORITY_CASINO_IDS,
  type BonusFamily,
  type CalendarCasino,
  type CalendarOccurrence,
  type MonthDay,
  type Recurrence,
} from "@/lib/calendar/data";

function daysInMonth(year: number, month0: number) {
  return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
}

function utcDateKey(ms: number) {
  const d = new Date(ms);
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${m}-${day}`;
}

function priorityIndex(casinoId: string) {
  const i = PRIORITY_CASINO_IDS.indexOf(
    casinoId as (typeof PRIORITY_CASINO_IDS)[number],
  );
  return i >= 0 ? i : PRIORITY_CASINO_IDS.length;
}

function toOccurrence(
  casino: CalendarCasino,
  rule: CalendarCasino["rules"][number],
  instantUtc: number,
): CalendarOccurrence {
  return {
    casinoId: casino.id,
    casinoName: casino.name,
    slug: casino.slug,
    type: rule.type,
    instantUtc,
    hasFixedTime: rule.hasFixedTime,
    cashback: rule.cashback,
    approximate: rule.approximate,
    isLeaderboard: !!casino.isLeaderboard,
  };
}

function resolveMonthDay(
  recurrence: Recurrence,
  year: number,
  month0: number,
): number | null {
  switch (recurrence.kind) {
    case "monthly_day":
      return Math.min(recurrence.day, daysInMonth(year, month0));
    case "monthly_last_day":
      return daysInMonth(year, month0);
    case "monthly_nth_weekday": {
      const { nth, weekday } = recurrence;
      if (nth === -1) {
        const last = daysInMonth(year, month0);
        const lastDow = new Date(Date.UTC(year, month0, last)).getUTCDay();
        return last - ((lastDow - weekday + 7) % 7);
      }
      const first = 1 + ((weekday - new Date(Date.UTC(year, month0, 1)).getUTCDay() + 7) % 7) + (nth - 1) * 7;
      return first > daysInMonth(year, month0) ? null : first;
    }
    default:
      return null;
  }
}

function compareOcc(a: CalendarOccurrence, b: CalendarOccurrence) {
  if (a.instantUtc !== b.instantUtc) return a.instantUtc - b.instantUtc;
  const pa = priorityIndex(a.casinoId);
  const pb = priorityIndex(b.casinoId);
  if (pa !== pb) return pa - pb;
  if (a.casinoName !== b.casinoName)
    return a.casinoName.localeCompare(b.casinoName);
  return a.type.localeCompare(b.type);
}

export type OccurrenceFilter = {
  casinoIds?: Set<string>;
  family?: "weekly" | "monthly";
  includeExperimental?: boolean;
};

/** Port of reference occurrence generator `b`. */
export function getOccurrences(
  casinos: CalendarCasino[],
  fromMs: number,
  toMs: number,
  filter: OccurrenceFilter = {},
): CalendarOccurrence[] {
  const out: CalendarOccurrence[] = [];
  const from = new Date(fromMs);
  const to = new Date(toMs);
  const fromDay = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  );
  const toDay = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());

  for (const casino of casinos) {
    if (!casino.includedInCalendar) continue;
    if (filter.casinoIds && !filter.casinoIds.has(casino.id)) continue;

    for (const rule of casino.rules) {
      if (!rule.recurrence) continue;
      if (rule.experimental && !filter.includeExperimental) continue;
      if (filter.family === "weekly" && rule.type !== "weekly") continue;
      if (filter.family === "monthly" && rule.type === "weekly") continue;

      const hour = rule.hasFixedTime ? rule.hour : 0;
      const minute = rule.hasFixedTime ? rule.minute : 0;
      const rec = rule.recurrence;

      if (rec.kind === "weekly") {
        for (let day = fromDay; day <= toDay; day += 864e5) {
          const d = new Date(day);
          if (d.getUTCDay() !== rec.weekday) continue;
          const instant = Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            hour,
            minute,
          );
          if (instant >= fromMs && instant <= toMs) {
            out.push(toOccurrence(casino, rule, instant));
          }
        }
      } else {
        let y = from.getUTCFullYear();
        let m = from.getUTCMonth();
        const endY = to.getUTCFullYear();
        const endM = to.getUTCMonth();
        while (y < endY || (y === endY && m <= endM)) {
          const day = resolveMonthDay(rec, y, m);
          if (day != null) {
            const instant = Date.UTC(y, m, day, hour, minute);
            if (instant >= fromMs && instant <= toMs) {
              out.push(toOccurrence(casino, rule, instant));
            }
          }
          m += 1;
          if (m > 11) {
            m = 0;
            y += 1;
          }
        }
      }
    }
  }

  return out.sort(compareOcc);
}

/** Monday-start month grid covering the visible calendar. */
export function getMonthGridDays(year: number, month0: number): MonthDay[] {
  const firstDow = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const start = Date.UTC(year, month0, 1) - ((firstDow + 6) % 7) * 864e5;
  const lastDay = daysInMonth(year, month0);
  const lastDow = new Date(Date.UTC(year, month0, lastDay)).getUTCDay();
  const end = Date.UTC(year, month0, lastDay) + ((7 - lastDow) % 7) * 864e5;
  const days: MonthDay[] = [];
  for (let ms = start; ms <= end; ms += 864e5) {
    const d = new Date(ms);
    days.push({
      year: d.getUTCFullYear(),
      month0: d.getUTCMonth(),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month0,
      dateMs: ms,
    });
  }
  return days;
}

export function getGridOccurrences(
  casinos: CalendarCasino[],
  year: number,
  month0: number,
  filter: OccurrenceFilter = {},
) {
  const days = getMonthGridDays(year, month0);
  const from = days[0].dateMs;
  const to = days[days.length - 1].dateMs + 0x5265bff;
  const list = getOccurrences(casinos, from, to, filter);
  const map = new Map<string, CalendarOccurrence[]>();
  for (const occ of list) {
    const key = utcDateKey(occ.instantUtc);
    const arr = map.get(key);
    if (arr) arr.push(occ);
    else map.set(key, [occ]);
  }
  return map;
}

export function getNextOccurrences(
  casinos: CalendarCasino[],
  nowMs: number,
  limit: number,
  filter: OccurrenceFilter = {},
) {
  return getOccurrences(casinos, nowMs, nowMs + 648e7, filter)
    .filter((o) => o.instantUtc >= nowMs)
    .slice(0, limit);
}

export function getNextForFamily(
  casino: CalendarCasino,
  nowMs: number,
  family: "weekly" | "monthly",
) {
  return (
    getOccurrences([casino], nowMs, nowMs + 648e7, { family }).find(
      (o) => o.instantUtc >= nowMs,
    ) ?? null
  );
}

export function localDateKey(ms: number) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export { utcDateKey, INCLUDED_CASINOS };
export type { BonusFamily };
