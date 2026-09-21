"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type MarketValueInfoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function MarketValueInfoModal({ open, onClose }: MarketValueInfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[10px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[rgba(42,39,78,0.15)] bg-gradient-to-br from-[#1a1f3a] via-[#0e111b] to-[#0a0d15] p-8 shadow-2xl backdrop-blur-[35.5px] dark:border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[rgba(42,39,78,0.4)] transition-colors hover:text-[#2a274e] dark:text-white/40 dark:hover:text-white"
        >
          ✕
        </button>
        <h2 className="mb-8 text-3xl font-bold text-[#2a274e] dark:text-white">
          How Market Value is Calculated
        </h2>
        <div className="space-y-5">
          <div className="nd-gradient-border rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-[20px]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.8)] dark:text-white/80">
              Base Components
            </h3>
            <div className="space-y-3 text-sm">
              {[
                ["Streamer Pay (75%)", "7.5x monthly payment", "#a78bfa"],
                ["Top 5 Wager (8%)", "20% of Top 5 Wager", "#06b6d4"],
                ["Leaderboard (9%)", "15x monthly amount", "#10b981"],
                ["Avg Viewers (6%)", "$200 per viewer", "#fbbf24"],
                ["Peak Viewers (2%)", "$25 per peak viewer", "#f59e0b"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {label}
                  </span>
                  <span className="font-semibold" style={{ color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="nd-gradient-border rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-[20px]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.8)] dark:text-white/80">
              Penalties
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[rgba(42,39,78,0.7)] dark:text-white/70">
                  Loyalty Penalty
                </span>
                <span className="font-semibold text-[#ff6b6b]">
                  -2% per switch in last 12 mo (max 3)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[rgba(42,39,78,0.7)] dark:text-white/70">
                  Non-English Penalty
                </span>
                <span className="font-semibold text-[#ff6b6b]">-30% reduction</span>
              </div>
            </div>
          </div>
          <p className="pt-2 text-xs text-[rgba(42,39,78,0.4)] dark:text-white/40">
            Market Value is updated daily and represents the estimated annual deal
            value based on streaming activity, audience, and engagement metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-full bg-gradient-to-r from-[#8874ff] to-[#6366f1] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
