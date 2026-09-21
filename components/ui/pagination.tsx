"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  className?: string;
  compact?: boolean;
  theme?: "auto" | "light" | "dark";
};

function pageRange(
  page: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

/** Port of reference `Pagination` (3gytcvcyv09c7.js, simplified). */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
  compact = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageRange(page, totalPages, siblingCount);
  const navBtn =
    "flex items-center gap-2 text-[14px] font-medium text-[#637083] transition-opacity disabled:cursor-default disabled:opacity-40 dark:text-white/60 dark:disabled:hover:text-white/60";
  const cell = compact ? "size-8" : "size-9";

  return (
    <nav
      className={`flex items-center justify-center ${
        compact ? "gap-3" : "gap-4 sm:gap-10"
      } ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={navBtn}
      >
        <ChevronLeft size={20} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`e-${index}`}
              className={`flex ${cell} items-center justify-center text-[14px] text-[#2a274e]/40 dark:text-white/40`}
            >
              …
            </span>
          ) : item === page ? (
            <button
              key={item}
              type="button"
              aria-current="page"
              className="nd-button nd-button--ghost-auto flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-medium"
            >
              <span aria-hidden className="nd-button__pulse" />
              <span className="relative z-[1]">{item}</span>
            </button>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={`nd-ring-dark-only relative flex ${cell} shrink-0 items-center justify-center rounded-full text-[14px] font-medium text-white/60 transition-colors hover:bg-white/[0.01] hover:text-white dark:rounded-full dark:text-white/60`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={navBtn}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={20} />
      </button>
    </nav>
  );
}
