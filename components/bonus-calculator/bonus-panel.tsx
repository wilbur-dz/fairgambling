"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  FieldLabel,
  NumberStepper,
} from "@/components/bonus-calculator/field";
import { Card } from "@/components/ui/card";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { Dropdown } from "@/components/ui/dropdown";
import { Tabs } from "@/components/ui/tabs";
import { estimateBonus, formatUsd } from "@/lib/bonus-calculator/calc";
import {
  buildBonusCasinoOptions,
  GAME_TYPE_TABS,
  getBonusRates,
  PERIOD_TABS,
  type BonusPeriod,
  type GameType,
  type ProfitLoss,
} from "@/lib/bonus-calculator/data";
import type { CodeCasino } from "@/lib/livecodes/data";

function ResultRow({
  label,
  usd,
  tone,
  toneClassName = "",
  muted,
  note,
}: {
  label: string;
  usd: number;
  tone: string;
  toneClassName?: string;
  muted?: boolean;
  note?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(42,39,78,0.1)] bg-white/[0.5] px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.02] ${toneClassName} ${muted ? "opacity-50" : ""}`}
    >
      <div className="flex flex-col">
        <span className="text-[14px] text-[#2a274e] dark:text-white">
          {label}
        </span>
        {note ? (
          <span className="text-[12px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
            {note}
          </span>
        ) : null}
      </div>
      <span className="text-[22px] font-semibold" style={{ color: tone }}>
        {formatUsd(usd)}
      </span>
    </div>
  );
}

/** Bonus Calculator panel — casino list from `/api/casinos`, rates static. */
export function BonusCalculatorPanel({
  casinos,
}: {
  casinos: CodeCasino[];
}) {
  const casinoOptions = useMemo(
    () => buildBonusCasinoOptions(casinos),
    [casinos],
  );
  const defaultSlug =
    casinoOptions.find((c) => c.slug === "stake")?.slug ??
    casinoOptions[0]?.slug ??
    "stake";

  const [casino, setCasino] = useState(defaultSlug);
  const [period, setPeriod] = useState<BonusPeriod>("weekly");
  const [gameType, setGameType] = useState<GameType>("slots");
  const [wager, setWager] = useState("");
  const [profitLoss, setProfitLoss] = useState<ProfitLoss>("profit");
  const [netLoss, setNetLoss] = useState("");

  const options = useMemo(
    () => casinoOptions.map((c) => ({ value: c.slug, label: c.name })),
    [casinoOptions],
  );

  const selectedName =
    casinoOptions.find((c) => c.slug === casino)?.name ?? casino;
  const rates = getBonusRates(casino, selectedName);
  const periodTabs = PERIOD_TABS.filter((t) =>
    t.id === "weekly" ? rates.hasWeekly !== false : rates.hasMonthly !== false,
  );
  const activePeriod = periodTabs.some((t) => t.id === period)
    ? period
    : ((periodTabs[0]?.id as BonusPeriod) ?? "weekly");

  const estimate = estimateBonus({
    casinoSlug: casino,
    period: activePeriod,
    gameType,
    wager: parseFloat(wager) || 0,
    profitLoss,
    netLoss: parseFloat(netLoss) || 0,
  });

  const isLoss = profitLoss === "loss";
  const btnBase =
    "flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[100px] border px-4 text-[14px] font-light transition-colors";

  return (
    <Card
      variant="glass"
      padded={false}
      className="light-element dark-glass-element relative"
    >
      <div className="contents">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-80px] top-1/2 hidden h-[344px] w-[465px] -translate-y-1/2 bg-[linear-gradient(to_bottom,rgba(209,213,219,0.5),rgba(156,163,175,0.5))] blur-[90px] lg:block dark:bg-[linear-gradient(to_bottom,rgba(81,5,161,0.5),rgba(52,0,107,0.5))]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-0 h-[200px] bg-[linear-gradient(to_bottom,rgba(209,213,219,0.4),rgba(156,163,175,0.4))] blur-[90px] lg:hidden dark:bg-[linear-gradient(to_bottom,rgba(81,5,161,0.4),rgba(52,0,107,0.4))]"
        />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col gap-5 p-4 md:gap-6 md:p-6">
          <FieldLabel label="Select Casino">
            <Dropdown
              theme="auto"
              block
              size="md"
              sizeConfig={{ radius: 22, paddingY: 9.5, iconSize: 16 }}
              options={options}
              value={casino}
              onChange={setCasino}
              searchable
              renderIcon={(slug, size) => (
                <span
                  className="flex shrink-0 items-center justify-center overflow-hidden rounded-[7px]"
                  style={{ width: size, height: size }}
                >
                  <CasinoLogo
                    slug={slug}
                    name={
                      casinoOptions.find((c) => c.slug === slug)?.name ?? slug
                    }
                    size={size}
                    withBg
                    className="h-full w-full object-contain"
                  />
                </span>
              )}
            />
          </FieldLabel>

          <FieldLabel label="Bonus Period" labelSize={12}>
            <Tabs
              theme="auto"
              tabs={[...periodTabs]}
              activeId={activePeriod}
              onChange={(id) => setPeriod(id as BonusPeriod)}
              liquid={false}
              sizeConfig={{ fontSize: 14, paddingX: 16, paddingY: 8 }}
              fill
              className="w-full self-stretch md:w-auto md:self-start"
            />
          </FieldLabel>

          <FieldLabel label="Game Type" labelSize={12}>
            <Tabs
              theme="auto"
              tabs={[...GAME_TYPE_TABS]}
              activeId={gameType}
              onChange={(id) => setGameType(id as GameType)}
              liquid={false}
              sizeConfig={{ fontSize: 14, paddingX: 16, paddingY: 8 }}
              fill
              className="w-full self-stretch md:w-auto md:self-start"
            />
          </FieldLabel>

          <FieldLabel label="Your Wager ($)">
            <NumberStepper
              value={wager}
              onChange={setWager}
              ariaLabel="Your wager"
              placeholder="Enter total wager amount"
              step={100}
            />
          </FieldLabel>

          <FieldLabel label="Profit / Loss">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={profitLoss === "profit"}
                  onClick={() => setProfitLoss("profit")}
                  className={`${btnBase} ${
                    profitLoss === "profit"
                      ? "border-[#1f9d57] bg-[rgba(51,224,128,0.08)] text-[#1f9d57] dark:border-[#00ff86] dark:bg-[rgba(51,224,128,0.04)] dark:text-[#00ff86]"
                      : "border-[rgba(42,39,78,0.12)] bg-white/[0.5] text-[rgba(42,39,78,0.5)] hover:text-[rgba(42,39,78,0.8)] dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50 dark:hover:text-white/80"
                  }`}
                >
                  <ArrowUpRight size={16} className="shrink-0" />
                  Profit
                </button>
                <button
                  type="button"
                  aria-pressed={isLoss}
                  onClick={() => setProfitLoss("loss")}
                  className={`${btnBase} ${
                    isLoss
                      ? "border-[#dc2626] bg-[rgba(240,89,89,0.08)] text-[#dc2626] dark:border-[#f05959] dark:bg-[rgba(240,89,89,0.06)] dark:text-[#f05959]"
                      : "border-[rgba(42,39,78,0.12)] bg-white/[0.5] text-[rgba(42,39,78,0.5)] hover:text-[rgba(42,39,78,0.8)] dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50 dark:hover:text-white/80"
                  }`}
                >
                  <ArrowDownRight size={16} className="shrink-0" />
                  Loss
                </button>
              </div>
              {isLoss ? (
                <NumberStepper
                  value={netLoss}
                  onChange={setNetLoss}
                  ariaLabel="Net loss amount"
                  placeholder="Enter your net loss ($)"
                  step={100}
                />
              ) : null}
            </div>
          </FieldLabel>
        </div>

        <div className="flex flex-col justify-center gap-3 p-4 md:p-6">
          <ResultRow
            label={`${activePeriod === "weekly" ? "Weekly" : "Monthly"} Rakeback`}
            usd={estimate.rakeback}
            tone="var(--nd-profit)"
          />
          <ResultRow
            label={`${activePeriod === "weekly" ? "Weekly" : "Monthly"} Lossback`}
            usd={estimate.lossback}
            tone="var(--bonus-lossback)"
            toneClassName="[--bonus-lossback:#b47316] dark:[--bonus-lossback:#f5b83d]"
            muted={!isLoss}
            note={isLoss ? undefined : "Only paid on a loss"}
          />
        </div>
      </div>

      <div className="relative p-4 pt-0 md:p-6 md:pt-0">
        <div className="flex items-center justify-between gap-2 rounded-[22px] border border-[rgba(42,39,78,0.1)] bg-white/[0.5] px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <span className="text-[14px] text-[#2a274e] dark:text-white">
            Estimated {isLoss ? "Rakeback + Lossback" : "Rakeback"}
          </span>
          <span className="text-[24px] font-semibold text-[#1f9d57] dark:text-[#00ff86]">
            {formatUsd(estimate.estimated)}
          </span>
        </div>
      </div>
    </Card>
  );
}
