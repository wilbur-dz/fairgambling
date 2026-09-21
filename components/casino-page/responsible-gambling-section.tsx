import { SectionBlock, type SectionRow } from "@/components/casino-page/section-block";
import { str, yn, type CasinoDetail } from "@/lib/casinos/casino-page";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

function buildResponsibleGamblingRows(
  responsibleGambling: Record<string, unknown>,
): SectionRow[] {
  const selfExclusion = str(responsibleGambling.selfExclusion);
  const selfExclusionHigh = /^high/i.test(selfExclusion);
  const valueClass = "text-[#2a274e] dark:text-white";

  return [
    {
      label: "Access to Stats",
      value: yn(responsibleGambling.accessToStats),
      description: "Players can view their own wagering and loss statistics",
    },
    {
      label: "Self-Exclusion",
      value: selfExclusion,
      description:
        "Ability to temporarily or permanently block your own account",
      valueNode: (
        <span
          className={`text-right text-[14px] font-medium ${
            selfExclusionHigh
              ? "text-[#1f9d57] dark:text-[#00ff86]"
              : valueClass
          }`}
        >
          {selfExclusion}
        </span>
      ),
    },
    {
      label: "Gambling Limits",
      value: yn(
        responsibleGambling.gamblingLimits ??
          responsibleGambling.coolingOffPeriods,
      ),
      description: "Players can set deposit, loss, or wager limits",
    },
  ];
}

type ResponsibleGamblingSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `ResponsibleGamblingSection` (2-7hhq-z71oqb.js 3735–3787). */
export function ResponsibleGamblingSection({
  casino,
  rating,
}: ResponsibleGamblingSectionProps) {
  const responsibleGambling = (casino.meta?.responsibleGambling ??
    {}) as Record<string, unknown>;
  const category = rating?.categories?.responsibleGambling;

  return (
    <SectionBlock
      id="responsible-gambling"
      title="Responsible Gambling"
      weight={CATEGORY_WEIGHTS.responsibleGambling}
      score={category?.score ?? 0}
      pending={category?.pending}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={buildResponsibleGamblingRows(responsibleGambling)}
    />
  );
}
