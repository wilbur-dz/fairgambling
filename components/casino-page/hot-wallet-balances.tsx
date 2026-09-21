"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { SupportedCards } from "@/components/casino-page/supported-cards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoinIcon } from "@/components/ui/coin-icon";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import {
  formatHotWalletUsd,
  type CasinoHotWallet,
  type HotWalletChainBalance,
} from "@/lib/casinos/casino-hot-wallet";

const NATIVE_COIN_BY_CHAIN: Record<string, string> = {
  ethereum: "ETH",
  bsc: "BNB",
  solana: "SOL",
  tron: "TRX",
  base: "ETH",
  arbitrum: "ETH",
  polygon: "POL",
  btc: "BTC",
  ltc: "LTC",
  xrp: "XRP",
  dogecoin: "DOGE",
};

const CHAIN_LABEL: Record<string, string> = {
  ethereum: "ETH",
  bsc: "BSC",
  solana: "SOL",
  tron: "TRX",
  base: "BASE",
  arbitrum: "ARB",
  polygon: "POLYGON",
  btc: "BTC",
  ltc: "LTC",
  xrp: "XRP",
  dogecoin: "DOGE",
};

/** Chain logos from reference `x` map — fall back to `CoinIcon` when missing. */
const CHAIN_LOGO_SRC: Record<string, string> = {
  ethereum: "/logos/coins/ETH.svg",
  bsc: "/logos/coins/BSC.svg",
  solana: "/logos/coins/SOL.svg",
  tron: "/logos/coins/TRON.svg",
  polygon: "/logos/coins/POL.svg",
};

type CoinRow = { coin: string; usdValue: number };

function topCoinsForChain(chain: HotWalletChainBalance): CoinRow[] {
  const native = NATIVE_COIN_BY_CHAIN[chain.chain] ?? chain.chain.toUpperCase();
  const merged = new Map<string, number>();

  for (const entry of chain.coins) {
    const coin = entry.coin.includes("-")
      ? entry.coin.split("-")[0]
      : entry.coin;
    merged.set(coin, (merged.get(coin) ?? 0) + entry.usd);
  }

  const rows = Array.from(merged.entries()).map(([coin, usdValue]) => ({
    coin,
    usdValue,
  }));

  const priority = [native, "USDT", "USDC"];
  const ordered: CoinRow[] = [];
  for (const symbol of priority) {
    const hit = rows.find((row) => row.coin === symbol);
    if (hit) ordered.push(hit);
  }

  return [
    ...ordered,
    ...rows
      .filter((row) => !priority.includes(row.coin))
      .sort((a, b) => b.usdValue - a.usdValue),
  ].slice(0, 4);
}

type HotWalletBalancesProps = {
  casino: CasinoDetail;
  hotWallet: CasinoHotWallet | null;
  analyticsHref?: string;
};

