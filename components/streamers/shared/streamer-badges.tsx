"use client";

import { Dice5, DollarSign } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { formatCompactNumber } from "@/lib/streamers/view-format";
import type { DegenLevel, RawFake } from "@/lib/streamers/types";

export function LiveBadge({ viewers }: { viewers?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex size-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f7575f] opacity-40" />
        <span
          className="relative inline-flex size-1.5 rounded-full bg-[#f7575f]"
          style={{ boxShadow: "0 0 6px rgba(247,87,95,0.8)" }}
        />
      </span>
      <span className="text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-[#f7575f]">
        Live
      </span>
      {typeof viewers === "number" && viewers > 0 ? (
        <>
          <span className="text-[10px] leading-none text-[rgba(42,39,78,0.25)] dark:text-white/25">
            ·
          </span>
          <span className="text-[10px] font-semibold leading-none tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
            {formatCompactNumber(viewers)}
          </span>
        </>
      ) : null}
    </span>
  );
}

export function DegenBadge({
  level,
  inline = false,
}: {
  level: DegenLevel;
  inline?: boolean;
}) {
  const bars = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  const color =
    level === "High" ? "#a78bfa" : level === "Medium" ? "#fbbf24" : "#34d399";
  const barRow = (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-3 rounded-sm transition-colors"
          style={{
            backgroundColor:
              i < bars ? color : "var(--degen-off, rgba(255,255,255,0.08))",
          }}
        />
      ))}
    </span>
  );

  if (inline) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {barRow}
        <span className="text-[13px] font-semibold" style={{ color }}>
          {level}
        </span>
        <span className="text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
          degen
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <span className="text-[13px] font-bold" style={{ color }}>
        {level}
      </span>
      {barRow}
    </span>
  );
}

export function MoneyTypeBadge({
  value,
  size = 13,
}: {
  value: RawFake;
  size?: number;
}) {
  const isRaw = value === "Raw";
  const colorClass = isRaw ? "text-[#10b981]" : "text-[#f59e0b]";
  const Icon = isRaw ? DollarSign : Dice5;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2a274e] dark:text-white">
      <Icon size={size} className={colorClass} />
      {value}
    </span>
  );
}

export function MoneyLegend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
      <span className="inline-flex items-center gap-1">
        <DollarSign size={13} className="text-[#1fcea6]" /> Raw
      </span>
      <span className="inline-flex items-center gap-1">
        <Dice5 size={13} className="text-[#f5b83d]" /> Fake
      </span>
    </div>
  );
}

export function StreamerCasinoIcon({
  casinoName,
  size,
}: {
  casinoName: string;
  size: number;
}) {
  if (casinoName.trim().toLowerCase() === "free agent") {
    return (
      <img
        src="/icons/fg-icon.svg"
        alt=""
        style={{ height: 0.85 * size }}
        className="w-auto shrink-0 opacity-70"
      />
    );
  }
  return (
    <AnalyticsCasinoIcon casinoName={casinoName} size={size} theme="auto" />
  );
}

export function CasinoTag({
  name,
  size = 16,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const trimmed = (name ?? "").trim();
  if (
    trimmed &&
    trimmed !== "—" &&
    trimmed.toLowerCase() !== "free agent"
  ) {
    return (
      <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
        <AnalyticsCasinoIcon casinoName={name} size={size} theme="auto" />
        <span className="truncate">{name}</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <img
        src="/icons/fg-icon.svg"
        alt=""
        style={{ height: 0.85 * size }}
        className="w-auto shrink-0 opacity-70"
      />
      <span className="truncate text-[rgba(42,39,78,0.5)] dark:text-white/50">
        Free Agent{" "}
        <span className="text-[rgba(42,39,78,0.3)] dark:text-white/30">
          (no deal currently)
        </span>
      </span>
    </span>
  );
}
