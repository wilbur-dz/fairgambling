"use client";

import { useCallback, useState } from "react";
import { History } from "lucide-react";
import { LeaderboardBottomCta } from "@/components/leaderboard/bottom-cta";
import { EntriesTable } from "@/components/leaderboard/entries-table";
import { HowItWorks } from "@/components/leaderboard/how-it-works";
import { LeaderboardHero } from "@/components/leaderboard/leaderboard-hero";
import { PastLeaderboardModal } from "@/components/leaderboard/past-leaderboard-modal";
import { PeriodHeader } from "@/components/leaderboard/period-header";
import { SupportedSites } from "@/components/leaderboard/supported-sites";
import { ProfilePopup } from "@/components/profile/profile-popup";
import {
  canLoadMore,
  fetchCurrentLeaderboardClient,
  LEADERBOARD_PAGE_SIZE,
} from "@/lib/leaderboard/api";
import type { LeaderboardPayload } from "@/lib/leaderboard/data";

export type LeaderboardViewProps = {
  /** SSR / initial `GET …/current?limit=20&offset=0` payload. */
  initialData: LeaderboardPayload | null;
};

/**
 * Leaderboard page composition — live `current` API with offset pagination.
 */
export function LeaderboardView({ initialData }: LeaderboardViewProps) {
  const [pastOpen, setPastOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [entries, setEntries] = useState(initialData?.entries ?? []);
  const [currentUser, setCurrentUser] = useState(
    initialData?.currentUser ?? null,
  );
  const [hasMore, setHasMore] = useState(
    canLoadMore(
      initialData?.entries.length ?? 0,
      initialData?.entries.length ?? 0,
    ),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [error] = useState<string | null>(
    initialData ? null : "Couldn't load the leaderboard. Refresh and try again.",
  );

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const offset = entries.length;
      const page = await fetchCurrentLeaderboardClient(offset);
      setEntries((prev) => [...prev, ...page.entries]);
      if (page.currentUser !== undefined) {
        setCurrentUser(page.currentUser);
      }
      const nextCount = offset + page.entries.length;
      setHasMore(canLoadMore(nextCount, page.entries.length));
    } catch {
      // Keep existing rows; button stays available for retry.
    } finally {
      setLoadingMore(false);
    }
  }, [entries.length, hasMore, loadingMore]);

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <div className="flex w-full flex-col gap-6">
        <LeaderboardHero />
        <HowItWorks />
        <PeriodHeader />

        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPastOpen(true)}
              className="flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-[rgba(42,39,78,0.5)] underline-offset-2 transition-colors hover:text-[#6b56e0] hover:underline dark:text-white/50 dark:hover:text-[#8874ff]"
            >
              <History size={11} />
              View past leaderboard
            </button>
          </div>

          {error && entries.length === 0 ? (
            <div className="rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-6 py-10 text-center text-sm text-[rgba(42,39,78,0.55)] dark:border-0 dark:bg-[#0f1424] dark:text-white/50">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-6 py-10 text-center text-sm text-[rgba(42,39,78,0.55)] dark:border-0 dark:bg-[#0f1424] dark:text-white/50">
              Leaderboard updating…
            </div>
          ) : (
            <EntriesTable
              entries={entries}
              showPrize
              currentUser={currentUser}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={onLoadMore}
              onUsernameClick={setProfileUsername}
            />
          )}
        </div>

        <SupportedSites />
        <LeaderboardBottomCta />
      </div>

      <PastLeaderboardModal
        open={pastOpen}
        onClose={() => setPastOpen(false)}
        onUsernameClick={setProfileUsername}
      />

      {profileUsername ? (
        <ProfilePopup
          username={profileUsername}
          onClose={() => setProfileUsername(null)}
        />
      ) : null}
    </main>
  );
}

export { LEADERBOARD_PAGE_SIZE };
