import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { fetchCurrentLeaderboard } from "@/lib/leaderboard/api";

/**
 * Leaderboard page — loads `GET /api/leaderboard/current?limit=20&offset=0`.
 * Past period loads on demand via `GET /api/leaderboard/past?limit=40`.
 */
export default async function LeaderboardPage() {
  let initialData = null;
  try {
    initialData = await fetchCurrentLeaderboard({ offset: 0 });
  } catch (err) {
    console.error(
      "[leaderboard]",
      err instanceof Error ? err.message : String(err),
    );
  }

  return <LeaderboardView initialData={initialData} />;
}
