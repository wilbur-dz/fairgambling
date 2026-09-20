import { HomeView } from "@/components/home/home-view";
import { MOCK_CONTENT } from "@/lib/home/data";
import { loadHomePageData } from "@/lib/home/loaders";

/**
 * Home page — composition matches reference `HomeView`.
 * Server loaders hit FairGambling API; mocks are fallback only.
 * See `/HOME_MODULES.md` for per-module data sources.
 */
export default async function HomePage() {
  const {
    bundle,
    reviews,
    leaderboard,
    ratingsMap,
    codes,
    complaintStats,
    liveBets,
    deposits,
  } = await loadHomePageData();

  return (
    <HomeView
      bundle={bundle}
      reviews={reviews}
      leaderboard={leaderboard}
      ratingsMap={ratingsMap}
      complaintStats={complaintStats}
      codes={codes}
      content={MOCK_CONTENT}
      liveBets={liveBets}
      deposits={deposits}
    />
  );
}
