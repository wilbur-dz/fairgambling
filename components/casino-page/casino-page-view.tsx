import { Suspense } from "react";
import { CasinoBackLink } from "@/components/casino-page/casino-back-link";
import { CasinoProfile } from "@/components/casino-page/casino-profile";
import {
  CasinoTabPlaceholder,
  CasinoTabs,
} from "@/components/casino-page/casino-tabs";
import { ComplaintsTab } from "@/components/casino-page/complaints-tab";
import { ReviewsTab } from "@/components/casino-page/reviews-tab";
import { CasinoRatingContent } from "@/components/casino-page/rating-content";
import { RatingBreakdown } from "@/components/casino-page/rating-breakdown";
import {
  SectionNav,
  SectionNavMobile,
} from "@/components/casino-page/section-nav";
import {
  CASINO_PAGE_SECTIONS,
  type CasinoPageData,
} from "@/lib/casinos/casino-page";
import { casinoRouteSlug } from "@/lib/reviews/format";

type CasinoPageViewProps = {
  data: CasinoPageData;
};

/**
 * Casino detail page shell — matches reference layout:
 * sticky SectionNav + SectionNavMobile + CasinoProfile + RatingBreakdown + CasinoTabs.
 */
// todo: 接口都不对
export function CasinoPageView({ data }: CasinoPageViewProps) {
  const {
    casino,
    rating,
    stats,
    promotionsCount,
    reviewHtml,
    analytics,
    hotWallet,
    initialCasinoReviews,
    initialCasinoReviewsTotalPages,
    pinnedReview,
  } = data;
  const ratingScore = rating?.totalScore ?? null;
  const reviewAvg = stats.averageRating;
  const reviewCount = stats.reviewCount;
  const complaintsCount = stats.complaintCount;

  return (
    <main className="flex flex-col gap-4 px-4 pb-6 pt-6 md:gap-6 md:px-6">
      <Suspense fallback={null}>
        <CasinoBackLink />
      </Suspense>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden lg:sticky lg:top-6 lg:block lg:w-[280px] lg:shrink-0">
          <SectionNav sections={CASINO_PAGE_SECTIONS} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <SectionNavMobile
            sections={CASINO_PAGE_SECTIONS}
            className="lg:hidden"
          />

          <CasinoProfile casino={casino} rating={rating} />

          <RatingBreakdown casino={casino} rating={rating} />

          <CasinoTabs
            ratingScore={ratingScore}
            reviewAvg={reviewAvg}
            reviewCount={reviewCount}
            complaintsCount={complaintsCount}
            promotionsCount={promotionsCount}
            ratingContent={
              <CasinoRatingContent
                casino={casino}
                rating={rating}
                reviewAvg={reviewAvg}
                reviewCount={reviewCount}
                reviewHtml={reviewHtml}
                analytics={analytics}
                hotWallet={hotWallet}
              />
            }
            reviewsContent={
              // todo: 使用的接口不对
              <ReviewsTab
                casino={casino}
                stats={stats}
                viewAllHref={`/${casinoRouteSlug(casino.slug)}/reviews`}
                pinnedReview={pinnedReview}
                initialReviews={initialCasinoReviews}
                initialTotalPages={initialCasinoReviewsTotalPages}
              />
            }
            complaintsContent={
              <ComplaintsTab
                slug={casino.slug}
                name={casino.name}
                casinoId={casino.id}
                showSummary
                complaintCount={complaintsCount}
                openComplaintCount={stats.openComplaintCount}
              />
            }
            promotionsContent={
              <CasinoTabPlaceholder
                title="Promotions"
                body={
                  promotionsCount > 0
                    ? `${promotionsCount} bonus types tracked in the rating breakdown.`
                    : "No live promotions loaded for this casino yet."
                }
                href="/livecodes"
                hrefLabel="Browse Live Codes →"
              />
            }
          />
        </div>
      </div>
    </main>
  );
}
