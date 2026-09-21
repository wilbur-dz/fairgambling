"use client";

import { useEffect, useState } from "react";
import { EntriesTable } from "@/components/leaderboard/entries-table";
import { Modal } from "@/components/ui/modal";
import { fetchPastLeaderboardClient } from "@/lib/leaderboard/api";
import type { LeaderboardPayload } from "@/lib/leaderboard/data";

type PastLeaderboardModalProps = {
  open: boolean;
  onClose: () => void;
  onUsernameClick?: (username: string) => void;
};

/**
 * Past leaderboard dialog — `GET /api/leaderboard/past?limit=40`.
 * UI matches mock/3 (title + periodLabel + entries table with prizes).
 */
export function PastLeaderboardModal({
  open,
  onClose,
  onUsernameClick,
}: PastLeaderboardModalProps) {
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Keep previous data while refetching so reopen feels instant.
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchPastLeaderboardClient(40)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load past leaderboard",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const title = (
    <span className="flex flex-col" role="heading" aria-level={2}>
      <span className="truncate text-base font-semibold text-[#2a274e] dark:text-white">
        Past Leaderboard
      </span>
      {data?.periodLabel ? (
        <span className="mt-0.5 truncate text-[11px] font-normal text-[rgba(42,39,78,0.5)] sm:text-xs dark:text-white/50">
          {data.periodLabel}
        </span>
      ) : null}
    </span>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeButton
      padded={false}
      className="max-w-[920px]"
      ariaLabel="Past Leaderboard"
    >
      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(42,39,78,0.15)] border-t-[#8874ff] dark:border-white/20" />
        </div>
      ) : error && !data ? (
        <p className="py-10 text-center text-sm text-[rgba(42,39,78,0.55)] dark:text-white/50">
          {error}
        </p>
      ) : data && data.entries.length > 0 ? (
        <EntriesTable
          entries={data.entries}
          showPrize
          currentUser={data.currentUser ?? null}
          onUsernameClick={onUsernameClick}
        />
      ) : (
        <p className="py-10 text-center text-sm text-[rgba(42,39,78,0.55)] dark:text-white/50">
          No past leaderboard data yet.
        </p>
      )}
    </Modal>
  );
}
