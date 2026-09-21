"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { REVIEW_PICKER_SLUG_ORDER } from "@/lib/reviews/constants";
import type { ReviewCasino } from "@/lib/reviews/data";

type CasinoPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  casinos: ReviewCasino[];
  onSelect: (casinoId: string) => void;
};

/** Port of reference Choose Casino modal (`et`). */
export function CasinoPickerModal({
  isOpen,
  onClose,
  casinos,
  onSelect,
}: CasinoPickerModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  const options = useMemo(() => {
    const allowed = new Set<string>(REVIEW_PICKER_SLUG_ORDER);
    const bySlug = new Map(
      casinos.filter((c) => allowed.has(c.slug)).map((c) => [c.slug, c]),
    );
    const ordered = REVIEW_PICKER_SLUG_ORDER.filter((slug) =>
      bySlug.has(slug),
    ).map((slug) => bySlug.get(slug)!);

    if (!query.trim()) return ordered;
    const q = query.trim().toLowerCase();
    return ordered.filter((c) => c.name.toLowerCase().includes(q));
  }, [casinos, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        background:
          "linear-gradient(90deg, rgba(20, 28, 37, 0.8) 0%, rgba(20, 28, 37, 0.8) 100%)",
      }}
    >
      <div className="relative flex max-h-[80vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[22px] bg-white dark:bg-[#161C32]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-[#2a274e] dark:text-white">
            Choose a Casino to Review
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#97a1af] transition-colors hover:text-[#2a274e] dark:hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[#97a1af]"
            />
            <input
              type="text"
              placeholder="Search casinos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fb] pr-3 pl-9 text-sm text-[#2a274e] outline-none transition-colors placeholder:text-[#97a1af] focus:border-[#4F2DEC] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-[#97a1af] dark:focus:border-[#8E8EFF]"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {options.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#97a1af]">
              No casinos found
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {options.map((casino) => (
                <button
                  key={casino.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelect(casino.id);
                  }}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f8f9fb] p-3 transition-colors hover:border-[#4F2DEC]/30 hover:bg-[#f1f2f6] dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-[#8E8EFF]/30 dark:hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-[#242E4C]">
                    <CasinoLogo
                      slug={casino.slug}
                      name={casino.name}
                      logoUrl={casino.logoUrl}
                      size={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="w-full truncate text-center text-xs font-medium text-[#374151] dark:text-[#e5e7eb]">
                    {casino.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
