/** Minimal port of reference crypto icon helpers (module `520155`). */

const NON_ASSET_IDS = new Set(["soldoge", "solanadogecoin"]);

const CHAIN_ALIASES: Record<string, string> = {
  erc: "eth",
  erc20: "eth",
  ethereum: "eth",
  weth: "eth",
  trc: "trx",
  trc20: "trx",
  tron: "trx",
  bep20: "bsc",
  bnb: "bsc",
  binancecoin: "bsc",
  arb1: "arb",
  arbitrum: "arb",
  polygon: "pol",
  polygonpos: "pol",
  matic: "pol",
  bitcoin: "btc",
  litecoin: "ltc",
  dogecoin: "doge",
  ripple: "xrp",
  cardano: "ada",
  solana: "sol",
  wsol: "sol",
  opennetwork: "ton",
  bitcoincash: "bch",
  cchain: "avax",
  hedera: "hbar",
  optimism: "op",
  mon: "monad",
};

/** Tickers with SVGs under `public/logos/coins/`. */
const COIN_SVG_TICKERS = new Set([
  "ADA",
  "APE",
  "AVAX",
  "BCH",
  "BTC",
  "BSC",
  "DAI",
  "DOGE",
  "EOS",
  "ETH",
  "LINK",
  "LTC",
  "MOG",
  "OTHER",
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

const COIN_TICKER_ALIASES: Record<string, string> = {
  trx: "TRON",
  bnb: "BSC",
  matic: "POL",
  pol: "POL",
  weth: "ETH",
  wsol: "SOL",
};

function normalizeId(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function dropNonAssets(items: string[]): string[] {
  return items.filter((item) => !NON_ASSET_IDS.has(normalizeId(item)));
}

/** Port of reference `dedupeChains`. */
export function dedupeChains(chains: string[]): string[] {
  const seen = new Set<string>();
  return dropNonAssets(chains).filter((chain) => {
    const normalized = normalizeId(chain);
    const canonical = CHAIN_ALIASES[normalized] ?? normalized;
    if (seen.has(canonical)) return false;
    seen.add(canonical);
    return true;
  });
}

/** Port of reference `dropNonAssets`. */
export { dropNonAssets };

/** Port of reference `getCryptoIconPath` (subset — local `/logos/coins` assets). */
export function getCryptoIconPath(coin: string | null | undefined): string | null {
  if (!coin) return null;
  const normalized = normalizeId(coin);
  const aliased = CHAIN_ALIASES[normalized] ?? normalized;
  const ticker =
    COIN_TICKER_ALIASES[aliased] ??
    COIN_TICKER_ALIASES[normalized] ??
    aliased.toUpperCase();
  if (COIN_SVG_TICKERS.has(ticker)) {
    return `/logos/coins/${ticker}.svg`;
  }
  if (COIN_SVG_TICKERS.has(normalized.toUpperCase())) {
    return `/logos/coins/${normalized.toUpperCase()}.svg`;
  }
  return null;
}
