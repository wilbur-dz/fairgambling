"use client";

import Link from "next/link";
import { ArrowRight, Trophy, X } from "lucide-react";
import { useEffect } from "react";

type ReviewRewardsPausedModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Port of reference Review Rewards Paused modal (`eu`). */
export function ReviewRewardsPausedModal({
  isOpen,
  onClose,
}: ReviewRewardsPausedModalProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl sm:border sm:border-[#e5e7eb] dark:bg-[#0D1120] dark:sm:border-white/[0.08]">
        <div className="flex items-start justify-between border-b border-[#e5e7eb] px-5 py-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F2DEC]/15 dark:bg-[#4F2DEC]/25">
              <Trophy size={20} className="text-[#4F2DEC] dark:text-[#8B7BF7]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-white">
                Review Rewards Paused
              </h2>
              <p className="mt-0.5 text-[12px] text-[#6b7280] dark:text-[#9ca3af]">
                Temporarily unavailable
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#4b5563] dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-[14px] leading-relaxed text-[#374151] dark:text-[#e5e7eb]">
            We&apos;re currently not rewarding new reviews. Existing pending and
            paid reward claims are unaffected. Check back later for updates.
          </p>
          <div className="rounded-[14px] border border-[#4F2DEC]/15 bg-[#4F2DEC]/[0.06] p-4 dark:border-[#4F2DEC]/20 dark:bg-[#4F2DEC]/[0.10]">
            <p className="text-[13px] font-semibold text-[#111827] dark:text-white">
              Still want to earn rewards?
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">
              Sign up to a casino under our affiliate code and earn wager-share
              commission, leaderboard prizes and bonus drops.
            </p>
            <Link
              href="/affiliate"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#4F2DEC] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(79,45,236,0.3)] transition-colors hover:bg-[#3D22BD] hover:shadow-[0_4px_20px_rgba(79,45,236,0.4)]"
            >
              Visit Extra Rewards Section
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
