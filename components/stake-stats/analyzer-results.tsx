"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RotateCcw, Upload } from "lucide-react";
import {
  Hint,
  MetricRow,
  SectionCard,
  StakeBetLink,
} from "@/components/stake-stats/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cumulativeSeries } from "@/lib/stake-stats/parse-bets";
import {
  formatCount,
  formatPct,
  formatUsd,
  formatUsdCompact,
  pnlClass,
} from "@/lib/stake-stats/format";
import type { AnalyzerStats } from "@/lib/stake-stats/types";

const GREEN = "#10B981";
const RED = "#EF4444";

function axisTicks(min: number, max: number) {
  if (min === max) return [min - 1, min, min + 1];
  const span = max - min;
  const step = span / 4;
  return [min, min + step, min + 2 * step, min + 3 * step, max];
}

function CumChart({ stats }: { stats: AnalyzerStats }) {
  const data = useMemo(() => cumulativeSeries(stats), [stats]);
  const values = data.map((d) => d.value);
  const minV = values.length ? Math.min(...values, 0) : 0;
  const maxV = values.length ? Math.max(...values, 0) : 0;
  const ticks = axisTicks(minV, maxV);
  const range = maxV - minV;
  const zeroOffset = range > 0 ? Math.max(0, Math.min(1, maxV / range)) : 0.5;

  if (data.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-1 items-center justify-center text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
        No data to chart
      </div>
    );
  }

  return (
    <div className="min-h-[260px] w-full flex-1">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 8, left: 6 }}>
          <defs>
            <linearGradient id="nd-cum-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
              <stop
                offset={`${100 * zeroOffset}%`}
                stopColor={GREEN}
                stopOpacity={0}
              />
              <stop
                offset={`${100 * zeroOffset}%`}
                stopColor={RED}
                stopOpacity={0}
              />
              <stop offset="100%" stopColor={RED} stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(42,39,78,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(42,39,78,0.45)", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            domain={[minV, maxV]}
            ticks={ticks}
            tickFormatter={formatUsdCompact}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(42,39,78,0.45)", fontSize: 12 }}
            width={48}
          />
          <ReferenceLine y={0} stroke="rgba(42,39,78,0.2)" strokeDasharray="2 2" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as {
                date: string;
                value: number;
              };
              return (
                <div className="rounded-[12px] border border-[#e4e4e7] bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#0f1424]">
                  <div className="text-[13px] font-medium text-[#2a274e] dark:text-white">
                    {row.date}
                  </div>
                  <div className="mt-1 text-[13px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
                    Cumulative:{" "}
                    <span className={pnlClass(row.value)}>
                      {formatUsd(row.value)}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={GREEN}
            strokeWidth={2}
            fill="url(#nd-cum-grad)"
            dot={false}
            activeDot={{ r: 4, fill: GREEN }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type AnalyzerResultsProps = {
  stats: AnalyzerStats;
  isDemo: boolean;
  isProcessing: boolean;
  onUploadMore: () => void;
  onClear: () => void;
};

export function AnalyzerResults({
  stats,
  isDemo,
  isProcessing,
  onUploadMore,
  onClear,
}: AnalyzerResultsProps) {
  const range =
    stats.dateRange.start && stats.dateRange.end
      ? stats.dateRange.start === stats.dateRange.end
        ? stats.dateRange.start
        : `${stats.dateRange.start} → ${stats.dateRange.end}`
      : "—";
  const rtp =
    stats.totalWager > 0
      ? (stats.totalPayout / stats.totalWager) * 100
      : 0;
  const pieData = stats.betDistribution.slice(0, 8);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isDemo ? (
            <span className="rounded-full border border-[#8874ff]/40 bg-[#8874ff]/10 px-2.5 py-1 text-[12px] font-medium text-[#6b56e0] dark:text-[#b9adff]">
              Demo data
            </span>
          ) : null}
          <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
            {range} · {formatCount(stats.totalBets)} bets
            {stats.totalFilesProcessed > 1
              ? ` · ${stats.totalFilesProcessed} files`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            theme="auto"
            variant="ghost"
            size="sm"
            leftIcon={<Upload />}
            onClick={onUploadMore}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing…" : "Add files"}
          </Button>
          <Button
            theme="auto"
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw />}
            onClick={onClear}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="panel" blur>
          <div className="py-2 text-center">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(42,39,78,0.4)] dark:text-white/40">
              Cumulative P&L (USD){" "}
              <Hint text="Total payouts minus total wagers, valued in USD." />
            </div>
            <div
              className={`mt-1 text-[40px] font-bold leading-none tabular-nums sm:text-[48px] ${pnlClass(stats.pnl)}`}
            >
              {formatUsd(stats.pnl)}
            </div>
            <div
              className={`mt-1.5 text-[13px] font-medium tabular-nums ${pnlClass(stats.pnl)}`}
            >
              RTP {formatPct(rtp)} · Win rate {formatPct(stats.winRate, 1)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[rgba(42,39,78,0.05)] pt-2 dark:border-white/5 sm:grid-cols-2">
            <MetricRow label="Total Wagered" value={formatUsd(stats.totalWager)} />
            <MetricRow label="Total Payout" value={formatUsd(stats.totalPayout)} />
            <MetricRow label="Wins / Losses" value={`${formatCount(stats.wins)} / ${formatCount(stats.losses)}`} />
            <MetricRow label="Avg Bet" value={formatUsd(stats.avgBetSize)} />
            <MetricRow
              label="Median Stake"
              value={formatUsd(stats.medianStake)}
            />
            <MetricRow
              label="Max Drawdown"
              value={formatUsd(stats.maxDrawdown)}
              hint="Biggest peak-to-trough drop in your running P&L."
            />
            <MetricRow
              label="Biggest Win"
              value={formatUsd(stats.biggestWin)}
              valueClass="font-medium text-[#1f9d57] dark:text-[#4ADE80]"
              action={
                <StakeBetLink
                  game={stats.biggestWinGame}
                  betId={stats.biggestWinBetId}
                />
              }
            />
            <MetricRow
              label="Biggest Loss"
              value={formatUsd(stats.biggestLoss)}
              valueClass={pnlClass(stats.biggestLoss)}
              action={
                <StakeBetLink
                  game={stats.biggestLossGame}
                  betId={stats.biggestLossBetId}
                />
              }
            />
            <MetricRow label="Date Range" value={range} />
            <MetricRow
              label="Currencies"
              value={
                stats.currencyStats.length === 0
                  ? "—"
                  : stats.currencyStats.map((c) => c.currency).join(" · ")
              }
            />
          </div>
        </Card>

        <SectionCard title="Bet Distribution" subtitle="Share of bets by game">
          {pieData.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center text-[14px] text-[rgba(42,39,78,0.4)]">
              No data
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="h-[200px] w-full sm:w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="percentage"
                      nameKey="game"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((d) => (
                        <Cell key={d.game} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {pieData.map((d) => (
                  <div
                    key={d.game}
                    className="flex items-center justify-between gap-2 text-[12px]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: d.color }}
                      />
                      <span className="truncate text-[#2a274e] dark:text-white">
                        {d.game}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[rgba(42,39,78,0.5)] dark:text-white/50">
                      {d.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Cumulative Net"
        subtitle="Your running profit / loss over time"
      >
        <CumChart stats={stats} />
      </SectionCard>

      <SectionCard title="Per-Game Breakdown">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                <th className="pb-3 font-normal">Game</th>
                <th className="pb-3 text-right font-normal">Bets</th>
                <th className="pb-3 text-right font-normal">Wagered</th>
                <th className="pb-3 text-right font-normal">P&L</th>
                <th className="pb-3 text-right font-normal">ROI</th>
                <th className="pb-3 text-right font-normal">Win %</th>
              </tr>
            </thead>
            <tbody>
              {stats.gameStats.map((g) => (
                <tr
                  key={g.game}
                  className="border-t border-[rgba(42,39,78,0.05)] dark:border-white/5"
                >
                  <td className="py-3 font-medium text-[#2a274e] dark:text-white">
                    {g.game}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatCount(g.bets)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatUsd(g.totalWager)}
                  </td>
                  <td
                    className={`py-3 text-right font-medium tabular-nums ${pnlClass(g.pnl)}`}
                  >
                    {formatUsd(g.pnl)}
                  </td>
                  <td
                    className={`py-3 text-right tabular-nums ${pnlClass(g.roi)}`}
                  >
                    {formatPct(g.roi, 1)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatPct(g.winRate, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Currency Breakdown">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[480px] border-separate border-spacing-0 text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                <th className="pb-3 font-normal">Currency</th>
                <th className="pb-3 text-right font-normal">Bets</th>
                <th className="pb-3 text-right font-normal">Wagered USD</th>
                <th className="pb-3 text-right font-normal">P&L USD</th>
              </tr>
            </thead>
            <tbody>
              {stats.currencyStats.map((c) => (
                <tr
                  key={c.currency}
                  className="border-t border-[rgba(42,39,78,0.05)] dark:border-white/5"
                >
                  <td className="py-3 font-medium text-[#2a274e] dark:text-white">
                    {c.currency}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatCount(c.bets)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatUsd(c.totalWager)}
                  </td>
                  <td
                    className={`py-3 text-right font-medium tabular-nums ${pnlClass(c.pnl)}`}
                  >
                    {formatUsd(c.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {stats.topMultipliers.length > 0 ? (
        <SectionCard title="Top Multipliers">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[520px] border-separate border-spacing-0 text-[14px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                  <th className="pb-3 font-normal">#</th>
                  <th className="pb-3 font-normal">Game</th>
                  <th className="pb-3 text-right font-normal">Multiplier</th>
                  <th className="pb-3 text-right font-normal">Stake</th>
                  <th className="pb-3 text-right font-normal">Payout</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMultipliers.slice(0, 20).map((row, i) => (
                  <tr
                    key={`${row.game}-${row.multiplier}-${i}`}
                    className="border-t border-[rgba(42,39,78,0.05)] dark:border-white/5"
                  >
                    <td className="py-3 text-[rgba(42,39,78,0.4)] dark:text-white/40">
                      {i + 1}
                    </td>
                    <td className="py-3 font-medium text-[#2a274e] dark:text-white">
                      <span className="inline-flex items-center gap-1.5">
                        {row.game}
                        <StakeBetLink game={row.game} betId={row.betId} />
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold tabular-nums text-[#8874ff]">
                      {row.multiplier.toFixed(2)}x
                    </td>
                    <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                      {formatUsd(row.stake)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                      {formatUsd(row.payout)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}

      {stats.bonusStats.hasEnoughData ? (
        <SectionCard
          title="Bonus Detection"
          subtitle="Heuristic gaps ≥30s between non-live bets (approx.)"
        >
          <p className="mb-3 text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
            {formatCount(stats.bonusStats.totalBonuses)} likely bonus rounds across{" "}
            {formatCount(stats.bonusStats.totalSlotBets)} tracked bets
          </p>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[360px] text-[14px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                  <th className="pb-3 font-normal">Game</th>
                  <th className="pb-3 text-right font-normal">Bets</th>
                  <th className="pb-3 text-right font-normal">Bonuses</th>
                </tr>
              </thead>
              <tbody>
                {stats.bonusStats.slots.slice(0, 15).map((s) => (
                  <tr
                    key={s.game}
                    className="border-t border-[rgba(42,39,78,0.05)] dark:border-white/5"
                  >
                    <td className="py-3 font-medium text-[#2a274e] dark:text-white">
                      {s.game}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {formatCount(s.bets)}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {formatCount(s.bonuses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
