"use client";

import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { ReviewCard } from "@/components/reviews/review-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReviewItem } from "@/lib/reviews/data";

const REVIEWS_PER_PAGE = 6;

export type LatestReviewsSectionProps = {
  /** Reference `I({ reviews: e, onWriteReview: a })`. */
  reviews: ReviewItem[];
  onWriteReview: () => void;
};

/**
 * Port of reference Latest Reviews (`I`, 2r76wpg-cls11.js L643–744).
 * Cards use reference `D` via `ReviewCard`.
 */
export function LatestReviewsSection({
  reviews,
  onWriteReview,
}: LatestReviewsSectionProps) {
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  if (reviews.length === 0) return null;

  const pageCount = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  return (
    <Card variant="panel" blur>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            Latest Reviews
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={onWriteReview}>
              Write a Review
            </Button>
            <Button
              variant="ghost"
              theme="auto"
              size="sm"
              rightIcon={<ArrowUpRight />}
              onClick={() => {
                setExpanded((value) => !value);
                setPage(0);
              }}
            >
              {expanded ? "Show Less" : "View All"}
            </Button>
          </div>
        </div>

        {expanded ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div
            ref={scrollerRef}
            onScroll={() => {
              const el = scrollerRef.current;
              if (!el) return;
              const nextPage = Math.round(el.scrollLeft / el.clientWidth);
              if (nextPage !== page) setPage(nextPage);
            }}
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
          >
            {Array.from({ length: pageCount }).map((_, pageIndex) => (
              <div
                key={pageIndex}
                className="grid w-full shrink-0 snap-start content-start grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-6"
              >
                {reviews
                  .slice(
                    REVIEWS_PER_PAGE * pageIndex,
                    REVIEWS_PER_PAGE * pageIndex + REVIEWS_PER_PAGE,
                  )
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
              </div>
            ))}
          </div>
        )}

        {!expanded && pageCount > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-1">
            {Array.from({ length: pageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Page ${index + 1}`}
                onClick={() =>
                  scrollerRef.current?.scrollTo({
                    left: index * scrollerRef.current.clientWidth,
                    behavior: "smooth",
                  })
                }
                className={`h-2 rounded-full transition-all ${
                  index === page
                    ? "w-5 bg-[#8874ff]"
                    : "w-2 bg-[#2a274e]/20 hover:bg-[#2a274e]/35 dark:bg-white/20 dark:hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
