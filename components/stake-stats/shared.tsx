"use client";

import type { ReactNode } from "react";
import { ExternalLink, Info } from "lucide-react";

export function Hint({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex align-[-2px]">
      <Info className="inline-block size-3.5 cursor-help text-[rgba(42,39,78,0.25)] transition-colors hover:text-[rgba(42,39,78,0.6)] dark:text-white/25 dark:hover:text-white/60" />
    </span>
  );
}

export function MetricRow({
  label,
  value,
  valueClass = "font-medium text-[#2a274e] dark:text-white",
  hint,
  action,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
      <span className="text-[rgba(42,39,78,0.45)] dark:text-white/45">
        {label}
        {hint ? (
          <>
            {" "}
            <Hint text={hint} />
          </>
        ) : null}
      </span>
      <span className="flex items-center gap-1.5">
        <span className={`tabular-nums ${valueClass}`}>{value}</span>
        {action}
      </span>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="light-element dark-element relative overflow-hidden rounded-[24px] p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-[rgba(42,39,78,0.45)] dark:text-white/45">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StakeBetLink({
  game,
  betId,
}: {
  game?: string;
  betId?: string;
}) {
  if (!game || !betId) return null;
  const href = `https://stake.com/casino/games/${game.toLowerCase()}?iid=house%3A${betId}&modal=bet`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="View this bet on Stake"
      className="inline-flex shrink-0 text-[rgba(42,39,78,0.3)] transition-colors hover:text-[rgba(42,39,78,0.7)] dark:text-white/30 dark:hover:text-white/70"
    >
      <ExternalLink className="size-3.5" />
    </a>
  );
}
