"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BreakdownRow,
  Panel,
  SectionHeader,
} from "@/components/affiliate/chrome";
import { Tabs } from "@/components/ui/tabs";
import { CALC_CONFIGS, calcEarnings } from "@/lib/affiliate/data";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

const CONFIGS = CALC_CONFIGS.filter(
  (c) => c.slug !== "cybet" && c.slug !== "flush",
);

const WAGER_PRESETS = [5000, 10_000, 500_000, 1_000_000];

/** Port of reference `WagerShareCalculator`. */
export function WagerShareCalculator() {
  const labelClass =
    "mb-2 block text-[13px] font-medium text-[#2a274e] dark:text-white";
  const [slug, setSlug] = useState(CONFIGS[0]?.slug ?? "stake");
  const [gameIndex, setGameIndex] = useState(0);
  const [wager, setWager] = useState(10_000);

  const config = CONFIGS.find((c) => c.slug === slug) ?? CONFIGS[0]!;
  const game = config.gameTypes[gameIndex] ?? config.gameTypes[0]!;
  const earnings = calcEarnings(wager, config, gameIndex);
  const logos = getCasinoLogoPair(config.slug);

  return (
    <Panel contentClassName="flex flex-col gap-6">
      <SectionHeader title="Rewards Calculator" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1px_1fr] lg:gap-6">
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Casino</label>
            <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4">
              {CONFIGS.map((c) => {
                const pair = getCasinoLogoPair(c.slug);
                const active = c.slug === slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    title={c.name}
                    onClick={() => {
                      setSlug(c.slug);
                      setGameIndex(0);
                    }}
                    className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] border-[0.5px] backdrop-blur-[20px] transition-all ${
                      active
                        ? "border-[#8874ff]/50 bg-[rgba(142,142,255,0.14)] shadow-[0_0_12px_rgba(136,116,255,0.25)]"
                        : "border-[rgba(42,39,78,0.12)] bg-[rgba(42,39,78,0.03)] hover:bg-[rgba(42,39,78,0.06)] dark:border-white/15 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    {pair ? (
                      <>
                        <Image
                          src={pair.light}
                          alt={c.name}
                          width={20}
                          height={20}
                          className="size-5 object-contain dark:hidden"
                        />
                        <Image
                          src={pair.dark}
                          alt=""
                          width={20}
                          height={20}
                          className="hidden size-5 object-contain dark:block"
                        />
                      </>
                    ) : (
                      <span className="text-xs font-bold text-[#2a274e]/60 dark:text-white/60">
                        {c.name[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelClass}>Game Type</label>
            <Tabs
              theme="auto"
              fill
              tabs={config.gameTypes.map((g, i) => ({
                id: String(i),
                label: g.label,
              }))}
              activeId={String(gameIndex)}
              onChange={(id) => setGameIndex(Number(id))}
              className="w-full"
            />
          </div>

          <div>
            <label className={labelClass}>Wager Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(42,39,78,0.4)] dark:text-white/40">
                $
              </span>
              <input
                type="number"
                value={wager}
                onChange={(e) =>
                  setWager(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full rounded-xl border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white py-3 pl-7 pr-3 text-base font-semibold text-[#2a274e] outline-none transition-colors focus:border-[#8874ff]/50 [appearance:textfield] dark:border-white/20 dark:bg-white/[0.03] dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min={0}
                step={1000}
              />
            </div>
            <div className="mt-2 flex gap-1.5">
              {WAGER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWager(preset)}
                  className={`flex-1 rounded-full border-[0.5px] py-2 text-[12px] font-medium backdrop-blur-[20px] transition-all ${
                    wager === preset
                      ? "border-[#8874ff]/50 bg-[rgba(142,142,255,0.14)] text-[#6b56e0] shadow-[0_0_10px_rgba(136,116,255,0.2)] dark:text-[#8874ff]"
                      : "border-[rgba(42,39,78,0.12)] bg-[rgba(42,39,78,0.03)] text-[rgba(42,39,78,0.55)] hover:bg-[rgba(42,39,78,0.06)] dark:border-white/15 dark:bg-white/[0.04] dark:text-white/50 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  $
                  {preset >= 1_000_000
                    ? `${preset / 1_000_000}M`
                    : preset >= 1000
                      ? `${preset / 1000}K`
                      : preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden bg-[rgba(42,39,78,0.08)] lg:block dark:bg-white/[0.06]" />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {logos ? (
              <>
                <Image
                  src={logos.light}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain dark:hidden"
                />
                <Image
                  src={logos.dark}
                  alt=""
                  width={20}
                  height={20}
                  className="hidden size-5 object-contain dark:block"
                />
              </>
            ) : null}
            <p className="text-[15px] font-semibold text-[#2a274e] dark:text-white">
              {config.name}
            </p>
          </div>
          <BreakdownRow
            label="Your wager"
            value={`$${wager.toLocaleString()}`}
          />
          <BreakdownRow
            label="House edge"
            value={`${(100 * game.houseEdge).toFixed(1)}%`}
          />
          <BreakdownRow
            label="Wager share"
            value={`${Math.round(100 * config.commission)}%`}
          />
          <p className="text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
            Formula: Wagered ×{" "}
            {(100 * game.houseEdge).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            % × {Math.round(100 * config.commission)}%
            {(game.divisor ?? 2) > 1 ? ` ÷ ${game.divisor ?? 2}` : ""}
          </p>
          <div className="h-px bg-[rgba(42,39,78,0.08)] dark:bg-white/[0.06]" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
              Your net extra rakeback
            </span>
            <span className="text-2xl font-bold text-[#6b56e0] dark:text-[#8874ff]">
              $
              {earnings.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {config.formulaExplanation ? (
            <p className="mt-1 text-[11px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45">
              {config.formulaExplanation}
            </p>
          ) : null}
          <p className="mt-1 text-[11px] leading-relaxed text-[rgba(42,39,78,0.4)] dark:text-white/40">
            Estimate only. Actual wager share depends on your real play, game
            mix, bonuses and each casino&apos;s affiliate terms. Figures here
            are illustrative and not guaranteed.
          </p>
        </div>
      </div>
    </Panel>
  );
}
