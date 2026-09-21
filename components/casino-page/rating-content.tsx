import { AnalyticsSection } from "@/components/casino-page/analytics-section";
import { FairnessRtpSection } from "@/components/casino-page/fairness-rtp-section";
import { BonusSection } from "@/components/casino-page/bonus-section";
import { BonusTestingSection } from "@/components/casino-page/bonus-testing-section";
import { ComplianceSection } from "@/components/casino-page/compliance-section";
import { HouseGamesSection } from "@/components/casino-page/house-games-section";
import { SlotsSection } from "@/components/casino-page/slots-section";
import { ThirdPartyRatingsSection } from "@/components/casino-page/third-party-ratings-section";
import { ResponsibleGamblingSection } from "@/components/casino-page/responsible-gambling-section";
import { CustomerSupportSection } from "@/components/casino-page/customer-support-section";
import { HotWalletBalances } from "@/components/casino-page/hot-wallet-balances";
import { ProvablyFairGames } from "@/components/casino-page/provably-fair-games";
import { SectionBlock, type SectionRow } from "@/components/casino-page/section-block";
import { Card } from "@/components/ui/card";
import type { CasinoAnalytics } from "@/lib/casinos/casino-analytics";
import type { CasinoHotWallet } from "@/lib/casinos/casino-hot-wallet";
import { str, yn, type CasinoDetail } from "@/lib/casinos/casino-page";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoRatingDetail } from "@/lib/casinos/data";

function categoryPending(
  rating: CasinoRatingDetail | null,
  key: keyof CasinoRatingDetail["categories"],
): boolean {
  const cat = rating?.categories?.[key];
  if (!cat) return true;
  if (cat.pending) return true;
  const hasWeighted =
    cat.subcategories?.some(
      (s) => !s.pending && Number.parseFloat(s.weight ?? "0") > 0,
    ) ?? false;
  return !hasWeighted;
}

function categoryScore(
  rating: CasinoRatingDetail | null,
  key: keyof CasinoRatingDetail["categories"],
): number {
  return rating?.categories?.[key]?.score ?? 0;
}

function mapFieldRows(
  source: Record<string, unknown> | null | undefined,
  defs: Array<{
    key: string;
    label: string;
    description?: string;
    format?: "yn" | "str";
  }>,
): SectionRow[] {
  if (!source) return defs.map((d) => ({ label: d.label, value: "—" }));
  return defs.map((d) => {
    const raw = source[d.key];
    const value = d.format === "yn" ? yn(raw) : str(raw);
    return {
      label: d.label,
      value,
      description: d.description,
      booleanPolarity: d.format === "yn" ? undefined : undefined,
    };
  });
}

type RatingContentProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
  reviewAvg: number | null;
  reviewCount: number;
  reviewHtml: string | null;
  analytics: CasinoAnalytics;
  hotWallet: CasinoHotWallet | null;
};

/** Rating tab body: breakdown + category SectionBlocks. */
export function CasinoRatingContent({
  casino,
  rating,
  reviewAvg,
  reviewCount,
  reviewHtml,
  analytics,
  hotWallet,
}: RatingContentProps) {
  const meta = casino.meta ?? {};
  const financial = (meta.financial ?? {}) as Record<string, unknown>;
  const security = (meta.security ?? {}) as Record<string, unknown>;
  const games = meta.games;
  const houseGames = games?.houseGames ?? [];

  return (
    <>
      <AnalyticsSection
        analytics={analytics}
        casinoSlug={casino.slug}
        analyticsHref="/analytics"
        rating={rating}
      />

      <FairnessRtpSection casino={casino} rating={rating} />

      <ProvablyFairGames
        casinoSlug={casino.slug}
        houseGames={houseGames}
        meta={meta}
      />

      {/* todo */}
      <SectionBlock
        id="financial-transparency"
        title="Financial Transparency"
        weight={CATEGORY_WEIGHTS.financialTransparency}
        score={categoryScore(rating, "financialTransparency")}
        pending={categoryPending(rating, "financialTransparency")}
        rows={mapFieldRows(financial, [
          { key: "publicHotWallet", label: "Public Hot Wallet", format: "yn" },
          { key: "proofOfReserves", label: "Proof of Reserves", format: "yn" },
          { key: "cryptoWithdrawals", label: "Crypto Withdrawals", format: "yn" },
          { key: "withdrawalSpeed", label: "Withdrawal Speed" },
          { key: "withdrawalLimit", label: "Withdrawal Limit" },
          { key: "minimumDeposit", label: "Minimum Deposit" },
          { key: "minimumWithdrawal", label: "Minimum Withdrawal" },
          { key: "fees", label: "Fees" },
          { key: "cancelWithdraw", label: "Cancel Withdraw", format: "yn" },
        ])}
      />

      <HotWalletBalances casino={casino} hotWallet={hotWallet} />

      <BonusSection casino={casino} rating={rating} />

      <BonusTestingSection casino={casino} />

      <CustomerSupportSection casino={casino} rating={rating} />

      <ComplianceSection casino={casino} rating={rating} />

      <ResponsibleGamblingSection casino={casino} rating={rating} />

      {/* todo */}
      <SectionBlock
        id="security"
        title="Security"
        weight={CATEGORY_WEIGHTS.security}
        score={categoryScore(rating, "security")}
        pending={categoryPending(rating, "security")}
        rows={mapFieldRows(security, [
          { key: "twoFactor", label: "Login 2FA", format: "yn" },
          {
            key: "accountNotifications",
            label: "Account Notifications",
            format: "yn",
          },
          {
            key: "withdrawalConfirmation2fa",
            label: "Withdrawal 2FA",
            format: "yn",
          },
        ])}
      />

      <HouseGamesSection casino={casino} rating={rating} />

      <SlotsSection casino={casino} rating={rating} />

      <ThirdPartyRatingsSection
        casino={casino}
        rating={rating}
        reviewAvg={reviewAvg}
        reviewCount={reviewCount}
      />

      <Card
        id="review"
        variant="panel"
        theme="auto"
        blur
        className="scroll-mt-24"
        contentClassName="flex flex-col gap-3"
      >
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          {casino.name} Review
        </h2>
        {reviewHtml ? (
          <div
            className="prose dark:prose-invert max-w-none prose-p:text-[14px] prose-p:text-[#2a274e]/70 dark:prose-p:text-white/70"
            dangerouslySetInnerHTML={{ __html: reviewHtml }}
          />
        ) : (
          <p className="text-[14px] text-[rgba(42,39,78,0.55)] dark:text-white/55">
            Full editorial review coming soon. Explore the rating categories above
            for the current FairGambling score breakdown.
          </p>
        )}
      </Card>
    </>
  );
}
