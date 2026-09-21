"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { BestRatedCasinos } from "@/components/reviews/best-rated-casinos";
import { CasinoPickerModal } from "@/components/reviews/casino-picker-modal";
import { LatestReviewsSection } from "@/components/reviews/latest-reviews-section";
import { MostHelpfulReviews } from "@/components/reviews/most-helpful-reviews";
import { RatingBreakdown } from "@/components/reviews/rating-breakdown";
import { ReviewRewardsModal } from "@/components/reviews/review-rewards-modal";
import { ReviewRewardsPausedModal } from "@/components/reviews/review-rewards-paused-modal";
import { ReviewsHero } from "@/components/reviews/reviews-hero";
import { SentimentByCasino } from "@/components/reviews/sentiment-by-casino";
import { TopicInsightsSection } from "@/components/reviews/topic-insights";
import {
  SeoPostsDetails,
  SeoProseDetails,
  type SeoPostItem,
} from "@/components/seo/seo-details";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";
import {
  REVIEW_REWARDS_PAUSED,
  REVIEWABLE_CASINO_SLUGS,
} from "@/lib/reviews/constants";
import type {
  ReviewCasino,
  ReviewItem,
  ReviewMarketRow,
  ReviewStats,
  TopicInsightsPayload,
} from "@/lib/reviews/data";

export type ReviewsViewProps = {
  initialCasinos?: ReviewCasino[];
  initialLatestReviews?: ReviewItem[];
  initialTopReviews?: ReviewItem[];
  initialReviewStats?: ReviewStats | null;
  initialMarketData?: ReviewMarketRow[];
  initialReviewSample?: ReviewItem[];
  initialTopicInsights?: TopicInsightsPayload | null;
  seoHeading?: string;
  seoHtml?: string;
  seoPosts?: SeoPostItem[];
  seoPostsHeading?: string;
};

function marketKey(name: string) {
  return name.toLowerCase().replace(/[-\s]/g, "");
}

/** Port of reference `ReviewsView` (+ page-level SeoProseDetails below). */
export function ReviewsView({
  initialCasinos = [],
  initialLatestReviews = [],
  initialTopReviews = [],
  initialReviewStats = null,
  initialMarketData = [],
  initialReviewSample = [],
  initialTopicInsights = null,
  seoHeading,
  seoHtml,
  seoPosts,
  seoPostsHeading = "Related posts",
}: ReviewsViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useAuthModal();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [pausedOpen, setPausedOpen] = useState(false);

  const volumeByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of initialMarketData) {
      map.set(marketKey(row.casinoName), row.depositVolume);
    }
    return map;
  }, [initialMarketData]);

  console.log(initialCasinos, 'initialCasinos')
  const reviewableCasinos = useMemo(() => {
    const filtered = initialCasinos.filter(
      (casino) =>
        REVIEWABLE_CASINO_SLUGS.has(casino.slug) &&
        (casino.logoUrl || getCasinoLogoUrl(casino.slug, "light")),
    );
    const seen = new Set<string>();
    return filtered
      .filter((casino) => {
        const key = casino.slug.replace(/-/g, "").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const left = volumeByName.get(marketKey(a.name)) ?? 0;
        const right = volumeByName.get(marketKey(b.name)) ?? 0;
        return right - left;
      });
  }, [initialCasinos, volumeByName]);

  const onWriteReview = useCallback(() => {
    if (isAuthenticated) setPickerOpen(true);
    else openLoginModal();
  }, [isAuthenticated, openLoginModal]);

  const onViewRewards = useCallback(() => {
    if (REVIEW_REWARDS_PAUSED) setPausedOpen(true);
    else setRewardsOpen(true);
  }, []);

  const onSelectCasino = useCallback(
    (casinoId: string) => {
      const casino = reviewableCasinos.find((c) => c.id === casinoId);
      if (casino) router.push(`/${casino.slug}/reviews`);
    },
    [reviewableCasinos, router],
  );

  return (
    <main className="flex flex-col gap-6 px-4 pt-6 pb-6 md:px-6">
      <ReviewsHero
        onWriteReview={onWriteReview}
        onViewRewards={onViewRewards}
      />
      <BestRatedCasinos
        casinos={initialCasinos}
        marketData={initialMarketData}
      />
      <LatestReviewsSection
        reviews={initialLatestReviews}
        onWriteReview={onWriteReview}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[347px_minmax(0,1fr)] lg:gap-6">
        <RatingBreakdown
          stats={initialReviewStats}
          casinos={reviewableCasinos}
          sampleReviews={initialReviewSample}
        />
        <MostHelpfulReviews reviews={initialTopReviews} />
      </div>
      <TopicInsightsSection
        topics={initialTopicInsights?.topics ?? []}
        onWriteReview={onWriteReview}
      />
      <SentimentByCasino
        casinos={reviewableCasinos}
        sentiment={initialTopicInsights?.casinos ?? []}
      />

      {seoHeading && seoHtml ? (
        <SeoProseDetails heading={seoHeading} html={seoHtml} />
      ) : null}

      {seoPosts && seoPosts.length > 0 ? (
        <SeoPostsDetails heading={seoPostsHeading} items={seoPosts} />
      ) : null}

      <CasinoPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        casinos={reviewableCasinos}
        onSelect={onSelectCasino}
      />
      <ReviewRewardsModal
        isOpen={rewardsOpen}
        onClose={() => setRewardsOpen(false)}
      />
      <ReviewRewardsPausedModal
        isOpen={pausedOpen}
        onClose={() => setPausedOpen(false)}
      />
    </main>
  );
}
