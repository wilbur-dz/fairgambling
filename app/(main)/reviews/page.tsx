import { ReviewsView } from "@/components/reviews/reviews-view";
import { loadReviewsPageData } from "@/lib/reviews/loaders";
import {
  REVIEWS_SEO_HEADING,
  REVIEWS_SEO_POSTS,
  loadReviewsSeoHtml,
} from "@/lib/reviews/seo-content";

/**
 * Reviews page — composition matches reference `ReviewsView`
 * + SeoProseDetails below the interactive sections.
 */
export default async function ReviewsPage() {
  const [data, seoHtml] = await Promise.all([
    loadReviewsPageData(),
    loadReviewsSeoHtml(),
  ]);

  return (
    <ReviewsView
      initialCasinos={data.casinos}
      initialLatestReviews={data.latestReviews}
      initialTopReviews={data.topReviews}
      initialReviewStats={data.reviewStats}
      initialMarketData={data.marketData}
      initialReviewSample={data.reviewSample}
      initialTopicInsights={data.topicInsights}
      seoHeading={REVIEWS_SEO_HEADING}
      seoHtml={seoHtml}
      seoPosts={REVIEWS_SEO_POSTS}
    />
  );
}
