"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Clock,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import {
  CasinoReviewCard,
  ReviewStars,
} from "@/components/casino-page/casino-review-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { Tabs } from "@/components/ui/tabs";
import type { CasinoDetail, CasinoPageStats } from "@/lib/casinos/casino-page";
import { hasVerifyPath } from "@/lib/reviews/constants";
import type { RatingDistribution, ReviewItem } from "@/lib/reviews/data";
import {
  type CasinoReviewSort,
  getCasinoReviews,
  getMyReviewForCasino,
} from "@/lib/reviews/casino-reviews";
import { casinoRouteSlug } from "@/lib/reviews/format";

const SORT_TABS: Array<{
  value: CasinoReviewSort;
  label: string;
  Icon: typeof Star;
}> = [
  { value: "helpful", label: "Most Helpful", Icon: Star },
  { value: "rating_high", label: "Highest Rating", Icon: ThumbsUp },
  { value: "rating_low", label: "Lowest Rating", Icon: ThumbsDown },
  { value: "newest", label: "Newest", Icon: Clock },
];

const PER_PAGE_OPTIONS = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

function averageLabel(avg: number): string {
  if (avg >= 4.5) return "Excellent";
  if (avg >= 3.5) return "Good";
  if (avg >= 2.5) return "Average";
  if (avg >= 1.5) return "Poor";
  return "Very Poor";
}

function distributionFromReviews(
  reviews: ReviewItem[],
): RatingDistribution {
  const dist: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) {
    const star = Math.round(review.rating ?? 0);
    if (star >= 1 && star <= 5) dist[star as 1 | 2 | 3 | 4 | 5] += 1;
  }
  return dist;
}

type ReviewsTabProps = {
  casino: CasinoDetail;
  stats: CasinoPageStats;
  viewAllHref?: string | null;
  pinnedReview?: ReviewItem | null;
  initialReviews?: ReviewItem[] | null;
  initialTotalPages?: number | null;
};

