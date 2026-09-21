import { SectionBlock, type SectionRow } from "@/components/casino-page/section-block";
import { str, yn, type CasinoDetail } from "@/lib/casinos/casino-page";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

function formatLanguages(raw: unknown): string {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean).join(", ");
  }
  return str(raw);
}

function buildSupportRows(support: Record<string, unknown>): SectionRow[] {
  const languages = formatLanguages(support.languages);

  return [
    {
      label: "Live Chat",
      value: yn(support.liveChat),
      description: "Real-time chat support available on the platform",
    },
    {
      label: "Response Time",
      value: str(support.responseTime),
      description: "Average time to get a first response from support",
    },
    {
      label: "24/7 Availability",
      value: yn(support.availability247),
      description: "Support is available around the clock",
    },
    {
      label: "Languages",
      value: languages,
      description: "Languages supported by customer service",
      valueNode: (
        <span className="text-right text-[14px] font-medium text-[#2a274e] dark:text-white">
          {languages}
        </span>
      ),
    },
    {
      label: "Human / Bot",
      value: str(support.humanOrBot),
      description:
        "How the first support interaction is handled — a human may still take over later in the process",
    },
  ];
}

type CustomerSupportSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `CustomerSupportSection` (2-7hhq-z71oqb.js 2526–2585). */
export function CustomerSupportSection({
  casino,
  rating,
}: CustomerSupportSectionProps) {
  const support = (casino.meta?.support ?? {}) as Record<string, unknown>;
  const category = rating?.categories?.customerSupport;

  return (
    <SectionBlock
      id="customer-support"
      title="Customer Support"
      weight={CATEGORY_WEIGHTS.customerSupport}
      score={category?.score ?? 0}
      pending={category?.pending}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={buildSupportRows(support)}
    />
  );
}
