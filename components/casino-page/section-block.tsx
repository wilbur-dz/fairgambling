"use client";

import type { ReactNode } from "react";
import { Check, Info, X } from "lucide-react";
import {
  ScoreBreakdownTooltip,
  type ScoreBreakdownItem,
} from "@/components/casino-page/score-breakdown-tooltip";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";

export type RowPolarity = "positive" | "inverse" | "neutral";

export type SectionRow = {
  label: string;
  value?: string;
  description?: string;
  valueNode?: ReactNode;
  align?: "left" | "right";
  booleanPolarity?: RowPolarity;
};

type CategoryScoreDisplayProps = {
  title: string;
  score: number;
  pending?: boolean;
  subcategories?: ScoreBreakdownItem[];
  className?: string;
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 9;

/** Port of reference `CategoryScoreDisplay` (tooltip + /10 + ring). */
export function CategoryScoreDisplay({
  title,
  score,
  pending = false,
  subcategories,
  className = "gap-2",
}: CategoryScoreDisplayProps) {
  if (pending) {
    return (
      <span
        className="rounded-full border border-[rgba(42,39,78,0.15)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.5)] dark:border-white/15 dark:text-white/50"
        title={title}
      >
        Score soon
      </span>
    );
  }

  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(10, score)) : 0;

  return (
    <div className={`flex shrink-0 items-center ${className}`}>
      {subcategories && subcategories.length > 0 ? (
        <ScoreBreakdownTooltip
          subcategories={subcategories}
          heading={`${title} breakdown`}
        />
      ) : (
        <Info
          size={16}
          className="text-[rgba(42,39,78,0.4)] dark:text-white/40"
          aria-hidden
        />
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-[24px] font-bold leading-none text-[#2a274e] dark:text-white">
          {safeScore.toFixed(1)}
        </span>
        <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
          / 10
        </span>
      </div>
      <svg
        width="26"
        height="26"
        viewBox="0 0 22 22"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <circle
          cx="11"
          cy="11"
          r={9}
          stroke="var(--nd-ring-track)"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="11"
          cy="11"
          r={9}
          stroke="var(--nd-accent-green)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(safeScore / 10) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
          transform="rotate(-90 11 11)"
        />
      </svg>
    </div>
  );
}

/** Port of reference row value renderer (`d`). */
function RowValue({
  value,
  polarity = "positive",
}: {
  value?: string;
  polarity?: RowPolarity;
}) {
  if (polarity === "neutral") {
    return (
      <span className="truncate text-[14px] font-medium text-[#2a274e] dark:text-white">
        {value}
      </span>
    );
  }

  if (value === "Yes") {
    const positive = polarity !== "inverse";
    return (
      <span
        aria-label={`Yes — ${positive ? "positive" : "negative"}`}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
          positive ? "" : "bg-[#dc2626] dark:bg-[#fb3748]"
        }`}
        style={positive ? { backgroundColor: "var(--nd-accent-green)" } : undefined}
      >
        {positive ? (
          <Check
            size={13}
            strokeWidth={3}
            className="text-white dark:text-[#0f1424]"
          />
        ) : (
          <X size={13} strokeWidth={3} className="text-white" />
        )}
      </span>
    );
  }

  if (value === "No") {
    const positive = polarity === "inverse";
    return (
      <span
        aria-label={`No — ${positive ? "positive" : "negative"}`}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
          positive ? "" : "bg-[#dc2626] dark:bg-[#fb3748]"
        }`}
        style={positive ? { backgroundColor: "var(--nd-accent-green)" } : undefined}
      >
        {positive ? (
          <Check
            size={13}
            strokeWidth={3}
            className="text-white dark:text-[#0f1424]"
          />
        ) : (
          <X size={13} strokeWidth={3} className="text-white" />
        )}
      </span>
    );
  }

  return (
    <span className="truncate text-[14px] font-medium text-[#2a274e] dark:text-white">
      {value ?? "—"}
    </span>
  );
}

type SectionBlockProps = {
  id: string;
  title: string;
  weight: number;
  score: number;
  pending?: boolean;
  subcategories?: ScoreBreakdownItem[];
  rows?: SectionRow[];
  topSlot?: ReactNode;
  children?: ReactNode;
};

/** Port of reference `SectionBlock`. */
export function SectionBlock({
  id,
  title,
  weight,
  score,
  pending = false,
  subcategories,
  rows = [],
  topSlot,
  children,
}: SectionBlockProps) {
  return (
    <Card
      id={id}
      variant="panel"
      theme="auto"
      blur
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-[18px] font-medium leading-tight text-[#2a274e] dark:text-white">
            {title}
          </h2>
          <CategoryScoreDisplay
            title={title}
            score={score}
            pending={pending}
            subcategories={subcategories}
          />
        </div>
        <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
          Makes up{" "}
          <span className="font-semibold text-[rgba(42,39,78,0.7)] dark:text-white/70">
            {weight}%
          </span>{" "}
          of the total score
        </span>
      </div>

      {topSlot}

      {rows.length > 0 ? (
        <div className="flex flex-col">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-4 py-3.5 ${
                index < rows.length - 1
                  ? "border-b border-[rgba(42,39,78,0.07)] dark:border-white/[0.06]"
                  : ""
              }`}
            >
              {row.description ? (
                <Tooltip
                  content={row.description}
                  side="top"
                  align="start"
                  maxWidth={260}
                  triggerClassName="min-w-0 justify-self-start"
                >
                  <span className="cursor-default text-[14px] font-medium underline-offset-2 hover:underline hover:decoration-dotted text-[#2a274e] hover:decoration-[rgba(42,39,78,0.4)] dark:text-white dark:hover:decoration-white/40">
                    {row.label}
                  </span>
                </Tooltip>
              ) : (
                <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
                  {row.label}
                </span>
              )}
              <div
                className={`flex min-w-0 items-center gap-2 ${
                  row.align === "left" ? "justify-start" : "justify-end"
                }`}
              >
                {row.valueNode ?? (
                  <RowValue
                    value={row.value}
                    polarity={row.booleanPolarity}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {children}
    </Card>
  );
}
