const KNOWN = new Set([
  "ADA",
  "APE",
  "AVAX",
  "BCH",
  "BSC",
  "BTC",
  "DAI",
  "DOGE",
  "EOS",
  "ETH",
  "LINK",
  "LTC",
  "MOG",
  "PEPE",
  "POL",
  "SHFL",
  "SHIB",
  "SOL",
  "TON",
  "TRON",
  "USDC",
  "USDT",
  "XRP",
]);

const ALIASES: Record<string, string> = {
  TRX: "TRON",
  BNB: "BSC",
  MATIC: "POL",
  WETH: "ETH",
  WBTC: "BTC",
};

/** Map a currency ticker to `/logos/coins/{TICKER}.svg`. */
export function coinLogoSrc(currency: string | null | undefined): string {
  const raw = (currency || "").toUpperCase();
  const mapped = ALIASES[raw] ?? raw;
  const ticker = KNOWN.has(mapped) ? mapped : "OTHER";
  return `/logos/coins/${ticker}.svg`;
}
