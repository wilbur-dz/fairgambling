"use client";

import { getPublicApiUrl } from "@/lib/api/config";
import type { AffiliateAccount, AffiliateClaim } from "@/lib/affiliate/data";

function useMockFallback(): boolean {
  if (process.env.NEXT_PUBLIC_AFFILIATE_API_FALLBACK_MOCK === "0") return false;
  if (process.env.NEXT_PUBLIC_AFFILIATE_API_FALLBACK_MOCK === "1") return true;
  return process.env.NEXT_PUBLIC_HOME_API_FALLBACK_MOCK !== "0";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function clientFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${getPublicApiUrl()}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new Error(`Invalid JSON (${res.status})`);
    }
  }

  if (!res.ok) {
    const message =
      (isRecord(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : null) ||
      (isRecord(parsed) && typeof parsed.error === "string"
        ? parsed.error
        : null) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (isRecord(parsed) && "data" in parsed) {
    return parsed.data as T;
  }
  return parsed as T;
}

function asAccounts(value: unknown): AffiliateAccount[] {
  return Array.isArray(value) ? (value as AffiliateAccount[]) : [];
}

function asClaims(value: unknown): AffiliateClaim[] {
  return Array.isArray(value) ? (value as AffiliateClaim[]) : [];
}

/** `GET /api/affiliate-tracker/my-earnings` */
export async function getMyAffiliateEarnings(): Promise<AffiliateAccount[]> {
  try {
    return asAccounts(await clientFetch("/api/affiliate-tracker/my-earnings"));
  } catch (err) {
    if (useMockFallback()) return [];
    throw err;
  }
}

/** `GET /api/affiliate-tracker/my-claims` */
export async function getMyAffiliateClaims(): Promise<AffiliateClaim[]> {
  try {
    return asClaims(await clientFetch("/api/affiliate-tracker/my-claims"));
  } catch (err) {
    if (useMockFallback()) return [];
    throw err;
  }
}

/** `POST /api/affiliate-tracker/claim` */
export async function claimAffiliateKickback(
  casinoId: number,
  payoutConnectedAccountId?: number,
  claimConnectedAccountId?: number,
): Promise<unknown> {
  if (!Number.isFinite(casinoId) || casinoId <= 0) {
    throw new Error("Invalid casino id");
  }
  const body: Record<string, number> = { casinoId };
  if (payoutConnectedAccountId != null) {
    body.payoutConnectedAccountId = payoutConnectedAccountId;
  }
  if (claimConnectedAccountId != null) {
    body.claimConnectedAccountId = claimConnectedAccountId;
  }
  return clientFetch("/api/affiliate-tracker/claim", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** `POST /api/affiliate-tracker/connect` */
export async function connectAffiliateAccount(
  casinoSlug: string,
  username: string,
  betId?: string,
  expectedMultiplier?: number,
): Promise<unknown> {
  const slug = casinoSlug.trim();
  const name = username.trim();
  if (!slug || !name) throw new Error("Casino and username are required");
  const body: Record<string, string | number> = {
    casinoSlug: slug,
    username: name,
  };
  if (betId) body.betId = betId;
  if (expectedMultiplier != null) body.expectedMultiplier = expectedMultiplier;
  return clientFetch("/api/affiliate-tracker/connect", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const TG_HANDLE_KEY = "fg-telegram-handle";

export async function getTelegramHandle(
  _accessToken: string | null,
): Promise<{ handle: string | null }> {
  try {
    const data = await clientFetch<{ handle?: string | null }>(
      "/api/telegram/status",
    );
    return { handle: data?.handle ?? null };
  } catch {
    try {
      const local = localStorage.getItem(TG_HANDLE_KEY);
      return { handle: local || null };
    } catch {
      return { handle: null };
    }
  }
}

export async function setTelegramHandle(
  _accessToken: string | null,
  handle: string,
): Promise<{ handle: string }> {
  const cleaned = handle.trim().replace(/^@/, "");
  if (!cleaned) throw new Error("Telegram handle is required");
  try {
    const data = await clientFetch<{ handle?: string }>(
      "/api/telegram/handle",
      {
        method: "POST",
        body: JSON.stringify({ handle: cleaned }),
      },
    );
    return { handle: data?.handle ?? cleaned };
  } catch {
    try {
      localStorage.setItem(TG_HANDLE_KEY, cleaned);
    } catch {
      // ignore persistence failures
    }
    return { handle: cleaned };
  }
}
