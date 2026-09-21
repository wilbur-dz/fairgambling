import type {
  LiveCode,
  CodeCasino,
  CodesListPayload,
  CodesPagination,
  CodesStatsPayload,
  CodesStatsPeriod,
  CodesByCasinoRow,
  CodesBiggestRow,
} from "@/lib/livecodes/data";
import { CASINO_FILTER_PREFERRED } from "@/lib/livecodes/data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
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
  if (value == null) return null;
  const s = asString(value).trim();
  return s || null;
}

/** Map one `/api/codes` row → `LiveCode`. */
export function normalizeLiveCode(raw: unknown, index = 0): LiveCode | null {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code).trim();
  if (!code) return null;

  const casinoName = asString(raw.casinoName || raw.casino).trim() || "Casino";
  const casinoSlug =
    asString(raw.casinoSlug).trim() ||
    casinoName.toLowerCase().replace(/[^a-z0-9]+/g, "");

  return {
    id: asString(raw.id, `${casinoSlug}:${code}:${index}`),
    code,
    casinoName,
    casinoSlug,
    casinoLogoUrl: asOptionalString(raw.casinoLogoUrl),
    telegramChannel: asOptionalString(raw.telegramChannel),
    numberOfClaims: asNumber(raw.numberOfClaims ?? raw.claims ?? raw.totalClaims),
    wagerRequirement: asNumber(raw.wagerRequirement ?? raw.wagerReq),
    wagerRequirementTimeframe: asOptionalString(
      raw.wagerRequirementTimeframe ?? raw.wagerTimeframe,
    ),
    codeValue: asString(raw.codeValue ?? raw.value, "0"),
    duration:
      raw.duration == null ? null : asNumber(raw.duration, Number.NaN) || null,
    startAt: asOptionalString(raw.startAt),
    endAt: asOptionalString(raw.endAt),
    status: asString(raw.status, "active"),
    createdAt: asString(raw.createdAt, new Date().toISOString()),
  };
}

/**
 * Map codes list envelopes used by:
 * - `GET /api/codes` → `{ status, data: LiveCode[], pagination? }`
 * - `GET /api/exclusive-codes` → `{ status, data: LiveCode[], meta?: { gatedCount } }`
 *   (fields assumed same as live codes until exclusive schema is documented)
 */
export function normalizeCodesList(payload: unknown): CodesListPayload {
  if (!isRecord(payload)) return { codes: [] };

  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : isRecord(payload.data) && Array.isArray(payload.data.codes)
        ? payload.data.codes
        : Array.isArray(payload.codes)
          ? payload.codes
          : [];

  const codes = list
    .map((row, i) => normalizeLiveCode(row, i))
    .filter((row): row is LiveCode => row != null);

  let pagination: CodesPagination | undefined;
  const rawPagination =
    isRecord(payload.pagination)
      ? payload.pagination
      : isRecord(payload.data) && isRecord(payload.data.pagination)
        ? payload.data.pagination
        : null;

  if (rawPagination) {
    pagination = {
      page: asNumber(rawPagination.page, 1),
      limit: asNumber(rawPagination.limit, codes.length),
      total: asNumber(rawPagination.total, codes.length),
      totalPages: asNumber(rawPagination.totalPages, 1),
    };
  }

  const meta = isRecord(payload.meta)
    ? payload.meta
    : isRecord(payload.data) && isRecord(payload.data.meta)
      ? payload.data.meta
      : null;

  const gatedCount =
    meta && meta.gatedCount != null
      ? asNumber(meta.gatedCount)
      : payload.gatedCount != null
        ? asNumber(payload.gatedCount)
        : undefined;

  return { codes, pagination, gatedCount };
}

const STATS_PERIODS: CodesStatsPeriod[] = ["24h", "7d", "90d"];

function emptyPeriodMap<T>(): Record<CodesStatsPeriod, T[]> {
  return { "24h": [], "7d": [], "90d": [] };
}

function normalizeByCasinoRow(raw: unknown): CodesByCasinoRow | null {
  if (!isRecord(raw)) return null;
  const casino = asString(raw.casino || raw.casinoName).trim();
  const slug =
    asString(raw.slug || raw.casinoSlug).trim() ||
    casino.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!casino && !slug) return null;
  return {
    casino: casino || slug,
    slug,
    codes: asNumber(raw.codes),
    totalValue: asNumber(raw.totalValue),
    avgValue: asNumber(raw.avgValue),
    claims: asNumber(raw.claims),
    share: asNumber(raw.share),
  };
}

function normalizeBiggestRow(raw: unknown): CodesBiggestRow | null {
  if (!isRecord(raw)) return null;
  const code = asString(raw.code).trim();
  if (!code) return null;
  const casino = asString(raw.casino || raw.casinoName).trim();
  const slug =
    asString(raw.slug || raw.casinoSlug).trim() ||
    casino.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return {
    casino: casino || slug,
    slug,
    code,
    value: asNumber(raw.value),
    claims: asNumber(raw.claims),
    totalPaid: asNumber(raw.totalPaid),
    when: asString(raw.when),
  };
}

