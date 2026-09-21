"use client";

import { useId, useState, type ReactNode } from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end" | "center";
  maxWidth?: number;
  triggerClassName?: string;
};

/** Lightweight tooltip (reference `Tooltip` module `72372`). */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "start",
  maxWidth = 260,
  triggerClassName = "",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

  const sideClass =
    side === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  return (
    <span
      className={`relative inline-flex min-w-0 ${triggerClassName}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined}>{children}</span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute z-50 rounded-xl border px-3 py-2 text-[12px] leading-snug shadow-lg ${alignClass} ${sideClass} border-[rgba(42,39,78,0.1)] bg-white text-[#2a274e] dark:border-white/10 dark:bg-[#1a1830] dark:text-white/90`}
          style={{ maxWidth }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