/** Port of reference `ReviewsTab` (3gytcvcyv09c7.js 387–756). */
export function ReviewsTab({
  casino,
  stats,
  viewAllHref,
  pinnedReview = null,
  initialReviews = null,
  initialTotalPages = null,
}: ReviewsTabProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  const { openLoginModal } = useAuthModal();

  const hasInitial = initialReviews != null && initialReviews.length > 0;
  const seededRef = useRef(hasInitial);

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews ?? []);
  const [loading, setLoading] = useState(!hasInitial && Boolean(casino.id));
  const [sortBy, setSortBy] = useState<CasinoReviewSort>("helpful");
  const [ratingFilters, setRatingFilters] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(
    hasInitial ? (initialTotalPages ?? 1) : 1,
  );
  const [myReview, setMyReview] = useState<ReviewItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reviewCount = stats.reviewCount ?? reviews.length;
  const averageRating = stats.averageRating ?? 0;

  const distribution = useMemo(() => {
    if (stats.ratingDistribution) return stats.ratingDistribution;
    return distributionFromReviews(reviews);
  }, [stats.ratingDistribution, reviews]);

  const canVerify = hasVerifyPath(casino.slug);
  const viewAll =
    viewAllHref ?? `/${casinoRouteSlug(casino.slug)}/reviews`;

  useEffect(() => {
    if (!casino.id) return;
    if (seededRef.current) {
      seededRef.current = false;
      if (!isAuthenticated) return;
    }

    let cancelled = false;
    setLoading(true);

    getCasinoReviews(
      casino.id,
      casino.slug,
      {
        page,
        limit: perPage,
        status: "approved",
        sortBy,
        ratings: ratingFilters,
      },
      accessToken,
    )
      .then((result) => {
        if (cancelled) return;
        setReviews(result.data);
        setTotalPages(result.pagination.totalPages ?? 1);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    casino.id,
    casino.slug,
    sortBy,
    page,
    perPage,
    ratingFilters,
    refreshKey,
    isAuthenticated,
    accessToken,
  ]);

  useEffect(() => {
    if (!casino.id || !isAuthenticated) {
      setMyReview(null);
      return;
    }
    let cancelled = false;
    getMyReviewForCasino(casino.id, accessToken)
      .then((review) => {
        if (!cancelled) setMyReview(review);
      })
      .catch(() => {
        if (!cancelled) setMyReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [casino.id, isAuthenticated, accessToken, refreshKey]);

  const toggleRatingFilter = (star: number) => {
    setRatingFilters((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star],
    );
    setPage(1);
  };

  const onWriteReview = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    router.push("/reviews");
  };

  return (
    <div className="flex flex-col gap-4">
      {viewAll ? (
        <div className="flex justify-end">
          <Button
            theme="auto"
            variant="ghost"
            size="sm"
            rightIcon={<ArrowUpRight size={18} />}
            onClick={() => router.push(viewAll)}
          >
            View All
          </Button>
        </div>
      ) : null}

      <Card variant="panel" blur contentClassName="flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          <Card
            variant="glass"
            padded={false}
            className="w-full shrink-0 md:w-[220px]"
            contentClassName="flex flex-col items-center justify-center gap-3 px-4 py-7"
          >
            <ReviewStars filled={Math.round(averageRating)} size={22} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-center text-[20px] font-semibold text-[#2a274e] dark:text-white">
                {averageRating.toFixed(1)} – {averageLabel(averageRating)}
              </span>
              <span className="text-[13px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
                ({reviewCount.toLocaleString("en-US")}{" "}
                {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </Card>

          <div className="flex flex-1 flex-col justify-center gap-3">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = distribution[star];
              const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              const active = ratingFilters.includes(star);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => toggleRatingFilter(star)}
                  className="flex w-full items-center gap-3"
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                      active
                        ? "border-[#8E8EFF]/50 bg-[#8E8EFF]/20"
                        : "border-[rgba(42,39,78,0.2)] bg-white/[0.5] dark:border-white/25 dark:bg-white/[0.03]"
                    }`}
                  >
                    {active ? (
                      <Check size={11} className="text-[#8E8EFF]" />
                    ) : null}
                  </span>
                  <ReviewStars filled={star} size={14} />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(42,39,78,0.08)] dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#8E8EFF] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#2a274e] dark:text-white">
                    {count.toLocaleString("en-US")}
                  </span>
                  <span className="w-8 shrink-0 text-right text-[13px] tabular-nums text-[rgba(42,39,78,0.45)] dark:text-white/40">
                    {pct.toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:mx-0 md:max-w-full md:px-0">
            <Tabs
              theme="auto"
              size="sm"
              tabs={SORT_TABS.map(({ value, label, Icon }) => ({
                id: value,
                label,
                leftIcon: <Icon size={16} />,
              }))}
              activeId={sortBy}
              onChange={(id) => {
                setSortBy(id as CasinoReviewSort);
                setPage(1);
              }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start md:self-auto">
            {canVerify && myReview && !myReview.isVerified ? (
              <Button
                theme="auto"
                variant="ghost"
                size="sm"
                onClick={() => setRefreshKey((k) => k + 1)}
              >
                Verify Review
              </Button>
            ) : null}
            <Button
              theme="auto"
              variant="primary"
              size="sm"
              onClick={onWriteReview}
            >
              {myReview ? "Update Review" : "Write Review"}
            </Button>
          </div>
        </div>
      </Card>

      {pinnedReview ? (
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-[#8874ff]">
            Selected review
          </span>
          <CasinoReviewCard
            review={pinnedReview}
            casinoSlug={casino.slug}
            casinoName={casino.name}
            highlighted
          />
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[24px] border border-[rgba(42,39,78,0.1)] px-6 py-16 text-center text-[14px] text-[rgba(42,39,78,0.45)] dark:border-white/10 dark:text-white/40">
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-[24px] border border-[rgba(42,39,78,0.1)] px-6 py-16 text-center text-[14px] text-[rgba(42,39,78,0.45)] dark:border-white/10 dark:text-white/40">
          {ratingFilters.length > 0
            ? "No reviews for the selected rating."
            : "No reviews yet."}
        </div>
      ) : (
        reviews
          .filter((r) => r.id !== pinnedReview?.id)
          .map((review) => (
            <CasinoReviewCard
              key={review.id}
              review={review}
              casinoSlug={casino.slug}
              casinoName={casino.name}
              onVerify={
                canVerify && myReview && !myReview.isVerified
                  ? () => setRefreshKey((k) => k + 1)
                  : undefined
              }
            />
          ))
      )}

      {!loading ? (
        <div className="flex flex-col items-start gap-3 pt-2 text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[rgba(42,39,78,0.55)] dark:text-white/50">
              Per page
            </span>
            <Dropdown
              theme="auto"
              size="sm"
              options={PER_PAGE_OPTIONS}
              value={String(perPage)}
              onChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
            />
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            siblingCount={0}
            compact
            className="w-full justify-center sm:hidden"
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="hidden sm:flex"
          />
        </div>
      ) : null}
    </div>
  );
}
