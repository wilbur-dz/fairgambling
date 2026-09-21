"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarCasinoMark } from "@/components/calendar/casino-mark";
import { Countdown } from "@/components/calendar/countdown";
import { Card } from "@/components/ui/card";
import type {
  CalendarCasino,
  CalendarOccurrence,
} from "@/lib/calendar/data";
import {
  formatDateLabel,
  formatDateNumeric,
  formatMonthYear,
  formatTimeUtc,
} from "@/lib/calendar/format";
import {
  getMonthGridDays,
  getNextForFamily,
  utcDateKey,
} from "@/lib/calendar/occurrences";
import { BONUS_META } from "@/lib/calendar/data";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function metaBg(type: CalendarOccurrence["type"]) {
  const hex = BONUS_META[type].color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.16)`;
}

function OccChip({
  occ,
  trailing,
}: {
  occ: CalendarOccurrence;
  trailing?: string | null;
}) {
  const meta = BONUS_META[occ.type];
  return (
    <span
      title={`${occ.casinoName} · ${meta.label}${occ.cashback ? " · cashback" : ""}${occ.approximate ? " · approx." : ""}`}
      className="flex min-w-0 items-center gap-1.5 rounded-[4px] px-1.5 py-1"
      style={{ backgroundColor: metaBg(occ.type) }}
    >
      <CalendarCasinoMark
        name={occ.casinoName}
        isLeaderboard={occ.isLeaderboard}
        size={16}
      />
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-none text-[#2a274e] dark:text-white">
        {occ.casinoName}
      </span>
      {trailing ? (
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-[rgba(42,39,78,0.45)] dark:text-white/45">
          {trailing}
        </span>
      ) : null}
      <span className="sr-only">
        {meta.label}
        {occ.cashback ? " cashback" : ""}
      </span>
    </span>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
        checked
          ? "border-transparent bg-[#8874ff]"
          : "border-[rgba(42,39,78,0.25)] bg-transparent dark:border-white/25 dark:bg-transparent"
      }`}
    >
      {checked ? (
        <Check size={12} strokeWidth={3} className="text-white" />
      ) : null}
    </span>
  );
}

function NextOccCell({ occ }: { occ: CalendarOccurrence | null }) {
  if (!occ) {
    return (
      <span className="text-[12px] text-[rgba(42,39,78,0.3)] dark:text-white/30">
        —
      </span>
    );
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="whitespace-nowrap text-[12px] font-medium tabular-nums text-[rgba(42,39,78,0.9)] dark:text-white/90">
        {formatDateNumeric(occ.instantUtc)}
      </span>
      <Countdown
        targetMs={occ.instantUtc}
        upper
        className="whitespace-nowrap text-[10px] font-medium text-[rgba(42,39,78,0.45)] sm:text-[11px] dark:text-white/45"
      />
    </div>
  );
}

type PopPos = { left: number; top?: number; bottom?: number };

