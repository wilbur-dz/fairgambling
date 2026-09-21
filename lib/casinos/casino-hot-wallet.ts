/**
 * SSR loader for casino-page `HotWalletBalances`.
 * Uses `/api/analytics/wallet-balances?group=casino&period=30d&casino={slug}`.
 */

import { ApiError, apiFetch } from "@/lib/api/client";
import { casinoRouteSlug } from "@/lib/reviews/format";

const DEFAULT_REVALIDATE = 60;

export type HotWalletCoinBalance = {
  coin: string;
  amount: number;
  usd: number;
};

export type HotWalletChainBalance = {
  chain: string;
  totalUsdValue: number;
  coins: HotWalletCoinBalance[];
};

export type CasinoHotWallet = {
  casino: string | null;
  totalUsdValue: number;
  chains: HotWalletChainBalance[];
};

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

function logHotWalletError(scope: string, err: unknown): void {
  if (err instanceof ApiError && (err.status === 404 || err.status === 502)) {
    console.warn(`[casino-hot-wallet] ${scope}: ${err.message}`);
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[casino-hot-wallet] ${scope}: ${message}`);
}

function normalizeCoins(raw: unknown): HotWalletCoinBalance[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((row) => ({
      coin: asOptionalString(row.coin) ?? "—",
      amount: asNumber(row.amount),
      usd: asNumber(row.usd),
    }))
    .filter((c) => c.usd > 0 || c.amount > 0);
}

function normalizeMatrixRow(row: Record<string, unknown>): HotWalletChainBalance | null {
  const chain = asOptionalString(row.chain);
  if (!chain) return null;
  const totalUsdValue = asNumber(row.usd);
  if (totalUsdValue <= 0) return null;
  return {
    chain,
    totalUsdValue,
    coins: normalizeCoins(row.coins),
  };
}

/** Load per-casino hot wallet snapshot for the rating tab. */
export async function loadCasinoHotWallet(
  slug: string,
): Promise<CasinoHotWallet | null> {
  const safe = casinoRouteSlug(slug.trim());
  if (!safe) return null;

  try {
    const params = new URLSearchParams({
      group: "casino",
      period: "30d",
      casino: safe,
    });
    const payload = await apiFetch<unknown>(
      `/api/analytics/wallet-balances?${params}`,
      {
        method: "GET",
        next: {
          revalidate: DEFAULT_REVALIDATE,
          tags: [`wallet-balances-${safe}`],
        },
      },
    );
    if (!isRecord(payload) || !Array.isArray(payload.matrix)) {
      return null;
    }

    const chains = payload.matrix
      .filter(isRecord)
      .map(normalizeMatrixRow)
      .filter((row): row is HotWalletChainBalance => row != null)
      .sort((a, b) => b.totalUsdValue - a.totalUsdValue);

    const totalUsdValue = asNumber(
      payload.current_total_usd,
      chains.reduce((sum, c) => sum + c.totalUsdValue, 0),
    );

    if (chains.length === 0 && totalUsdValue <= 0) {
      return null;
    }

    return {
      casino: asOptionalString(payload.casino_name),
      totalUsdValue,
      chains,
    };
  } catch (err) {
    logHotWalletError(`load:${safe}`, err);
    return null;
  }
}

/** Port of reference compact USD formatter (`p` in HotWalletBalances). */
export function formatHotWalletUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
