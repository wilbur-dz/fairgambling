"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { getCategoryScoreColor } from "@/lib/casinos/score-color";

export type ScoreBreakdownItem = {
  name: string;
  weight: string;
  score: number;
  pending?: boolean;
};

type ScoreBreakdownTooltipProps = {
  subcategories: ScoreBreakdownItem[];
  heading?: string;
  showZeroWeight?: boolean;
};

/** Port of reference `ScoreBreakdownTooltip`. */
export function ScoreBreakdownTooltip({
  subcategories,
  heading = "Score breakdown",
  showZeroWeight = false,
}: ScoreBreakdownTooltipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  const rows = (
    showZeroWeight
      ? subcategories
      : subcategories.filter((item) => {
          const w = parseFloat(String(item.weight).replace("%", ""));
          return !Number.isFinite(w) || w > 0;
        })
  ).filter((item) => !item.pending);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (rows.length === 0) {
    return (
      <Info
        size={16}
        className="text-[rgba(42,39,78,0.4)] dark:text-white/40"
        aria-hidden
      />
    );
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Score breakdown"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex size-5 items-center justify-center rounded-full text-[rgba(42,39,78,0.4)] transition-colors hover:text-[#6b56e0] dark:text-white/40 dark:hover:text-[#8E8EFF]"
      >
        <Info size={16} />
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={heading}
          className="absolute right-0 top-full z-40 mt-2 rounded-[14px] border border-[rgba(42,39,78,0.12)] bg-white p-3 shadow-[0_12px_30px_-12px_rgba(42,39,78,0.18)] dark:border-white/10 dark:bg-[#12182a] dark:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.55)]"
        >
          <div className="max-h-[60vh] w-[240px] overflow-y-auto">
            <p className="mb-2 text-[11px] font-medium text-[rgba(42,39,78,0.5)] dark:text-white/50">
              {heading}
            </p>
            <div className="flex flex-col gap-1">
              {rows.map((item, index) => {
                const color = getCategoryScoreColor(item.score);
                return (
                  <div
                    key={`${item.name}-${index}`}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12px] ${
                      index % 2 === 0
                        ? "bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04]"
                        : ""
                    }`}
                  >
                    <span className="flex-1 truncate text-[rgba(42,39,78,0.8)] dark:text-white/80">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
                      {item.weight}
                    </span>
                    <span
                      className="w-6 shrink-0 text-right font-semibold tabular-nums"
                      style={{ color }}
                    >
                      {item.score.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/transparency"
              className="mt-3 flex items-center justify-center gap-1.5 border-t border-[rgba(42,39,78,0.1)] pt-3 text-[12px] font-medium text-[#6b56e0] transition-opacity hover:opacity-80 dark:border-white/10 dark:text-[#8E8EFF]"
              onClick={() => setOpen(false)}
            >
              How our rating works →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
