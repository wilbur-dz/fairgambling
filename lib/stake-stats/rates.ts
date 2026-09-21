/** Stablecoins treated as 1:1 USD. */
export const STABLECOINS = new Set([
  "usdt",
  "usdc",
  "dai",
  "busd",
  "usdp",
  "tusd",
  "fdusd",
  "pyusd",
]);

/** Fallback USD rates when archive has no `value` field. */
export const USD_FALLBACK_RATES: Record<string, number> = {
  eth: 2500,
  btc: 65e3,
  sol: 120,
  ltc: 100,
  doge: 0.18,
  xrp: 0.55,
  trx: 0.13,
  bch: 350,
  bnb: 600,
  ada: 0.5,
  shib: 22e-6,
  pepe: 95e-7,
  link: 14,
  matic: 0.65,
  ton: 6.5,
  avax: 30,
  dot: 7,
  apt: 9,
  near: 5,
  arb: 0.75,
  op: 1.8,
  uni: 9,
  atom: 7,
};

const warned = new Set<string>();

export function toUsdPair(
  currency: string,
  amount: number,
  payoutMultiplier: number,
  valueUsd?: number | null,
) {
  const key = currency.toLowerCase();
  if (valueUsd != null && Number.isFinite(valueUsd) && valueUsd > 0) {
    return {
      wagerUsd: valueUsd,
      payoutUsd: valueUsd * (Number.isFinite(payoutMultiplier) ? payoutMultiplier : 0),
    };
  }
  if (STABLECOINS.has(key)) {
    return {
      wagerUsd: amount,
      payoutUsd: amount * (Number.isFinite(payoutMultiplier) ? payoutMultiplier : 0),
    };
  }
  const rate = USD_FALLBACK_RATES[key];
  if (rate != null) {
    const wagerUsd = amount * rate;
    return {
      wagerUsd,
      payoutUsd: wagerUsd * (Number.isFinite(payoutMultiplier) ? payoutMultiplier : 0),
    };
  }
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `[stake-stats] No USD rate for currency "${currency}" — using raw amount.`,
    );
  }
  return {
    wagerUsd: amount,
    payoutUsd: amount * (Number.isFinite(payoutMultiplier) ? payoutMultiplier : 0),
  };
}

export function amountToUsd(currency: string, amount: number) {
  const key = (currency || "").toLowerCase();
  if (STABLECOINS.has(key)) return amount;
  const rate = USD_FALLBACK_RATES[key];
  return rate != null ? amount * rate : amount;
}
