import Link from "next/link";
import { ArrowUpDown, ArrowUpRight, Star } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RatingGauge } from "@/components/ui/rating-gauge";
import { getTotalScoreColor } from "@/lib/casinos/score-color";
import {
  fgTotalScore100,
  type HomeBundle,
  type RatingsMap,
} from "@/lib/home/data";

/** `$` — Top rated casinos from home-bundle casinos + ratingsMap. */
export function TopRatedCasinos({
  casinos,
  ratingsMap = {},
}: {
  casinos: HomeBundle["casinos"];
  ratingsMap?: RatingsMap;
}) {
  if (!Array.isArray(casinos)) return null;

  const ranked = casinos
    .map((casino) => ({
      casino,
      score: fgTotalScore100(casino.slug, casino.trustScore, ratingsMap),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="h-full w-full"
      contentClassName="flex h-full flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <img
            src="/icons/fairgambling-text.svg"
            alt="FairGambling"
            className="h-[18px] w-auto opacity-90 dark:hidden"
          />
          <img
            src="/icons/fairgambling-text-dark.svg"
            alt=""
            className="hidden h-[18px] w-auto opacity-90 dark:block"
          />
          <span className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            Rating
          </span>
        </span>
        <Link href="/casinos">
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

      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-[12px] uppercase text-[#2a274e]/40 dark:text-white/40">
            <th className="border-b border-[#2a274e]/10 py-2.5 pr-3 text-left font-medium dark:border-white/[0.08]">
              #
            </th>
            <th className="border-b border-[#2a274e]/10 px-3 py-2.5 text-left font-medium dark:border-white/[0.08]">
              Casino
            </th>
            <th className="border-b border-[#2a274e]/10 px-3 py-2.5 text-left font-medium dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1">
                Reviews{" "}
                <ArrowUpDown
                  size={12}
                  className="text-[#2a274e]/30 dark:text-white/30"
                />
              </span>
            </th>
            <th className="border-b border-[#2a274e]/10 px-3 py-2.5 text-right font-medium dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1">
                Rating{" "}
                <ArrowUpDown
                  size={12}
                  className="text-[#2a274e]/30 dark:text-white/30"
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ casino, score }, index) => (
            <tr
              key={casino.slug}
              className="transition-colors hover:bg-[#2a274e]/[0.02] dark:hover:bg-white/[0.02]"
            >
              <td className="h-[76px] border-b border-[#2a274e]/[0.08] pr-3 text-sm font-semibold text-[#2a274e]/40 dark:border-white/[0.06] dark:text-white/40">
                {index + 1}
              </td>
              <td className="h-[76px] border-b border-[#2a274e]/[0.08] px-3 dark:border-white/[0.06]">
                <Link
                  href={`/${casino.slug}`}
                  className="flex items-center gap-2.5"
                >
                  <AnalyticsCasinoIcon
                    casinoName={casino.name}
                    logoUrl={casino.logoUrl}
                    size={28}
                    theme="auto"
                  />
                  <span className="truncate text-sm font-semibold text-[#2a274e] dark:text-white">
                    {casino.name}
                  </span>
                </Link>
              </td>
              <td className="h-[76px] border-b border-[#2a274e]/[0.08] px-3 dark:border-white/[0.06]">
                <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
                  <Star size={14} className="text-[#FFCF2F]" fill="currentColor" />
                  <span className="font-medium text-[#2a274e] dark:text-white">
                    {(casino.averageRating ?? 0).toFixed(1)}
                  </span>
                  <span className="text-[#2a274e]/40 dark:text-white/40">
                    / 5
                  </span>
                  <span className="text-[#2a274e]/40 dark:text-white/40">
                    ({casino.reviewCount ?? 0})
                  </span>
                </span>
              </td>
              <td className="h-[76px] border-b border-[#2a274e]/[0.08] px-3 dark:border-white/[0.06]">
                <div className="flex justify-end">
                  <RatingGauge
                    value={score}
                    maxValue={100}
                    color={getTotalScoreColor(score)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
