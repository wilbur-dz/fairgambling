"use client";

import { useMemo, type ReactNode } from "react";
import { AnalyzeYourSeedSection } from "@/components/home/analyze-your-seed-section";
import { AffiliateRewards } from "@/components/home/affiliate-rewards";
import { CodeDropFeed } from "@/components/home/code-drop-feed";
import { ComplaintsSnapshot } from "@/components/home/complaints-snapshot";
import { ExploreOurTools } from "@/components/home/explore-our-tools";
import { HighRollerOffer } from "@/components/home/high-roller-offer";
import { HomeActivityTabs } from "@/components/home/home-activity-tabs";
import { HomeAnalyticsCard } from "@/components/home/home-analytics-card";
import { HomeHero } from "@/components/home/home-hero";
import { LatestContent } from "@/components/home/latest-content";
import { LatestReviews } from "@/components/home/latest-reviews";
import { LeaderboardPreview } from "@/components/home/leaderboard-preview";
import { TopRatedCasinos } from "@/components/home/top-rated-casinos";
import { TransparencyNotice } from "@/components/home/transparency-notice";
import {
  MOCK_COMPLAINT_STATS,
  computeHomeAnalytics,
  type CodeDropOffer,
  type ComplaintGlobalStats,
  type ContentTeaser,
  type DepositFeedRow,
  type HomeBundle,
  type HomeReview,
  type HomeTool,
  type LeaderboardPayload,
  type LiveBetRow,
  type RatingsMap,
} from "@/lib/home/data";

export { HomeHero };
export { HomeAnalyticsCard };
export { TransparencyNotice };
export { AnalyzeYourSeedSection };
export { TopRatedCasinos };
export { LatestReviews };
export { ExploreOurTools };
export { CodeDropFeed };
export { ComplaintsSnapshot };
export { LatestContent };
export { HighRollerOffer };
export { AffiliateRewards };
export { LeaderboardPreview };
export { HomeActivityTabs };

export type HomeViewProps = {
  bundle: HomeBundle | null;
  reviews: HomeReview[];
  leaderboard: LeaderboardPayload | null;
  ratingsMap?: RatingsMap;
  complaintStats?: ComplaintGlobalStats | null;
  codes?: CodeDropOffer[];
  content?: ContentTeaser[];
  tools?: HomeTool[];
  liveBets?: LiveBetRow[];
  deposits?: DepositFeedRow[];
};

/** Port of reference `HomeView` composition. */
export function HomeView({
  bundle,
  reviews,
  leaderboard,
  ratingsMap = {},
  complaintStats = MOCK_COMPLAINT_STATS,
  codes,
  content,
  tools,
  liveBets,
  deposits,
}: HomeViewProps) {
  const analytics = useMemo(
    () =>
      bundle
        ? computeHomeAnalytics(bundle.breakdown30d, bundle.breakdown7d)
        : null,
    [bundle],
  );
  const casinos = bundle?.casinos ?? [];

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:gap-8 md:px-6">
      <HomeHero />
      <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-[7fr_5fr]">
        <HomeAnalyticsCard data={analytics} />
        <TransparencyNotice />
      </div>
      <AnalyzeYourSeedSection />
      <div className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-[584fr_480fr]">
        <TopRatedCasinos casinos={casinos} ratingsMap={ratingsMap} />
        <LatestReviews reviews={reviews} />
      </div>
      <ExploreOurTools tools={tools} />
      <CodeDropFeed codes={codes} />
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <ComplaintsSnapshot stats={complaintStats} />
        <LatestContent items={content} />
      </div>
      <HighRollerOffer />
      <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
        <AffiliateRewards />
        <LeaderboardPreview payload={leaderboard} />
      </div>
      <HomeActivityTabs
        liveBets={liveBets}
        deposits={deposits}
        leaderboardEntries={leaderboard?.entries}
      />
    </main>
  );
}

/** Tiny helper for typed section docs / future data loaders. */
export function HomeModuleNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-[#637083]" data-home-module-note="">
      {children}
    </p>
  );
}
