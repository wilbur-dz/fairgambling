import { SectionBlock, type SectionRow } from "@/components/casino-page/section-block";
import { str, yn, type CasinoDetail } from "@/lib/casinos/casino-page";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

function categoryPending(
  rating: CasinoRatingDetail | null,
): boolean {
  const cat = rating?.categories?.fairnessRtp;
  if (!cat) return true;
  if (cat.pending) return true;
  const hasWeighted =
    cat.subcategories?.some(
      (s) => !s.pending && Number.parseFloat(s.weight ?? "0") > 0,
    ) ?? false;
  return !hasWeighted;
}

function provablyFairDisplayValue(raw: unknown): string {
  if (raw === true) return "Yes";
  if (raw === false) return "No";
  if (raw == null || raw === "") return "—";
  const text = String(raw).trim();
  if (!text || /^none$/i.test(text)) return "No";
  return "Yes";
}

function formatPercent(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded =
      Math.round(value * 10) / 10 === value
        ? value.toFixed(1)
        : String(Math.round(value * 100) / 100);
    return `${rounded}%`;
  }
  return str(value);
}

function formatTopHouseGamesRtp(
  topGames: unknown,
): string {
  if (!topGames || typeof topGames !== "object" || Array.isArray(topGames)) {
    return "—";
  }
  const values = Object.values(topGames as Record<string, unknown>).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  if (values.length === 0) return "—";
  const min = Math.min(...values);
  return `${min.toFixed(1)}%`;
}

function buildFairnessRows(
  fairness: Record<string, unknown>,
  rating: CasinoRatingDetail | null,
): SectionRow[] {
  const sportsEdgeValue =
    typeof rating?.sportsEdgeVig === "number"
      ? rating.sportsEdgeVig
      : typeof fairness.avgEdgeSports === "number"
        ? fairness.avgEdgeSports
        : null;

  return [
    {
      label: "Provably Fair System",
      value: provablyFairDisplayValue(fairness.provablyFairSystem),
      description:
        "Whether the casino uses cryptographic proofs to guarantee unbiased outcomes.",
    },
    {
      label: "Verification Tool",
      value: yn(fairness.verificationTool),
      description:
        "Players can independently verify bets using a verification tool.",
    },
    {
      label: "Seed Change",
      value: yn(fairness.seedChange),
      description: "Players can change their seed before wagering.",
    },
    {
      label: "Seed Control",
      value: yn(fairness.seedControl),
      description:
        "Players can set their own client seed used in game outcomes.",
    },
    {
      label: "Transparency Link",
      value: yn(fairness.transparencyLink),
      description:
        "Casino provides a public link to verify game fairness and shows the implementation details.",
    },
    {
      label: "RTP Disclosure",
      value: yn(fairness.rtpDisclosure),
      description: "Casino publicly discloses average RTP across games.",
    },
    {
      label: "RTP Slot Consistency",
      value: yn(fairness.rtpSlotConsistency),
      description: "Slots run on the highest available RTP settings.",
    },
    {
      label: "Average House Game RTP",
      value: formatPercent(fairness.avgHouseGameRtp),
      description:
        "Mean return-to-player across all provably fair house games.",
    },
    {
      label: "Average Sports Edge",
      value:
        sportsEdgeValue != null ? formatPercent(sportsEdgeValue) : "—",
      description:
        "Average vigorish (margin) on sports bets. Lower is better for players.",
    },
    {
      label: "Top House Games RTP (Dice, Mines, Plinko)",
      value: formatTopHouseGamesRtp(fairness.topGamesRtp),
      description:
        "Whether top house games (Dice, Mines, Plinko) offer 99%+ RTP.",
    },
  ];
}

type FairnessRtpSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Fairness & RTP category block (reference `SectionBlock` + live row set). */
export function FairnessRtpSection({ casino, rating }: FairnessRtpSectionProps) {
  const fairness = (casino.meta?.fairnessRtp ?? {}) as Record<string, unknown>;
  const category = rating?.categories?.fairnessRtp;

  return (
    <SectionBlock
      id="fairness-rtp"
      title="Fairness & RTP"
      weight={CATEGORY_WEIGHTS.fairnessRtp}
      score={category?.score ?? 0}
      pending={categoryPending(rating)}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={buildFairnessRows(fairness, rating)}
    />
  );
}
