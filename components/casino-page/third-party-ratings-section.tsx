import { Star } from "lucide-react";
import {
  SectionBlock,
  type SectionRow,
} from "@/components/casino-page/section-block";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

const CASINO_GURU_FEEDBACK_CLASS: Record<string, string> = {
  High: "text-[#1f9d57] dark:text-[#00ff86]",
  Great: "text-[#1f9d57] dark:text-[#00ff86]",
  Good: "text-[#6b56e0] dark:text-[#8874ff]",
  Mixed: "text-[#b47316] dark:text-[#ffcf2f]",
};

const MUTED_CLASS =
  "text-[rgba(42,39,78,0.45)] dark:text-white/40";

function formatReviewCount(count: number): string {
  return `(${count.toLocaleString("en-US")} ${count === 1 ? "review" : "reviews"})`;
}

function StarRatingDisplay({
  score,
  count,
}: {
  score: number | null | undefined;
  count?: number | null;
}) {
  if (score == null) {
    return (
      <span className={`text-[14px] font-medium ${MUTED_CLASS}`}>—</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#2a274e] dark:text-white">
      <Star
        size={14}
        className="shrink-0 fill-[#ffcf2f] text-[#ffcf2f]"
      />
      <span className="tabular-nums">{score.toFixed(1)} / 5</span>
      {typeof count === "number" && count > 0 ? (
        <span className={`text-[12px] font-normal ${MUTED_CLASS}`}>
          {formatReviewCount(count)}
        </span>
      ) : null}
    </span>
  );
}

function UnresolvedCountDisplay({ n }: { n: number | null | undefined }) {
  if (n == null) {
    return (
      <span className={`text-[14px] font-medium ${MUTED_CLASS}`}>—</span>
    );
  }

  return (
    <span
      className={`text-[14px] font-medium ${
        n === 0
          ? "text-[#1f9d57] dark:text-[#00ff86]"
          : "text-[#2a274e] dark:text-white"
      }`}
    >
      {n}
    </span>
  );
}

function CasinoGuruFeedbackDisplay({
  feedback,
  reviewCount,
}: {
  feedback: string | null | undefined;
  reviewCount: number | null | undefined;
}) {
  if (
    feedback == null ||
    feedback === "No Data" ||
    feedback === "N/A"
  ) {
    return (
      <span className={`text-[14px] font-medium ${MUTED_CLASS}`}>—</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-medium">
      <span
        className={
          CASINO_GURU_FEEDBACK_CLASS[feedback] ??
          "text-[#2a274e] dark:text-white"
        }
      >
        {feedback}
      </span>
      {typeof reviewCount === "number" && reviewCount > 0 ? (
        <span className={`text-[12px] font-normal ${MUTED_CLASS}`}>
          {formatReviewCount(reviewCount)}
        </span>
      ) : null}
    </span>
  );
}

type ThirdPartyRatingsSectionProps = {
  /** Kept for parity with reference section props / future lookup. */
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
  reviewAvg: number | null;
  reviewCount: number;
};

/** Port of reference `ThirdPartyRatingsSection` (2-7hhq-z71oqb.js 4356–4485). */
export function ThirdPartyRatingsSection({
  rating,
  reviewAvg,
  reviewCount,
}: ThirdPartyRatingsSectionProps) {
  const category = rating?.categories?.thirdPartyRatings;
  const guruFeedback = rating?.casinoGuruFeedback;
  const guruReviewCount = rating?.casinoGuruReviewCount ?? null;

  const rows: SectionRow[] = [
    {
      label: "FairGambling User Reviews",
      value: "",
      valueNode: (
        <StarRatingDisplay score={reviewAvg} count={reviewCount} />
      ),
    },
    {
      label: "Trustpilot Score",
      value: "",
      valueNode: (
        <StarRatingDisplay
          score={rating?.trustpilot?.score}
          count={rating?.trustpilot?.reviewCount}
        />
      ),
    },
    {
      label: "Casino Guru User Feedback",
      value: "",
      valueNode: (
        <CasinoGuruFeedbackDisplay
          feedback={guruFeedback}
          reviewCount={guruReviewCount}
        />
      ),
    },
    {
      label: "Casino Guru Unresolved Complaints",
      value: "",
      valueNode: (
        <UnresolvedCountDisplay n={rating?.casinoGuruUnresolved} />
      ),
    },
    {
      label: "BitcoinTalk Unresolved Scam Accusations",
      value: "",
      valueNode: (
        <UnresolvedCountDisplay n={rating?.bitcointalkUnresolved} />
      ),
    },
  ];

  return (
    <SectionBlock
      id="third-party-ratings"
      title="Third Party Ratings"
      weight={CATEGORY_WEIGHTS.thirdPartyRatings}
      score={category?.score ?? 0}
      pending={category?.pending}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={rows}
    />
  );
}