function normalizePeriodRows<T>(
  raw: unknown,
  mapRow: (row: unknown) => T | null,
): Record<CodesStatsPeriod, T[]> {
  const out = emptyPeriodMap<T>();
  if (!isRecord(raw)) return out;
  for (const period of STATS_PERIODS) {
    const list = Array.isArray(raw[period]) ? raw[period] : [];
    out[period] = list
      .map(mapRow)
      .filter((row): row is T => row != null);
  }
  return out;
}

/** Map one `/api/casinos` row → slim `CodeCasino`. */
export function normalizeCodeCasino(raw: unknown): CodeCasino | null {
  if (!isRecord(raw)) return null;
  const slug = asString(raw.slug).trim();
  const name = asString(raw.name).trim();
  if (!slug || !name) return null;
  const id =
    typeof raw.id === "number" || typeof raw.id === "string"
      ? raw.id
      : slug;
  return { id, slug, name };
}

/**
 * Map `GET /api/casinos?limit=100` → `{ slug, name }[]`.
 * Not `/api/codes/casinos` (codeCount list).
 */
export function normalizeCasinosList(payload: unknown): CodeCasino[] {
  if (!isRecord(payload)) return [];
  const list = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];
  return list
    .map(normalizeCodeCasino)
    .filter((row): row is CodeCasino => row != null);
}

/**
 * Prod All Casinos options: catalog ∩ (stats.byCasino ∪ feed code slugs),
 * sorted by preferred order. Falls back to stats/codes names if catalog empty.
 */
export function buildCasinoFilterOptions(
  casinos: CodeCasino[],
  codes: LiveCode[],
  stats: CodesStatsPayload | null,
): CodeCasino[] {
  const active = new Set<string>();
  const names = new Map<string, string>();

  if (stats?.byCasino) {
    for (const rows of Object.values(stats.byCasino)) {
      for (const row of rows) {
        if (!row.slug) continue;
        active.add(row.slug);
        if (row.casino) names.set(row.slug, row.casino);
      }
    }
  }
  for (const row of codes) {
    if (!row.casinoSlug) continue;
    active.add(row.casinoSlug);
    if (row.casinoName) names.set(row.casinoSlug, row.casinoName);
  }

  const catalog =
    casinos.length > 0
      ? casinos
      : [...active].map((slug) => ({
          id: slug,
          slug,
          name: names.get(slug) ?? slug,
        }));

  const filtered =
    active.size > 0
      ? catalog.filter((c) => active.has(c.slug))
      : catalog;

  const rank = (slug: string) => {
    if (slug === "shock") return 999;
    const i = (CASINO_FILTER_PREFERRED as readonly string[]).indexOf(slug);
    return i === -1 ? 500 : i;
  };

  return [...filtered].sort((a, b) => rank(a.slug) - rank(b.slug));
}

/**
 * Map `GET /api/codes/stats` → `{ byCasino, biggest }` keyed by 24h / 7d / 90d.
 */
export function normalizeCodesStats(payload: unknown): CodesStatsPayload {
  const root = isRecord(payload)
    ? isRecord(payload.data)
      ? payload.data
      : payload
    : null;

  if (!root) {
    return { byCasino: emptyPeriodMap(), biggest: emptyPeriodMap() };
  }

  return {
    byCasino: normalizePeriodRows(root.byCasino, normalizeByCasinoRow),
    biggest: normalizePeriodRows(root.biggest, normalizeBiggestRow),
  };
}

/** `$X.XX` value per 1k wager — port of reference `calcValuePer1k`. */
export function calcValuePer1k(
  codeValue: string | number | null | undefined,
  wagerRequirement: number | null | undefined,
): string {
  if (codeValue == null || !wagerRequirement || wagerRequirement === 0) {
    return "-";
  }
  const numeric =
    typeof codeValue === "string" ? parseFloat(codeValue) : codeValue;
  if (Number.isNaN(numeric)) return "-";
  return `$${((numeric / wagerRequirement) * 1000).toFixed(2)}`;
}

export function formatCodeValue(codeValue: string | number): string {
  const numeric =
    typeof codeValue === "string" ? parseFloat(codeValue) : codeValue;
  if (Number.isNaN(numeric)) return String(codeValue);
  return `$${numeric.toLocaleString("en-US", {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Compact money for stats tables — `$14.0M` / `$22.6K` / `$12.50`. */
export function formatCompactUsd(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

/** Relative time for biggest-drop `when` — `5d ago` / `3h ago`. */
export function formatDropWhen(input: string | null | undefined): string {
  if (!input) return "—";
  const t = new Date(input).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours >= 1) return `${hours}h ago`;
  const mins = Math.floor(diff / 60_000);
  return mins >= 1 ? `${mins}m ago` : "just now";
}
