import Image from "next/image";
import { SectionBlock, type SectionRow } from "@/components/casino-page/section-block";
import { str, yn, type CasinoDetail } from "@/lib/casinos/casino-page";
import { CATEGORY_WEIGHTS, getLicenseLogo } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

function parseCompanyName(licenseDetails: unknown): string {
  const text = str(licenseDetails);
  if (text === "—") return text;
  const match = text.match(/^(.+?)\s+licensed\s+by/i);
  return match?.[1] ?? text;
}

function formatRestrictedCountries(raw: unknown): {
  display: string;
  full: string[];
  overflow: number;
} {
  const j = Array.isArray(raw)
    ? raw.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const v =
    j.length > 1 ? j : String(j[0] ?? "").split(/\s+/).filter(Boolean);
  const joiner = j.length > 1 ? ", " : " ";
  const display = v.length === 0 ? "—" : v.slice(0, 3).join(joiner);
  const overflow = Math.max(0, v.length - 3);

  return { display, full: v, overflow };
}

function buildComplianceRows(
  casino: CasinoDetail,
  rating: CasinoRatingDetail | null,
): SectionRow[] {
  const meta = casino.meta ?? {};
  const compliance = (meta.compliance ?? {}) as Record<string, unknown>;
  const overview = meta.overview ?? {};
  const valueClass = "text-[#2a274e] dark:text-white";

  const licenseLabel = str(overview.license ?? rating?.license);
  const licenseLogo = getLicenseLogo(licenseLabel);
  const company = parseCompanyName(compliance.licenseDetails);
  const restricted = formatRestrictedCountries(compliance.restrictedCountries);
  const kycLevel = str(compliance.kycLevel);
  const kycFull = /^full/i.test(kycLevel);

  return [
    {
      label: "License",
      value: licenseLabel,
      description: "Which regulatory authority oversees this casino",
      valueNode: (
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span
            className={`truncate text-[14px] font-medium ${valueClass}`}
          >
            {licenseLabel}
          </span>
          {licenseLogo ? (
            <Image
              src={licenseLogo}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-auto shrink-0"
            />
          ) : null}
        </span>
      ),
    },
    {
      label: "Company",
      value: company,
      description: "The legal entity operating the casino",
    },
    {
      label: "Restricted Countries",
      value: restricted.display,
      description: "Countries where the casino is not available",
      valueNode:
        restricted.full.length === 0 ? undefined : (
          <span
            className={`text-right text-[14px] font-medium ${valueClass}`}
            title={restricted.full.join(", ")}
          >
            {restricted.display}
            {restricted.overflow > 0 ? (
              <span className="ml-1 text-[#6b56e0] underline decoration-[#8874ff]/40 dark:text-[#8874ff]">
                {restricted.overflow} more
              </span>
            ) : null}
          </span>
        ),
    },
    {
      label: "License Verification",
      value: yn(compliance.licenseVerificationLink),
      description: "License can be verified through the regulator's website",
    },
    {
      label: "Geo-blocking",
      value: yn(compliance.geoBlocking),
      description: "Casino blocks access from restricted jurisdictions",
    },
    {
      label: "Know Your Customer",
      value: kycLevel,
      description:
        "Level of identity verification required to use the platform",
      valueNode: (
        <span
          className={`text-right text-[14px] font-medium ${
            kycFull ? "text-[#1f9d57] dark:text-[#00ff86]" : valueClass
          }`}
        >
          {kycLevel}
        </span>
      ),
    },
    {
      label: "ID Verification",
      value: str(compliance.idVerification),
      description:
        "When ID documents are required — on sign-up or before withdrawal",
    },
    {
      label: "AML",
      value: yn(compliance.wagerBeforeWithdrawal),
      description:
        "Whether the casino requires wagering funds before withdrawal",
    },
  ];
}

type ComplianceSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `ComplianceSection` (2-7hhq-z71oqb.js 2301–2429). */
export function ComplianceSection({ casino, rating }: ComplianceSectionProps) {
  const category = rating?.categories?.compliance;

  return (
    <SectionBlock
      id="compliance"
      title="Compliance"
      weight={CATEGORY_WEIGHTS.compliance}
      score={category?.score ?? 0}
      pending={category?.pending}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={buildComplianceRows(casino, rating)}
    />
  );
}
