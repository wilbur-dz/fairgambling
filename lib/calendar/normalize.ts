import type { PayoutRow, PayoutsPayload } from "@/lib/calendar/data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

function normalizeRow(raw: unknown): PayoutRow | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.casino !== "string" || !raw.casino) return null;
  const totalPaid = Number(raw.totalPaid);
  const share = Number(raw.share);
  if (!Number.isFinite(totalPaid) || !Number.isFinite(share)) return null;
  return {
    casino: raw.casino,
    slug: typeof raw.slug === "string" ? raw.slug : "",
    totalPaid,
    share,
  };
}

function normalizeTf(raw: unknown): PayoutRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeRow).filter((row): row is PayoutRow => row != null);
}

/**
 * Normalize `{ status, data: { byTf } }` from
 * `GET /api/casinos/bonus-payouts`.
 */
export function normalizeBonusPayouts(
  payload: unknown,
): PayoutsPayload | null {
  const data = unwrapData(payload);
  if (!isRecord(data) || !isRecord(data.byTf)) return null;
  const byTf = data.byTf;
  return {
    byTf: {
      "7d": normalizeTf(byTf["7d"]),
      "30d": normalizeTf(byTf["30d"]),
      "365d": normalizeTf(byTf["365d"]),
    },
  };
}
