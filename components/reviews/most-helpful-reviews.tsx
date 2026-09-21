"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ReviewCard,
  type ReviewBadge,
} from "@/components/reviews/review-card";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import type { ReviewItem } from "@/lib/reviews/data";

const TABS = [
  { id: "helpful", label: "Helpful" },
  { id: "critical", label: "Critical" },
];

function PageNav({
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
}) {
  const btn = (enabled: boolean) =>
    `flex size-7 items-center justify-center rounded-full text-[#2a274e] transition-colors dark:text-white ${
      enabled
        ? "hover:bg-[#2a274e]/[0.06] dark:hover:bg-white/10"
        : "cursor-default opacity-50"
    }`;

  return (
    <div className="flex items-center gap-1.5 rounded-[50px] border-[0.5px] border-[#2a274e]/15 bg-white/[0.4] p-1 backdrop-blur-[35.5px] dark:border-white/20 dark:bg-white/[0.01]">
      <button
        type="button"
        aria-label="Previous"
        disabled={!canPrev}
        onClick={onPrev}
        className={btn(canPrev)}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        aria-label="Next"
        disabled={!canNext}
        onClick={onNext}
        className={btn(canNext)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/** Port of reference Most Helpful (`U`). */
export function MostHelpfulReviews({ reviews }: { reviews: ReviewItem[] }) {
  const [tab, setTab] = useState("helpful");
  const [page, setPage] = useState(0);

  const tagged = useMemo(
    () =>
      reviews.map((review) => ({
        review,
        badge: ((review.rating ?? 0) <= 2
          ? "critical"
          : "helpful") as ReviewBadge,
      })),
    [reviews],
  );

  const filtered = useMemo(
    () =>
      tab === "critical"
        ? tagged.filter((row) => row.badge === "critical")
        : tagged,
    [tagged, tab],
  );

  if (reviews.length === 0) return null;

  const pageCount = Math.max(1, Math.ceil(filtered.length / 4));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * 4, safePage * 4 + 4);

  return (
    <Card variant="panel" blur className="h-full">
      <div className="flex h-full flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between gap-2 md:gap-3">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <h2 className="shrink-0 text-[16px] font-medium text-[#2a274e] md:text-[18px] dark:text-white">
              Most Helpful
            </h2>
            <Tabs
              theme="auto"
              tabs={TABS}
              activeId={tab}
              onChange={(id) => {
                setTab(id);
                setPage(0);
              }}
              size="sm"
              sizeConfig={{ paddingX: 10 }}
            />
          </div>
          <div className="shrink-0">
            <PageNav
              canPrev={safePage > 0}
              canNext={safePage < pageCount - 1}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            />
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-6">
            {visible.map((row) => (
              <ReviewCard
                key={row.review.id}
                review={row.review}
                badge={row.badge}
                bodyLines={3}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center py-8 text-[14px] text-[#2a274e]/40 md:py-10 dark:text-white/40">
            No critical reviews yet.
          </div>
        )}
      </div>
    </Card>
  );
}
