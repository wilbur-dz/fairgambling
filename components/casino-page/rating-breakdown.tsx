import Image from "next/image";
import { ScoreBreakdownTooltip } from "@/components/casino-page/score-breakdown-tooltip";
import { Card } from "@/components/ui/card";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CATEGORY_WEIGHTS,
} from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

type RatingBreakdownProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `RatingBreakdown` (module `986781`). */
export function RatingBreakdown({ casino, rating }: RatingBreakdownProps) {
  const scoreSoon = !!rating && rating.totalScore === null;
  const total =
    rating?.totalScore ??
    (casino.trustScore ? 10 * Number(casino.trustScore) : 0);

  const categories = CATEGORY_ORDER.map((key) => {
    const cat = rating?.categories?.[key];
    const hasWeighted =
      cat?.subcategories?.some(
        (s) => !s.pending && Number.parseFloat(s.weight ?? "0") > 0,
      ) ?? false;
    return {
      key,
      label: CATEGORY_LABELS[key],
      weight: CATEGORY_WEIGHTS[key],
      score: cat?.score ?? 0,
      pending: Boolean(cat?.pending || (cat && !hasWeighted)),
    };
  });

  const circumference = 2 * Math.PI * 9;

  return (
    <Card
      id="rating"
      variant="panel"
      theme="auto"
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/fg-icon.svg"
            alt="FairGambling"
            width={20}
            height={20}
            style={{ height: "auto" }}
          />
          <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            Rating
          </h2>
        </div>

        {scoreSoon ? (
          <span className="rounded-full border border-[rgba(42,39,78,0.15)] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.5)] dark:border-white/15 dark:text-white/50">
            Score soon
          </span>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ScoreBreakdownTooltip
                heading="FairGambling Rating breakdown"
                subcategories={categories.map((c) => ({
                  name: c.label,
                  weight: `${c.weight}%`,
                  score: c.score,
                  pending: c.pending,
                }))}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-[24px] font-bold leading-none text-[#2a274e] dark:text-white">
                  {total.toFixed(1)}
                </span>
                <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                  / 100%
                </span>
              </div>
            </div>
            <svg
              width="26"
              height="26"
              viewBox="0 0 22 22"
              fill="none"
              className="shrink-0"
              aria-hidden
            >
              <circle
                cx="11"
                cy="11"
                r={9}
                stroke="var(--nd-ring-track)"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="11"
                cy="11"
                r={9}
                stroke="var(--nd-accent-green)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(total / 100) * circumference} ${circumference}`}
                transform="rotate(-90 11 11)"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-3">
            <span className="w-[150px] shrink-0 truncate text-[14px] text-[#2a274e] lg:w-[170px] dark:text-white">
              {cat.label}
            </span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10">
              {!cat.pending ? (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(cat.score / 10) * 100}%`,
                    backgroundColor: "var(--nd-accent-green)",
                  }}
                />
              ) : null}
            </div>
            {cat.pending ? (
              <span className="w-[30px] shrink-0 text-right text-[10px] font-semibold uppercase tabular-nums text-[rgba(42,39,78,0.4)] dark:text-white/40">
                Soon
              </span>
            ) : (
              <span
                className="w-[30px] shrink-0 text-right text-[14px] font-medium tabular-nums"
                style={{ color: "var(--nd-accent-green)" }}
              >
                {cat.score.toFixed(1)}
              </span>
            )}
            <span className="w-[30px] shrink-0 text-right text-[14px] tabular-nums text-[rgba(42,39,78,0.5)] dark:text-white/50">
              {cat.weight}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
