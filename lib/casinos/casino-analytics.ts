/**
 * Types + SSR loader for casino-page `AnalyticsSection`.
 * Assembles timeframe ranks, deposit-size distribution, sparkline, hot-wallet rank.
 */

import { ApiError, apiFetch } from "@/lib/api/client";
import { getMarketBreakdown } from "@/lib/casinos/loaders";
import { casinoRouteSlug } from "@/lib/reviews/format";

export type AnalyticsPeriod = "7D" | "30D" | "90D" | "365D";

export const ANALYTICS_PERIODS: AnalyticsPeriod[] = [
  "7D",
  "30D",
  "90D",
  "365D",
];

export type CasinoAnalyticsMetrics = {
  casinoId: number | string;
  casinoName: string;
  logoUrl: string | null;
  depositVolume: number;
  depositVolumeChange: number;
  marketShare: number;
  deposits: number;
  depositsChange: number;
  newDeposits: number;
  newDepositsChange: number;
  differentDeposits: number;
  differentDepositsChange: number;
};

export type CasinoAnalyticsTimeframe = {
  data: CasinoAnalyticsMetrics | null;
  volumeRank: number | null;
  depositorsRank: number | null;
};

export type DepositSizeBucket = {
  bucketIdx: number;
  label: string;
  walletCount: number;
  walletPct: number;
  volume: number;
};

export type DepositSizeDistribution = {
  casinoId: number | string;
  casinoName: string;
  logoUrl: string | null;
  totalWallets: number;
  buckets: DepositSizeBucket[];
};

export type ChartSeriesPoint = {
  value: number;
  label?: string;
};

export type CasinoAnalytics = {
  timeframeData: Partial<Record<AnalyticsPeriod, CasinoAnalyticsTimeframe>>;
  hotWalletRank: number | null;
  chartSeries: ChartSeriesPoint[];
  depositSizeByPeriod: Partial<
    Record<AnalyticsPeriod, DepositSizeDistribution | null>
  >;
};

const DEFAULT_REVALIDATE = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s || null;
}

