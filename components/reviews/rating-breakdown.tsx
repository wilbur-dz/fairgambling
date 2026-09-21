"use client";

import { Star } from "lucide-react";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type {
  RatingDistribution,
  ReviewCasino,
  ReviewItem,
  ReviewStats,
} from "@/lib/reviews/data";

const BAR_COLORS: Record<number, string> = {
  5: "#5dc9c7",
  4: "#a09cfa",
  3: "#f5cc76",
  2: "#dd654b",
  1: "#ff6060",
};

type RatingBreakdownProps = {
  stats: ReviewStats | null;
  casinos: ReviewCasino[];
  sampleReviews: ReviewItem[];
};

/** Port of reference Rating Breakdown (`V`). */
export function RatingBreakdown({
  stats,
  casinos,
  sampleReviews,
}: RatingBreakdownProps) {
  const distribution = useMemo((): RatingDistribution => {
    if (stats?.ratingDistribution) return stats.ratingDistribution;
    const next: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const review of sampleReviews) {
      const stars = Math.round(review.rating ?? 0);
      if (stars >= 1 && stars <= 5) {
        next[stars as 1 | 2 | 3 | 4 | 5] += 1;
      }
    }
    return next;
  }, [stats, sampleReviews]);

  const sampleTotal =
    distribution[5] +
    distribution[4] +
    distribution[3] +
    distribution[2] +
    distribution[1];

  const totalReviews =
    stats?.totalReviews ??
    casinos.reduce((sum, c) => sum + (c.reviewCount ?? 0), 0) ??
    sampleTotal;

  const avgRating =
    stats?.avgRating ??
    (sampleTotal > 0
      ? (5 * distribution[5] +
          4 * distribution[4] +
          3 * distribution[3] +
          2 * distribution[2] +
          distribution[1]) /
        sampleTotal
      : 0);

  const filledStars = Math.round(avgRating);

  return (
    <Card
      variant="panel"
      blur
      className="h-auto lg:h-[476px]"
      contentClassName="h-full"
    >
      <div className="flex h-full flex-col justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            Rating Breakdown
          </h2>
          <div className="flex flex-col gap-3 md:gap-4">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const pct =
                sampleTotal > 0
                  ? (distribution[stars] / sampleTotal) * 100
                  : 0;
              return (
                <div key={stars} className="flex flex-col gap-2 md:gap-4">
                  <div className="flex items-center justify-between text-[14px] font-semibold leading-none text-[#2a274e] dark:text-white">
                    <span>{stars}</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full rounded-[100px] bg-[#2a274e]/10 dark:bg-white/10">
                    <div
                      className="h-[6px] rounded-[10px]"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: BAR_COLORS[stars],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="text-[42px] font-semibold leading-none text-[#2a274e] dark:text-white">
            {avgRating.toFixed(1)}
          </span>
          <div className="flex flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  className={
                    n <= filledStars
                      ? "text-[#FFCF2F]"
                      : "text-[#2a274e]/15 dark:text-white/15"
                  }
                  fill={n <= filledStars ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="text-[12px] font-medium leading-[16.5px] text-[#2a274e]/55 dark:text-[#97a1af]">
              Based on {totalReviews.toLocaleString()} reviews
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
