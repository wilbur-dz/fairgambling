import { SectionBlock } from "@/components/casino-page/section-block";
import { Card } from "@/components/ui/card";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import type { CasinoRatingDetail } from "@/lib/casinos/data";
import {
  buildLoyaltyTierLabels,
  getCasinoLoyaltyProgram,
  type LoyaltyTierLabel,
} from "@/lib/casinos/loyalty";

const TIER_COLORS: Record<string, string> = {
  bronze: "#B2661F",
  silver: "#ADADB2",
  gold: "#FAD11A",
  platinum: "#DEE5EB",
  diamond: "#8FDBFA",
  pearl: "#C9D6E5",
  obsidian: "#6C5CE7",
  opal: "#EBD1FF",
};

export type CasinoBonusTypeMeta = {
  name: string;
  minTier?: string | null;
  minWager?: string | null;
  release?: string | null;
};

function tierColor(name: string): string {
  return TIER_COLORS[name.toLowerCase()] ?? "#8E8EFF";
}

function LoyaltyTierTimeline({ tiers }: { tiers: LoyaltyTierLabel[] }) {
  if (tiers.length === 0) return null;
  const lastIndex = tiers.length - 1;

  return (
    <Card variant="glass">
      <div className="flex flex-col md:hidden">
        {tiers.map((tier, index) => {
          const isLast = index === lastIndex;
          const color = tierColor(tier.name);
          const nextColor = isLast
            ? color
            : tierColor(tiers[index + 1].name);

          return (
            <div key={`${tier.name}-${index}`} className="flex gap-3">
              <div className="flex w-[6px] flex-col items-center">
                <span
                  className="mt-[3px] block size-[6px] shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {!isLast ? (
                  <span
                    className="w-[2px] flex-1 rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${color}, ${nextColor})`,
                    }}
                  />
                ) : null}
              </div>
              <div className={`flex flex-col gap-0.5 ${isLast ? "" : "pb-4"}`}>
                <span className="text-[12px] leading-none text-[#2a274e] dark:text-white">
                  {tier.name}
                </span>
                <span className="text-[10px] leading-none text-[rgba(42,39,78,0.45)] dark:text-white/30">
                  {tier.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="scrollbar-hide hidden overflow-x-auto md:block">
        <div className="relative h-[46px] min-w-[560px]">
          <div
            className="absolute inset-x-[3px] top-[2px] h-[2px] rounded-full"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #B2661F 0%, #ADADB2 16.67%, #FAD11A 33.33%, #DEE5EB 50%, #8FDBFA 66.67%, #35276E 85.32%, #EBD1FF 100%)",
            }}
          />
          <div className="flex items-center">
            {tiers.map((tier, index) => {
              const isLast = index === lastIndex;
              return (
                <div
                  key={`${tier.name}-${index}`}
                  className={`relative ${isLast ? "" : "flex-1"}`}
                >
                  <span
                    className="block size-[6px] rounded-full"
                    style={{ backgroundColor: tierColor(tier.name) }}
                  />
                  <div
                    className={`absolute top-[14px] flex flex-col gap-0.5 whitespace-nowrap ${
                      index === 0
                        ? "left-0 items-start text-left"
                        : isLast
                          ? "right-0 items-end text-right"
                          : "left-[3px] -translate-x-1/2 items-center text-center"
                    }`}
                  >
                    <span className="text-[12px] leading-none text-[#2a274e] dark:text-white">
                      {tier.name}
                    </span>
                    <span className="text-[10px] leading-none text-[rgba(42,39,78,0.45)] dark:text-white/30">
                      {tier.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function BonusTypeCard({ bonus }: { bonus: CasinoBonusTypeMeta }) {
  const hasUnlock = Boolean(bonus.minTier || bonus.minWager);
  const unlockLabel =
    `${bonus.minTier ?? ""}${bonus.minWager ? ` (${bonus.minWager})` : ""}`.trim();
  const valueClass = "text-[#2a274e] dark:text-white";
  const mutedClass = "text-[rgba(42,39,78,0.45)] dark:text-white/30";

  return (
    <Card variant="glass" contentClassName="flex flex-col gap-4">
      <span className={`text-[16px] font-medium ${valueClass}`}>
        {bonus.name}
      </span>
      <div className="flex flex-col gap-1.5 text-[14px]">
        {hasUnlock ? (
          <div className="flex items-start justify-between gap-2">
            <span className={mutedClass}>Unlocks at</span>
            <span className={`text-right ${valueClass}`}>{unlockLabel}</span>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <span className={mutedClass}>Release</span>
          <span className={`text-right ${valueClass}`}>
            {bonus.release?.trim() || "—"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function parseBonusTypes(meta: CasinoDetail["meta"]): CasinoBonusTypeMeta[] {
  const raw = meta?.bonus as Record<string, unknown> | undefined;
  const list = raw?.bonusTypes;
  if (!Array.isArray(list)) return [];

  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "Bonus",
      minTier:
        typeof item.minTier === "string" ? item.minTier : null,
      minWager:
        typeof item.minWager === "string" ? item.minWager : null,
      release:
        typeof item.release === "string" ? item.release : null,
    }))
    .filter((item) => item.name.trim().length > 0);
}

type BonusSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `BonusSection` (2-7hhq-z71oqb.js 474–746). */
export function BonusSection({ casino, rating }: BonusSectionProps) {
  const category = rating?.categories?.bonus;
  const score = category?.score ?? 0;
  const pending = category?.pending;
  const subcategories = category?.subcategories?.map((s) => ({
    name: s.name,
    score: s.score,
    weight: s.weight ?? "0",
    pending: s.pending,
  }));
  const leaderboardSize = rating?.leaderboardSize30d ?? null;

  const program = getCasinoLoyaltyProgram(casino.slug);
  const tiers = program
    ? buildLoyaltyTierLabels(program.ranks, program.currency)
    : [];
  const bonusTypes = parseBonusTypes(casino.meta);

  if (tiers.length === 0 && bonusTypes.length === 0 && !leaderboardSize) {
    return null;
  }

  return (
    <SectionBlock
      id="bonus-types"
      title="Bonus types"
      weight={CATEGORY_WEIGHTS.bonus}
      score={score}
      pending={pending}
      subcategories={subcategories}
      rows={[]}
      topSlot={tiers.length > 0 ? <LoyaltyTierTimeline tiers={tiers} /> : null}
    >
      {bonusTypes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bonusTypes.map((bonus) => (
            <BonusTypeCard key={bonus.name} bonus={bonus} />
          ))}
        </div>
      ) : null}

      {leaderboardSize ? (
        <Card
          variant="glass"
          contentClassName="flex items-center justify-between gap-4"
        >
          <span className="text-[16px] font-medium text-[#2a274e] dark:text-white">
            Leaderboard / Raffle Size
          </span>
          <span className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
            {leaderboardSize}
          </span>
        </Card>
      ) : null}
    </SectionBlock>
  );
}