function logAnalyticsError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[casino-analytics] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[casino-analytics] ${scope}: ${message}`);
}

function emptyAnalytics(): CasinoAnalytics {
  return {
    timeframeData: {},
    hotWalletRank: null,
    chartSeries: [],
    depositSizeByPeriod: {},
  };
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^casino/, "");
}

function matchesCasino(
  rowName: string,
  rowId: string | number | null | undefined,
  slug: string,
  casinoName: string,
  casinoId: string | null,
): boolean {
  if (casinoId && rowId != null && String(rowId) === casinoId) return true;
  if (namesMatch(rowName, casinoName)) return true;
  const slugKey = slugifyName(slug);
  const nameKey = slugifyName(rowName);
  return Boolean(slugKey) && (nameKey === slugKey || nameKey.includes(slugKey));
}

function parseMarketRow(raw: Record<string, unknown>): CasinoAnalyticsMetrics {
  return {
    casinoId: (raw.casinoId ?? raw.id ?? "") as number | string,
    casinoName: String(raw.casinoName ?? raw.name ?? ""),
    logoUrl: asOptionalString(raw.logoUrl),
    depositVolume: asNumber(raw.depositVolume),
    depositVolumeChange: asNumber(raw.depositVolumeChange),
    marketShare: asNumber(raw.marketShare),
    deposits: asNumber(raw.deposits),
    depositsChange: asNumber(raw.depositsChange),
    newDeposits: asNumber(raw.newDeposits),
    newDepositsChange: asNumber(raw.newDepositsChange),
    differentDeposits: asNumber(raw.differentDeposits),
    differentDepositsChange: asNumber(raw.differentDepositsChange),
  };
}

function buildTimeframe(
  rows: CasinoAnalyticsMetrics[],
  slug: string,
  casinoName: string,
  casinoId: string | null,
): CasinoAnalyticsTimeframe {
  const byVolume = [...rows].sort((a, b) => b.depositVolume - a.depositVolume);
  const byDepositors = [...rows].sort(
    (a, b) => b.differentDeposits - a.differentDeposits,
  );

  const matchIndex = (list: CasinoAnalyticsMetrics[]) => {
    const idx = list.findIndex((r) =>
      matchesCasino(r.casinoName, r.casinoId, slug, casinoName, casinoId),
    );
    return idx >= 0 ? idx + 1 : null;
  };

  const data =
    rows.find((r) =>
      matchesCasino(r.casinoName, r.casinoId, slug, casinoName, casinoId),
    ) ?? null;

  return {
    data,
    volumeRank: matchIndex(byVolume),
    depositorsRank: matchIndex(byDepositors),
  };
}

async function fetchMarketMetrics(
  period: AnalyticsPeriod,
): Promise<CasinoAnalyticsMetrics[]> {
  try {
    const payload = await apiFetch<unknown>(
      `/api/analytics/market-breakdown?${new URLSearchParams({ period })}`,
      {
        method: "GET",
        next: { revalidate: DEFAULT_REVALIDATE, tags: [`market-${period}`] },
      },
    );
    const data =
      isRecord(payload) && "data" in payload ? payload.data : payload;
    const list = Array.isArray(data)
      ? data
      : isRecord(data) && Array.isArray(data.data)
        ? data.data
        : [];
    return list
      .filter(isRecord)
      .map(parseMarketRow)
      .filter((r) => Boolean(r.casinoName));
  } catch (err) {
    logAnalyticsError(`market:${period}`, err);
    // Fall back to normalized volume-only rows from shared loader
    const fallback = await getMarketBreakdown(period);
    return fallback.map((r) => ({
      casinoId: r.casinoId,
      casinoName: r.casinoName,
      logoUrl: r.logoUrl ?? null,
      depositVolume: r.depositVolume,
      depositVolumeChange: r.depositVolumeChange,
      marketShare: 0,
      deposits: 0,
      depositsChange: 0,
      newDeposits: 0,
      newDepositsChange: 0,
      differentDeposits: 0,
      differentDepositsChange: 0,
    }));
  }
}

function normalizeBuckets(raw: unknown): DepositSizeBucket[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((b, index) => ({
      bucketIdx: asNumber(b.bucketIdx ?? b.bucket_idx, index),
      label: String(b.label ?? b.bucket ?? ""),
      walletCount: asNumber(b.walletCount ?? b.wallets),
      walletPct: asNumber(b.walletPct ?? b.pct_wallets),
      volume: asNumber(b.volume ?? b.usd),
    }))
    .filter((b) => Boolean(b.label));
}

async function fetchDepositSize(
  period: AnalyticsPeriod,
  slug: string,
  casinoName: string,
  casinoId: string | null,
): Promise<DepositSizeDistribution | null> {
  const periodParam = period.toLowerCase();
  try {
    const params = new URLSearchParams({
      metric: "volume",
      period: periodParam,
      casino: slug,
    });
    const payload = await apiFetch<unknown>(
      `/api/analytics/distribution?${params}`,
      {
        method: "GET",
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: [`distribution-${period}-${slug}`],
        },
      },
    );
    if (!isRecord(payload)) return null;

    // Single-casino response
    if (Array.isArray(payload.buckets)) {
      return {
        casinoId: (payload.casino ?? casinoId ?? slug) as number | string,
        casinoName: String(payload.casino_name ?? casinoName),
        logoUrl: null,
        totalWallets: asNumber(payload.total_wallets),
        buckets: normalizeBuckets(payload.buckets),
      };
    }

    // Multi-casino series response
    const series = Array.isArray(payload.series) ? payload.series : [];
    const hit = series.find((item) => {
      if (!isRecord(item)) return false;
      return matchesCasino(
        String(item.name ?? ""),
        item.casino_id as string | number | undefined,
        slug,
        casinoName,
        casinoId,
      );
    });
    if (!isRecord(hit)) return null;
    return {
      casinoId: (hit.casino_id ?? casinoId ?? slug) as number | string,
      casinoName: String(hit.name ?? casinoName),
      logoUrl: null,
      totalWallets: asNumber(hit.total_wallets),
      buckets: normalizeBuckets(hit.buckets),
    };
  } catch (err) {
    logAnalyticsError(`distribution:${period}:${slug}`, err);
    return null;
  }
}

async function fetchChartSeries(
  slug: string,
  casinoName: string,
  casinoId: string | null,
): Promise<ChartSeriesPoint[]> {
  try {
    const params = new URLSearchParams({
      period: "30d",
      metric: "deposits",
      casinos: slug,
      group_by: "casino",
    });
    const payload = await apiFetch<unknown>(
      `/api/analytics/timeseries?${params}`,
      {
        method: "GET",
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: [`timeseries-30d-${slug}`],
        },
      },
    );
    if (!isRecord(payload)) return [];
    const series = Array.isArray(payload.series) ? payload.series : [];
    const hit =
      series.find((item) => {
        if (!isRecord(item)) return false;
        return matchesCasino(
          String(item.name ?? ""),
          item.casino_id as string | number | undefined,
          slug,
          casinoName,
          casinoId,
        );
      }) ?? (isRecord(series[0]) ? series[0] : null);

    if (!hit || !Array.isArray(hit.points)) return [];
    return (hit.points as unknown[])
      .filter(isRecord)
      .map((p: Record<string, unknown>) => ({
        value: asNumber(p.usd),
        label: asOptionalString(p.bucket_end) ?? undefined,
      }))
      .filter((p) => Number.isFinite(p.value));
  } catch (err) {
    logAnalyticsError(`timeseries:${slug}`, err);
    return [];
  }
}

async function fetchHotWalletRank(
  slug: string,
  casinoName: string,
  casinoId: string | null,
): Promise<number | null> {
  try {
    const params = new URLSearchParams({ group: "casino", period: "30d" });
    const payload = await apiFetch<unknown>(
      `/api/analytics/wallet-balances?${params}`,
      {
        method: "GET",
        next: { revalidate: DEFAULT_REVALIDATE, tags: ["wallet-balances"] },
      },
    );
    if (!isRecord(payload) || !Array.isArray(payload.matrix)) return null;

    const totals = new Map<string, { name: string; id: string; usd: number }>();
    for (const row of payload.matrix) {
      if (!isRecord(row)) continue;
      const name = String(row.casino ?? "");
      if (!name) continue;
      const id = String(row.casino_id ?? name);
      const key = id || name.toLowerCase();
      const prev = totals.get(key);
      const usd = asNumber(row.usd);
      if (prev) {
        prev.usd += usd;
      } else {
        totals.set(key, { name, id, usd });
      }
    }

    const ranked = [...totals.values()].sort((a, b) => b.usd - a.usd);
    const idx = ranked.findIndex((r) =>
      matchesCasino(r.name, r.id, slug, casinoName, casinoId),
    );
    return idx >= 0 ? idx + 1 : null;
  } catch (err) {
    logAnalyticsError(`wallet-balances:${slug}`, err);
    return null;
  }
}

/** Load analytics payload for a casino detail page. */
export async function loadCasinoAnalytics(input: {
  slug: string;
  casinoName: string;
  casinoId?: string | null;
}): Promise<CasinoAnalytics> {
  const slug = casinoRouteSlug(input.slug.trim());
  const casinoName = input.casinoName.trim();
  const casinoId =
    input.casinoId != null && String(input.casinoId).trim() !== ""
      ? String(input.casinoId).trim()
      : null;

  if (!slug || !casinoName) return emptyAnalytics();

  try {
    const [
      marketResults,
      distributionResults,
      chartSeries,
      hotWalletRank,
    ] = await Promise.all([
      Promise.all(ANALYTICS_PERIODS.map((p) => fetchMarketMetrics(p))),
      Promise.all(
        ANALYTICS_PERIODS.map((p) =>
          fetchDepositSize(p, slug, casinoName, casinoId),
        ),
      ),
      fetchChartSeries(slug, casinoName, casinoId),
      fetchHotWalletRank(slug, casinoName, casinoId),
    ]);

    const timeframeData: CasinoAnalytics["timeframeData"] = {};
    const depositSizeByPeriod: CasinoAnalytics["depositSizeByPeriod"] = {};

    ANALYTICS_PERIODS.forEach((period, index) => {
      timeframeData[period] = buildTimeframe(
        marketResults[index] ?? [],
        slug,
        casinoName,
        casinoId,
      );
      depositSizeByPeriod[period] = distributionResults[index] ?? null;
    });

    return {
      timeframeData,
      hotWalletRank,
      chartSeries,
      depositSizeByPeriod,
    };
  } catch (err) {
    logAnalyticsError(`loadCasinoAnalytics:${slug}`, err);
    return emptyAnalytics();
  }
}

export function formatCompactCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function formatDepositVolumeUsd(
  value: number | null | undefined,
): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
