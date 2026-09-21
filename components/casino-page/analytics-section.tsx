"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { CategoryScoreDisplay } from "@/components/casino-page/section-block";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import {
  ANALYTICS_PERIODS,
  formatCompactCount,
  formatDepositVolumeUsd,
  type AnalyticsPeriod,
  type CasinoAnalytics,
  type DepositSizeDistribution,
} from "@/lib/casinos/casino-analytics";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

const CARD_RADIUS = "rounded-[24px]";
const CARD_H = `h-[180px] ${CARD_RADIUS}`;
const CARD_H_MD = `${CARD_RADIUS} md:h-[180px]`;

function buildSparkPaths(values: number[]): { line: string; area: string } {
  const height = 53.2;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const step = 396 / (values.length - 1);
  const points = values.map((v, i) => ({
    x: 2 + i * step,
    y: 8.4 + height - ((v - min) / range) * height,
  }));

  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    line += ` C ${p1.x + (p2.x - p0.x) * 0.3} ${p1.y + (p2.y - p0.y) * 0.3}, ${
      p2.x - (p3.x - p1.x) * 0.3
    } ${p2.y - (p3.y - p1.y) * 0.3}, ${p2.x} ${p2.y}`;
  }

  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L ${last.x} 70 L ${first.x} 70 Z`;
  return { line, area };
}

function seededSparkline(seed: number, trend: "up" | "down"): number[] {
  let state = seed;
  const rand = () => {
    state = (16807 * state) % 0x7fffffff;
    return (state - 1) / 0x7ffffffe;
  };
  let value = trend === "up" ? 35 : 65;
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    value = Math.max(
      15,
      Math.min(85, value + (trend === "up" ? 1.2 : -1.2) + (rand() - 0.5) * 8),
    );
    out.push(value);
  }
  return out;
}

function DepositVolumeSpark({
  seed,
  trend,
  realData,
}: {
  seed: number;
  trend: "up" | "down";
  realData?: number[];
}) {
  const fallback = useMemo(() => {
    if (realData && realData.length >= 2) return null;
    return seededSparkline(seed, trend);
  }, [seed, trend, realData]);

  const values =
    realData && realData.length >= 2 ? realData : fallback;
  if (!values || values.length < 2) return null;

  const { line, area } = buildSparkPaths(values);
  const gradientId = `nd-spark-${seed}`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 70"
      preserveAspectRatio="none"
      className="block overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(124, 94, 255, 0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="#7C5EFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Port of reference player-distribution `BarChart` (module `2-7hhq-z71oqb`, fn `w`). */
function PlayerDistributionChart({ data }: { data: DepositSizeDistribution }) {
  const totalVolume = data.buckets.reduce((sum, b) => sum + b.volume, 0);
  const chartData = data.buckets.map((b) => ({
    label: b.label,
    pct:
      totalVolume > 0
        ? Math.round((b.volume / totalVolume) * 10_000) / 100
        : 0,
  }));

  return (
    <div className="min-h-0 w-full flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
          barCategoryGap="15%"
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="var(--nd-chart-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--nd-chart-tick)", fontSize: 9 }}
            interval={2}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--nd-chart-tick)", fontSize: 9 }}
            tickFormatter={(value) => `${value}%`}
            width={30}
          />
          <Bar
            dataKey="pct"
            fill="var(--nd-chart-bar)"
            radius={[3, 3, 3, 3]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type AnalyticsSectionProps = {
  analytics: CasinoAnalytics;
  casinoSlug: string;
  analyticsHref?: string;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `AnalyticsSection` (module `2-7hhq-z71oqb`). */
export function AnalyticsSection({
  analytics,
  casinoSlug,
  analyticsHref = "/analytics",
  rating,
}: AnalyticsSectionProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30D");
  const { timeframeData, hotWalletRank, chartSeries, depositSizeByPeriod } =
    analytics;

  const href =
    analyticsHref.includes("?")
      ? analyticsHref
      : `${analyticsHref}?casino=${encodeURIComponent(casinoSlug)}`;

  const category = rating?.categories?.analytics;
  const score = category?.score ?? 0;
  const hasWeighted =
    category?.subcategories?.some(
      (s) => !s.pending && Number.parseFloat(s.weight ?? "0") > 0,
    ) ?? false;
  const pending = Boolean(category?.pending || !hasWeighted);
  const weight = CATEGORY_WEIGHTS.analytics;

  const frame = timeframeData[period];
  const metrics = frame?.data ?? null;
  const distribution = depositSizeByPeriod[period] ?? null;

  const sparkSeed = 1000 * period.charCodeAt(0) + 7 * period.length;
  const sparkTrend: "up" | "down" =
    (metrics?.depositVolumeChange ?? 0) >= 0 ? "up" : "down";
  const realSpark =
    period === "30D" && chartSeries.length >= 2
      ? chartSeries.map((p) => p.value)
      : undefined;

  const rankRows = [
    { rank: frame?.volumeRank, label: "Deposit Vol." },
    { rank: frame?.depositorsRank, label: "Depositors" },
    { rank: hotWalletRank, label: "Hot Wallets" },
  ];

  const metricRows = [
    {
      label: "Market Share",
      value: metrics ? `${metrics.marketShare.toFixed(1)}%` : "—",
      bar: metrics ? metrics.marketShare : null,
    },
    {
      label: "Unique Depositors",
      value: metrics ? formatCompactCount(metrics.differentDeposits) : "—",
      bar: null as number | null,
    },
    {
      label: "New Depositors",
      value: metrics ? formatCompactCount(metrics.newDeposits) : "—",
      bar: null as number | null,
    },
    {
      label: "Total Deposits",
      value: metrics ? formatCompactCount(metrics.deposits) : "—",
      bar: null as number | null,
    },
  ];

  return (
    <Card
      id="analytics"
      variant="panel"
      theme="auto"
      blur
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-[18px] font-medium leading-tight text-[#2a274e] dark:text-white">
              Analytics
            </h2>
            <CategoryScoreDisplay
              title="Analytics"
              score={score}
              pending={pending}
              subcategories={category?.subcategories?.map((s) => ({
                name: s.name,
                score: s.score,
                weight: s.weight ?? "0",
                pending: s.pending,
              }))}
              className="gap-4"
            />
          </div>
          <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
            Makes up{" "}
            <span className="font-semibold text-[rgba(42,39,78,0.7)] dark:text-white/70">
              {weight}%
            </span>{" "}
            of the total score
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Tabs
            theme="auto"
            size="sm"
            tabs={ANALYTICS_PERIODS.map((id) => ({ id, label: id }))}
            activeId={period}
            onChange={(id) => {
              if ((ANALYTICS_PERIODS as string[]).includes(id)) {
                setPeriod(id as AnalyticsPeriod);
              }
            }}
          />
          <Link href={href} className="shrink-0">
            <Button
              theme="auto"
              variant="ghost"
              size="sm"
              rightIcon={<ArrowUpRight size={16} />}
            >
              View all
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          variant="glass"
          theme="auto"
          className={CARD_H_MD}
          contentClassName="flex h-full flex-col"
        >
          <div className="flex flex-1 flex-col gap-4">
            {rankRows.map((row) => (
              <Link
                key={row.label}
                href={href}
                className="flex items-center justify-between text-[14px] transition-opacity hover:opacity-80"
              >
                <span className="flex items-center gap-1">
                  <span className="text-[rgba(42,39,78,0.5)] dark:text-white/50">
                    #{row.rank ?? "—"} in
                  </span>
                  <span className="text-[#2a274e] dark:text-white">
                    {row.label}
                  </span>
                </span>
                <ExternalLink
                  size={20}
                  className="shrink-0 text-[#6b56e0] dark:text-[#8874ff]"
                />
              </Link>
            ))}
          </div>
        </Card>

        <Card
          variant="glass"
          theme="auto"
          className={CARD_H}
          contentClassName="flex h-full flex-col"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[16px] font-medium leading-normal text-[#2a274e] dark:text-white">
              Deposit Volume
            </span>
            <span className="text-[24px] font-semibold leading-none tabular-nums text-[#1f9d57] dark:text-[#4ad17d]">
              {formatDepositVolumeUsd(metrics?.depositVolume)}
            </span>
          </div>
          <div className="min-h-0 w-full flex-1 pt-2">
            {metrics ? (
              <DepositVolumeSpark
                seed={sparkSeed}
                trend={sparkTrend}
                realData={realSpark}
              />
            ) : null}
          </div>
        </Card>

        <Card
          variant="glass"
          theme="auto"
          className={CARD_H}
          contentClassName="flex h-full flex-col"
        >
          <div className="flex flex-1 flex-col gap-4 text-[14px]">
            {metricRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-normal text-[#2a274e] dark:text-white">
                  {row.label}
                </span>
                <div className="flex items-center gap-2">
                  {row.bar != null ? (
                    <div className="h-[4px] w-[60px] overflow-hidden rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#7C5EFF]"
                        style={{
                          width: `${Math.min(100, Math.max(0, row.bar))}%`,
                        }}
                      />
                    </div>
                  ) : null}
                  <span className="font-semibold tabular-nums text-[#2a274e] dark:text-white">
                    {row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          variant="glass"
          theme="auto"
          className={CARD_H}
          contentClassName="flex h-full flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-medium leading-normal text-[#2a274e] dark:text-white">
              Player Distribution
            </span>
            <span className="text-[10px] text-[rgba(42,39,78,0.45)] dark:text-[#637083]">
              Volume by wallet size
            </span>
          </div>
          {distribution && distribution.buckets.length > 0 ? (
            <PlayerDistributionChart data={distribution} />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center text-[12px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
              No distribution data
            </div>
          )}
        </Card>
      </div>
    </Card>
  );
}