/** Port of reference `HotWalletBalances` (2-7hhq-z71oqb.js). */
export function HotWalletBalances({
  casino,
  hotWallet,
  analyticsHref = "/analytics",
}: HotWalletBalancesProps) {
  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  const overview = casino.meta?.overview;
  const supportedChains = overview?.supportedChains ?? [];
  const supportedCoins = overview?.supportedCoins ?? [];

  const chains = useMemo(
    () =>
      (hotWallet?.chains ?? [])
        .filter((c) => c.totalUsdValue > 0)
        .sort((a, b) => b.totalUsdValue - a.totalUsdValue),
    [hotWallet?.chains],
  );

  const coinRowsByChain = useMemo(
    () => chains.map((chain) => topCoinsForChain(chain)),
    [chains],
  );

  const maxCoinColumns = coinRowsByChain.length
    ? Math.max(...coinRowsByChain.map((rows) => rows.length))
    : 0;

  if (
    chains.length === 0 &&
    supportedChains.length === 0 &&
    supportedCoins.length === 0
  ) {
    return null;
  }

  const analyticsLink =
    analyticsHref.includes("?")
      ? analyticsHref
      : `${analyticsHref}?casino=${encodeURIComponent(casino.slug)}`;

  return (
    <Card
      id="hot-wallet-balances"
      variant="panel"
      blur
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          Hot Wallet Balances
        </h2>
        <Link href={analyticsLink} className="shrink-0">
          <Button
            theme="auto"
            variant="ghost"
            size="sm"
            rightIcon={<ArrowUpRight className="size-4" />}
          >
            View all
          </Button>
        </Link>
      </div>

      <SupportedCards chains={supportedChains} coins={supportedCoins} />

      {chains.length > 0 ? (
        <>
          <div className="flex flex-col md:hidden">
            {chains.map((chain, index) => {
              const coins = coinRowsByChain[index] ?? [];
              const expanded = expandedChain === chain.chain;
              const chainLogo = CHAIN_LOGO_SRC[chain.chain];

              return (
                <div
                  key={chain.chain}
                  className="border-b border-[rgba(42,39,78,0.08)] dark:border-[#EAECF0]/10"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedChain(expanded ? null : chain.chain)
                    }
                    aria-expanded={expanded}
                    className="flex h-[52px] w-full items-center gap-2.5 text-left"
                  >
                    {chainLogo ? (
                      <Image
                        src={chainLogo}
                        alt={chain.chain}
                        width={22}
                        height={22}
                        className="shrink-0 rounded-full"
                      />
                    ) : (
                      <CoinIcon coin={chain.chain} size={22} />
                    )}
                    <span className="flex-1 text-[14px] font-medium text-[#2a274e] dark:text-white">
                      {CHAIN_LABEL[chain.chain] ?? chain.chain.toUpperCase()}
                    </span>
                    <span className="text-[14px] font-semibold text-[#2a274e] dark:text-white">
                      {formatHotWalletUsd(chain.totalUsdValue)}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-[rgba(42,39,78,0.4)] transition-transform dark:text-white/40 ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded ? (
                    <div className="flex flex-col gap-2.5 pb-3.5 pl-[32px]">
                      {coins.map(({ coin, usdValue }) => (
                        <div
                          key={coin}
                          className="flex items-center gap-2"
                        >
                          <CoinIcon coin={coin} size={18} />
                          <span className="flex-1 text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                            {coin}
                          </span>
                          <span className="text-[13px] font-medium text-[#2a274e] dark:text-white">
                            {formatHotWalletUsd(usdValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="scrollbar-hide hidden overflow-x-auto md:block">
            <div className="flex min-w-[640px] flex-col">
              {chains.map((chain, index) => {
                const coins = coinRowsByChain[index] ?? [];
                const chainLabel =
                  CHAIN_LABEL[chain.chain] ?? chain.chain.toUpperCase();

                return (
                  <div
                    key={chain.chain}
                    className="grid h-[54px] items-center gap-3 border-b border-[rgba(42,39,78,0.08)] px-4 dark:border-[#EAECF0]/10"
                    style={{
                      gridTemplateColumns: `repeat(${maxCoinColumns}, minmax(0,1fr)) 100px`,
                    }}
                  >
                    {coins.map(({ coin, usdValue }, coinIndex) => {
                      const chainLogo = CHAIN_LOGO_SRC[chain.chain];
                      return (
                        <span
                          key={`${chain.chain}-${coin}`}
                          className="flex min-w-0 items-center gap-2"
                        >
                          {coinIndex === 0 && chainLogo ? (
                            <Image
                              src={chainLogo}
                              alt={chain.chain}
                              width={20}
                              height={20}
                              className="shrink-0 rounded-full"
                            />
                          ) : (
                            <CoinIcon coin={coin} size={20} />
                          )}
                          <span className="shrink-0 text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                            {(coinIndex === 0 && chainLabel) || coin}
                          </span>
                          <span className="truncate text-[14px] font-medium text-[#2a274e] dark:text-white">
                            {formatHotWalletUsd(usdValue)}
                          </span>
                        </span>
                      );
                    })}
                    {Array.from({ length: maxCoinColumns - coins.length }).map(
                      (_, padIndex) => (
                        <span key={`pad-${chain.chain}-${padIndex}`} />
                      ),
                    )}
                    <span className="pl-2 text-right text-[14px] font-semibold text-[#2a274e] dark:text-white">
                      {formatHotWalletUsd(chain.totalUsdValue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex h-[44px] items-center justify-between rounded-[16px] border-[0.5px] border-[rgba(42,39,78,0.15)] bg-transparent py-[14px] pl-[18px] pr-4 dark:border-white/20">
            <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Total
            </span>
            <span className="text-[14px] font-semibold text-[#2a274e] dark:text-white">
              {formatHotWalletUsd(hotWallet?.totalUsdValue ?? 0)}
            </span>
          </div>
        </>
      ) : (
        <div className="rounded-[10px] px-3 py-10 text-center text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
          No hot wallet balances tracked yet.
        </div>
      )}
    </Card>
  );
}
