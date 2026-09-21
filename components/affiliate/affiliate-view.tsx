"use client";

import { AffiliateBenefits } from "@/components/affiliate/benefits";
import { AffiliateHero } from "@/components/affiliate/affiliate-hero";
import { AffiliateOverview } from "@/components/affiliate/affiliate-overview";
import { EarnExtraRewards } from "@/components/affiliate/earn-extra-rewards";
import { HowItWorks } from "@/components/affiliate/how-it-works";
import { WagerShareCalculator } from "@/components/affiliate/wager-share-calculator";

/**
 * Affiliate page shell — matches live `/affiliate` composition:
 * Hero → HowItWorks → AffiliateOverview → Benefits → EarnExtraRewards → Calculator.
 */
export function AffiliateView() {
  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:gap-8 md:px-6">
      <AffiliateHero />
      <HowItWorks />
      <AffiliateOverview />
      <AffiliateBenefits />
      <EarnExtraRewards />
      <WagerShareCalculator />
    </main>
  );
}
