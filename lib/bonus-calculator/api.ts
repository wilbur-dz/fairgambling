import { ApiError, apiFetch, handleResponse } from "@/lib/api/client";
import type { VipCasino, VipCasinoMap } from "@/lib/bonus-calculator/vip";
import {
  getStaticVipCasino,
  STATIC_VIP_CASINOS,
} from "@/lib/bonus-calculator/vip";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRank(raw: unknown) {
  if (!isRecord(raw) || typeof raw.name !== "string") return null;
  const requirement =
    raw.requirement == null ? null : Number(raw.requirement);
  if (requirement != null && !Number.isFinite(requirement)) return null;
  const levelUpBonus =
    raw.levelUpBonus == null ? undefined : Number(raw.levelUpBonus);
  return {
    name: raw.name,
    requirement,
    ...(levelUpBonus != null && Number.isFinite(levelUpBonus)
      ? { levelUpBonus }
      : {}),
  };
}

function normalizeVipCasino(slug: string, raw: unknown): VipCasino | null {
  if (!isRecord(raw)) return null;
  const ranksRaw = Array.isArray(raw.ranks) ? raw.ranks : [];
  const ranks = ranksRaw
    .map(normalizeRank)
    .filter((r): r is NonNullable<typeof r> => r != null);
  if (ranks.length === 0) return null;

  const fallback = getStaticVipCasino(slug);
  return {
    name:
      typeof raw.name === "string"
        ? raw.name
        : (fallback?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1)),
    type: typeof raw.type === "string" ? raw.type : (fallback?.type ?? "wager"),
    currency:
      typeof raw.currency === "string"
        ? raw.currency
        : (fallback?.currency ?? "USD"),
    xpPerDollar: Number(raw.xpPerDollar) || fallback?.xpPerDollar || 1,
    sportsMultiplier:
      Number(raw.sportsMultiplier) || fallback?.sportsMultiplier || 1,
    ranks,
  };
}

/**
 * Normalize `{ status, data: { [slug]: VipCasino } }` from
 * `GET /api/casinos/vip-levels`. Merges over static catalog.
 */
export function normalizeVipLevels(payload: unknown): VipCasinoMap {
  const data =
    isRecord(payload) && "data" in payload ? payload.data : payload;
  if (!isRecord(data)) return { ...STATIC_VIP_CASINOS };

  const merged: VipCasinoMap = { ...STATIC_VIP_CASINOS };
  for (const [slug, raw] of Object.entries(data)) {
    const casino = normalizeVipCasino(slug, raw);
    if (casino) merged[slug] = { ...merged[slug], ...casino, ranks: casino.ranks };
  }
  return merged;
}

/**
 * `GET /api/casinos/vip-levels` — currently may return empty `data`;
 * caller should fall back to static catalog.
 */
export async function fetchVipLevels(options?: {
  revalidate?: number | false;
}): Promise<VipCasinoMap> {
  const payload = await apiFetch<unknown>("/api/casinos/vip-levels", {
    method: "GET",
    next:
      options?.revalidate === false
        ? { revalidate: false }
        : {
            revalidate: options?.revalidate ?? 300,
            tags: ["vip-levels", "bonus-calculator"],
          },
  });

  if (!isRecord(payload) || payload.status !== "ok") {
    throw new ApiError("Invalid vip-levels payload", 500, payload);
  }

  return normalizeVipLevels(payload);
}

/** Browser fetch via Next rewrite. */
export async function fetchVipLevelsClient(): Promise<VipCasinoMap> {
  const response = await fetch("/api/casinos/vip-levels", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });
  const payload = await handleResponse<unknown>(response);
  return normalizeVipLevels(payload);
}
