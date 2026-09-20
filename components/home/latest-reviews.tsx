"use client";

import Link from "next/link";
import { ArrowUpRight, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useRef, useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HomeReview } from "@/lib/home/data";
import {
  formatRelativeTime,
  reviewPermalink,
  stripReviewHtml,
} from "@/lib/reviews/format";

function ReviewTeaserCard({ review }: { review: HomeReview }) {
  const helpful = review.votes?.helpful ?? 0;
  const notHelpful = review.votes?.notHelpful ?? 0;
  const bodyText =
    stripReviewHtml(review.body ?? "") ||
    review.excerpt?.trim() ||
    review.title ||
    "";

  return (
    <Card
      variant="glass"
      theme="auto"
      contentClassName="flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <AnalyticsCasinoIcon
            casinoName={review.casinoName ?? ""}
            size={24}
            theme="auto"
          />
          <span className="truncate text-sm font-semibold text-[#2a274e] dark:text-white">
            {review.casinoName ?? "Casino"}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm">
          <Star size={14} className="text-[#FFCF2F]" fill="currentColor" />
          <span className="font-medium text-[#2a274e] dark:text-white">
            {review.rating ?? 0}
          </span>
          <span className="text-[#2a274e]/40 dark:text-white/40">/ 5</span>
        </span>
      </div>
      <p className="line-clamp-1 text-[13px] text-[#2a274e]/60 dark:text-white/60">
        {bodyText}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-3 text-[12px] text-[#2a274e]/40 dark:text-white/40">
          <span suppressHydrationWarning>
            {formatRelativeTime(review.createdAt)}
          </span>
          <Link
            href={reviewPermalink(review.casinoSlug, review.id)}
            className="font-medium text-[#8874ff] underline-offset-2 hover:underline"
          >
            View full review
          </Link>
        </span>
        <span className="flex items-center gap-3 text-[12px] text-[#2a274e]/40 dark:text-white/40">
          <span className="flex items-center gap-1">
            <ThumbsUp
              size={13}
              className={
                helpful > 0 ? "text-[#1f9d57] dark:text-[#00ff86]" : ""
              }
            />
            {helpful}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown size={13} />
            {notHelpful}
          </span>
        </span>
      </div>
    </Card>
  );
}

/** `_` — Latest reviews snap carousel (3 per page). */
export function LatestReviews({ reviews }: { reviews: HomeReview[] }) {
  const items = (Array.isArray(reviews) ? reviews : []).slice(0, 9);
  const pageCount = Math.max(1, Math.ceil(items.length / 3));
  const [page, setPage] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="h-full w-full"
      contentClassName="flex h-full flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          Latest Reviews
        </h2>
        <div className="flex items-center gap-2">
          <Link href="/reviews">
            <Button variant="primary" size="sm">
              Write a Review
            </Button>
          </Link>
          <Link href="/reviews">
            <Button
              variant="ghost"
              theme="auto"
              size="sm"
              rightIcon={<ArrowUpRight />}
            >
              View All
            </Button>
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={() => {
          const el = scrollerRef.current;
          if (!el) return;
          const next = Math.round(el.scrollLeft / el.clientWidth);
          if (next !== page) setPage(next);
        }}
        className="scrollbar-hide flex flex-1 snap-x snap-mandatory overflow-x-auto"
      >
        {Array.from({ length: pageCount }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            className="flex w-full shrink-0 snap-center flex-col justify-between gap-3"
          >
            {items.slice(pageIndex * 3, pageIndex * 3 + 3).map((review) => (
              <ReviewTeaserCard key={review.id} review={review} />
            ))}
          </div>
        ))}
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-1">
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              onClick={() =>
                scrollerRef.current?.scrollTo({
                  left: pageIndex * scrollerRef.current.clientWidth,
                  behavior: "smooth",
                })
              }
              aria-label={`Page ${pageIndex + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                pageIndex === page
                  ? "w-5 bg-[#8874ff]"
                  : "w-1.5 bg-[#2a274e]/20 hover:bg-[#2a274e]/35 dark:bg-white/20 dark:hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </Card>
  );
}
