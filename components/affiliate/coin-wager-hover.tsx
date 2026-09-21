"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { coinLogoSrc } from "@/lib/affiliate/coin-logo";
import type { CoinBreakdown } from "@/lib/affiliate/data";

type CoinWagerHoverProps = {
  value: ReactNode;
  text?: string;
  breakdown?: CoinBreakdown[];
  valueClassName?: string;
  align?: "center" | "left";
};

/** Dotted USD value with coin breakdown tooltip. */
export function CoinWagerHover({
  value,
  text,
  breakdown,
  valueClassName,
  align = "center",
}: CoinWagerHoverProps) {
  const coins = (breakdown ?? []).filter((c) => c.amount > 0).slice(0, 8);

  return (
    <span className="group/coin relative inline-block w-fit">
      <span
        className={
          valueClassName ??
          "cursor-help text-sm font-medium underline decoration-dotted decoration-[rgba(42,39,78,0.25)] underline-offset-4 dark:decoration-white/25"
        }
      >
        {value}
      </span>
      <span
        className={`pointer-events-none absolute bottom-full z-20 mb-2 hidden w-64 rounded-[12px] border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white px-3 py-2.5 text-left text-[11px] font-normal leading-relaxed text-[rgba(42,39,78,0.75)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-[20px] group-hover/coin:block dark:border-white/15 dark:bg-[#171b2c] dark:text-white/75 ${
          align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/30 to-transparent dark:block"
        />
        {coins.length > 0 ? (
          <span className="mb-2 flex flex-col gap-1.5">
            {coins.map((c) => (
              <span key={c.currency} className="flex items-center gap-2">
                <Image
                  src={coinLogoSrc(c.currency)}
                  alt={c.currency}
                  width={16}
                  height={16}
                  className="size-4 shrink-0 rounded-full object-contain"
                />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium tabular-nums text-[#2a274e] dark:text-white">
                  {c.amount.toLocaleString(undefined, {
                    maximumFractionDigits: c.amount >= 1 ? 2 : 6,
                  })}{" "}
                  <span className="font-normal text-[rgba(42,39,78,0.45)] dark:text-white/40">
                    {c.currency}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-[rgba(42,39,78,0.45)] dark:text-white/40">
                  ~$
                  {c.usd.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </span>
            ))}
          </span>
        ) : null}
        {text ??
          "Tracked in crypto coins. The USD value moves with coin prices."}
        <span
          aria-hidden
          className={`absolute top-full -mt-1 size-2 rotate-45 border-b-[0.5px] border-r-[0.5px] border-[rgba(42,39,78,0.15)] bg-white dark:border-white/15 dark:bg-[#171b2c] ${
            align === "left" ? "left-4" : "left-1/2 -translate-x-1/2"
          }`}
        />
      </span>
    </span>
  );
}