function DayCell({
  day,
  inMonth,
  isToday,
  occurrences,
}: {
  day: number;
  inMonth: boolean;
  isToday: boolean;
  occurrences: CalendarOccurrence[];
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopPos | null>(null);
  const cellRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const place = useCallback(() => {
    const el = cellRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - 224 - 8,
    );
    const height = Math.min(320, 44 + 30 * occurrences.length);
    const top = rect.bottom + 6;
    if (top + height <= window.innerHeight - 8) {
      setPos({ left, top });
    } else {
      setPos({ left, bottom: window.innerHeight - rect.top + 6 });
    }
  }, [occurrences.length]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || cellRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    let raf = 0;
    const onScroll = (e: Event) => {
      if (
        popRef.current &&
        e.target instanceof Node &&
        popRef.current.contains(e.target)
      ) {
        return;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        place();
      });
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const visible = occurrences.slice(0, 4);
  const more = occurrences.length - visible.length;
  const has = occurrences.length > 0;

  return (
    <div
      ref={cellRef}
      role={has ? "button" : undefined}
      tabIndex={has ? 0 : undefined}
      aria-expanded={has ? open : undefined}
      aria-label={
        has
          ? `Show all ${occurrences.length} bonus${occurrences.length > 1 ? "es" : ""} on day ${day}`
          : undefined
      }
      onClick={has ? () => setOpen((v) => !v) : undefined}
      onKeyDown={
        has
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((v) => !v);
              }
            }
          : undefined
      }
      className={`flex min-h-[120px] flex-col rounded-[8px] p-2 transition-colors lg:min-h-[156px] lg:p-2.5 ${
        isToday
          ? "border border-[#8874ff]/55 bg-[#8874ff]/[0.06]"
          : "border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.4] dark:border-[0.5px] dark:border-white/20 dark:bg-white/[0.01]"
      } ${inMonth ? "" : "opacity-30"} ${has ? "cursor-pointer" : ""} ${
        has && !isToday
          ? "hover:border-[rgba(42,39,78,0.3)] hover:bg-white/[0.7] dark:hover:border-white/35 dark:hover:bg-white/[0.03]"
          : ""
      }`}
    >
      <span
        className={
          isToday
            ? "flex size-[18px] items-center justify-center rounded-full bg-[#8874ff] text-[11px] font-semibold leading-none text-white lg:size-5 lg:text-[12px]"
            : "text-[12px] font-semibold leading-none text-[rgba(42,39,78,0.85)] lg:text-[13px] dark:text-white/85"
        }
      >
        {day}
      </span>
      {has ? (
        <div className="mt-3 flex min-h-0 flex-col gap-1.5 pb-1">
          {visible.map((occ, i) => (
            <OccChip
              key={`${occ.casinoId}-${occ.type}-${i}`}
              occ={occ}
            />
          ))}
          {more > 0 ? (
            <span className="self-start px-1 text-[11px] font-medium text-[rgba(42,39,78,0.45)] dark:text-white/45">
              +{more} more…
            </span>
          ) : null}
        </div>
      ) : null}
      {open && pos
        ? createPortal(
            <div
              ref={popRef}
              role="dialog"
              aria-label={`Bonuses on day ${day}`}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                bottom: pos.bottom,
                width: 224,
              }}
              className="z-[120] flex max-h-[320px] flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-[12px] border border-[#e4e4e7] bg-white p-2 shadow-[0_16px_40px_-8px_rgba(42,39,78,0.25)] [scrollbar-width:thin] dark:bg-[#161c32] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)]"
            >
              <p className="px-0.5 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                Day {day} · {occurrences.length}
              </p>
              {occurrences.map((occ, i) => (
                <OccChip
                  key={`${occ.casinoId}-${occ.type}-${i}`}
                  occ={occ}
                  trailing={formatTimeUtc(occ.instantUtc, occ.hasFixedTime)}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function DesktopGrid({
  year,
  month0,
  occurrencesByDay,
  todayKey,
}: {
  year: number;
  month0: number;
  occurrencesByDay: Map<string, CalendarOccurrence[]>;
  todayKey: string | null;
}) {
  const days = getMonthGridDays(year, month0);
  return (
    <div className="flex min-w-[640px] flex-col gap-1.5 lg:min-w-0">
      <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[12px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
        {days.map((day) => {
          const key = utcDateKey(day.dateMs);
          return (
            <DayCell
              key={key}
              day={day.day}
              inMonth={day.inMonth}
              isToday={key === todayKey}
              occurrences={occurrencesByDay.get(key) ?? []}
            />
          );
        })}
      </div>
    </div>
  );
}

function MobileGrid({
  year,
  month0,
  occurrencesByDay,
  todayKey,
}: {
  year: number;
  month0: number;
  occurrencesByDay: Map<string, CalendarOccurrence[]>;
  todayKey: string | null;
}) {
  const days = getMonthGridDays(year, month0);
  const [sheet, setSheet] = useState<{
    label: string;
    occurrences: CalendarOccurrence[];
  } | null>(null);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS_SHORT.map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = utcDateKey(day.dateMs);
            const occs = day.inMonth
              ? (occurrencesByDay.get(key) ?? [])
              : [];
            const count = occs.length;
            const has = count > 0;
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                type="button"
                disabled={!has}
                onClick={() =>
                  has &&
                  setSheet({
                    label: formatDateLabel(day.dateMs),
                    occurrences: occs,
                  })
                }
                aria-label={
                  has
                    ? `${formatDateLabel(day.dateMs)} — ${count} bonus${count > 1 ? "es" : ""}, tap to view`
                    : `${formatDateLabel(day.dateMs)} — no bonuses`
                }
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[8px] p-1 transition-colors ${
                  isToday
                    ? "border border-[#8874ff]/55 bg-[#8874ff]/[0.06]"
                    : "border-[0.5px] border-[rgba(42,39,78,0.12)] bg-white/[0.4] dark:border-white/15 dark:bg-white/[0.01]"
                } ${day.inMonth ? "" : "opacity-30"} ${has ? "" : "opacity-50"}`}
              >
                <span
                  className={
                    isToday
                      ? "flex size-5 items-center justify-center rounded-full bg-[#8874ff] text-[11px] font-semibold text-white"
                      : "text-[12px] font-semibold text-[rgba(42,39,78,0.85)] dark:text-white/85"
                  }
                >
                  {day.day}
                </span>
                {has ? (
                  <span className="flex gap-0.5">
                    {occs.slice(0, 3).map((o, i) => (
                      <span
                        key={i}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: BONUS_META[o.type].color }}
                      />
                    ))}
                    {count > 3 ? (
                      <span className="text-[9px] text-[rgba(42,39,78,0.4)]">
                        +
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      {sheet
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-4 sm:items-center"
              onClick={() => setSheet(null)}
            >
              <div
                role="dialog"
                aria-label={sheet.label}
                className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-[16px] border border-[#e4e4e7] bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#161c32]"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="mb-2 text-[12px] font-semibold text-[#2a274e] dark:text-white">
                  {sheet.label}
                </p>
                <div className="flex flex-col gap-1.5">
                  {sheet.occurrences.map((occ, i) => (
                    <OccChip
                      key={`${occ.casinoId}-${occ.type}-${i}`}
                      occ={occ}
                      trailing={formatTimeUtc(
                        occ.instantUtc,
                        occ.hasFixedTime,
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function CasinoFilter({
  casinos,
  selected,
  nowMs,
  onToggle,
  onToggleAll,
}: {
  casinos: CalendarCasino[];
  selected: Set<string>;
  nowMs: number | null;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const minuteBucket = nowMs == null ? null : Math.floor(nowMs / 6e4);
  const rows = useMemo(() => {
    if (nowMs == null || minuteBucket == null) return null;
    return casinos.map((casino) => ({
      casino,
      weekly: getNextForFamily(casino, nowMs, "weekly"),
      monthly: getNextForFamily(casino, nowMs, "monthly"),
    }));
  }, [casinos, nowMs, minuteBucket]);

  const allOn = selected.size === casinos.length;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="mb-1 flex items-center gap-2 px-2 py-2.5">
        <button
          type="button"
          onClick={onToggleAll}
          aria-pressed={allOn}
          aria-label={allOn ? "Deselect all casinos" : "Select all casinos"}
          className="flex items-center"
        >
          <CheckBox checked={allOn} />
        </button>
        <span className="w-[84px] shrink-0 text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] sm:w-[110px] dark:text-white/40">
          Casino
        </span>
        <span className="flex-1 whitespace-nowrap text-right text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
          Next Weekly
        </span>
        <span className="flex-1 whitespace-nowrap text-right text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
          Next Monthly
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {rows == null
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2.5">
                <div className="size-[18px] shrink-0 rounded-[5px] bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.06]" />
                <div className="h-7 w-[84px] shrink-0 rounded-md bg-[rgba(42,39,78,0.06)] sm:w-[110px] dark:bg-white/[0.06]" />
                <div className="h-7 flex-1 rounded-md bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04]" />
                <div className="h-7 flex-1 rounded-md bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04]" />
              </div>
            ))
          : rows.map(({ casino, weekly, monthly }, index) => {
              const on = selected.has(casino.id);
              return (
                <button
                  key={casino.id}
                  type="button"
                  onClick={() => onToggle(casino.id)}
                  aria-pressed={on}
                  aria-label={`${casino.name} — ${on ? "shown on" : "hidden from"} calendar`}
                  className={`flex items-center gap-2 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-[rgba(42,39,78,0.04)] dark:hover:bg-white/[0.04] ${
                    index % 2 === 1
                      ? "bg-[rgba(42,39,78,0.02)] dark:bg-white/[0.015]"
                      : ""
                  } ${on ? "" : "opacity-40"}`}
                >
                  <CheckBox checked={on} />
                  <span className="flex w-[84px] shrink-0 items-center gap-2 sm:w-[110px]">
                    <CalendarCasinoMark
                      name={casino.name}
                      isLeaderboard={casino.isLeaderboard}
                      size={26}
                    />
                    <span className="min-w-0 truncate text-[12px] font-medium text-[#2a274e] dark:text-white">
                      {casino.name}
                    </span>
                  </span>
                  <span className="flex flex-1 justify-end">
                    <NextOccCell occ={weekly} />
                  </span>
                  <span className="flex flex-1 justify-end">
                    <NextOccCell occ={monthly} />
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
}

type MonthCalendarProps = {
  year: number;
  month0: number;
  occurrencesByDay: Map<string, CalendarOccurrence[]>;
  casinos: CalendarCasino[];
  selected: Set<string>;
  nowMs: number | null;
  todayKey: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleCasino: (id: string) => void;
  onToggleAll: () => void;
};

/** Month grid + casino filter sidebar. */
export function MonthCalendar({
  year,
  month0,
  occurrencesByDay,
  casinos,
  selected,
  nowMs,
  todayKey,
  onPrevMonth,
  onNextMonth,
  onToggleCasino,
  onToggleAll,
}: MonthCalendarProps) {
  return (
    <Card variant="panel" blur padded={false} className="p-4 lg:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-semibold text-[#2a274e] dark:text-white">
            {formatMonthYear(year, month0)}
          </h2>
          <div className="nd-gradient-border-auto relative inline-flex items-center rounded-full p-1 backdrop-blur-[35.5px] dark:bg-white/[0.01]">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label="Previous month"
              className="flex size-7 items-center justify-center rounded-full text-[rgba(42,39,78,0.5)] transition-colors hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label="Next month"
              className="flex size-7 items-center justify-center rounded-full text-[rgba(42,39,78,0.5)] transition-colors hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
        <div className="min-w-0 flex-1 lg:hidden">
          <MobileGrid
            year={year}
            month0={month0}
            occurrencesByDay={occurrencesByDay}
            todayKey={todayKey}
          />
        </div>
        <div className="hidden min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin] lg:block">
          <DesktopGrid
            year={year}
            month0={month0}
            occurrencesByDay={occurrencesByDay}
            todayKey={todayKey}
          />
        </div>
        <div className="shrink-0 lg:relative lg:w-[349px]">
          <div className="lg:absolute lg:inset-0 lg:flex lg:flex-col">
            <CasinoFilter
              casinos={casinos}
              selected={selected}
              nowMs={nowMs}
              onToggle={onToggleCasino}
              onToggleAll={onToggleAll}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
