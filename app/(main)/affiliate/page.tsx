import type { Metadata } from "next";
import { AffiliateView } from "@/components/affiliate/affiliate-view";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Earn wager share, bonus code drops, and cross-casino leaderboard prizes through FairGambling.",
};

/**
 * Affiliate / Earn Extra Rewards page.
 * Composition matches reference chunk `3n_ef_4a8f8c_.js`:
 * Hero, HowItWorks, AffiliateOverview, Benefits, EarnExtraRewards, Calculator.
 */
export default function AffiliatePage() {
  return <AffiliateView />;
}
