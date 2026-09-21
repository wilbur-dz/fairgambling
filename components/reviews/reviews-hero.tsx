"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const COINS = ["BTC", "ETH", "USDT", "SOL", "TRON"] as const;

type ReviewsHeroProps = {
  onWriteReview: () => void;
  onViewRewards: () => void;
};

/** Port of reference hero (`n`). */
export function ReviewsHero({
  onWriteReview,
  onViewRewards,
}: ReviewsHeroProps) {
  return (
    <Card
      variant="glass"
      padded={false}
      className="md:min-h-[231px]"
      contentClassName="relative flex items-center md:min-h-[231px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-80px] z-0 hidden h-[344px] w-[465px] -translate-y-1/2 bg-[linear-gradient(180deg,rgba(209,213,219,0.5)_0%,rgba(156,163,175,0.5)_100%)] md:block dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5)_0%,rgba(52,0,107,0.5)_100%)]"
        style={{ filter: "blur(90px)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/CasinoReviewsRightHero.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-0 right-0 z-[1] hidden h-full w-auto object-right md:block dark:hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, #000 45%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 45%)",
        }}
      />
      <div className="hidden dark:contents">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/casinoReviewsBanner.svg"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute top-0 right-0 z-[1] hidden h-full w-auto object-right md:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-1/2 md:block"
          style={{
            background: "linear-gradient(90deg, #0f1424 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex max-w-[507px] flex-col gap-6 p-4 md:gap-8 md:p-6">
        <div className="flex flex-col gap-4 md:gap-6">
          <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            See Verified Player Reviews
          </h2>
          <p className="max-w-[459px] text-[16px] leading-normal text-[#2a274e]/80 dark:text-white/80">
            Real player reviews. Verified.
            <br />
            Transparency powered by the community.
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="primary"
            size="md"
            className="h-[42px] flex-1 justify-center md:w-[160px] md:flex-none"
            onClick={onViewRewards}
          >
            View Rewards
          </Button>
          <Button
            variant="ghost"
            theme="auto"
            size="md"
            className="h-[42px] flex-1 justify-center md:w-[160px] md:flex-none"
            onClick={onWriteReview}
          >
            Write a Review
          </Button>
          <div className="hidden items-center -space-x-1.5 sm:flex">
            {COINS.map((coin, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={coin}
                src={`/logos/coins/${coin}.svg`}
                alt={coin}
                className="size-7 rounded-full"
                style={{ zIndex: COINS.length - index }}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="nd-gradient-border pointer-events-none absolute inset-0 z-20 hidden rounded-[20px] dark:block"
      />
    </Card>
  );
}
