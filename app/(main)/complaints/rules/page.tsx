import type { Metadata } from "next";
import { ResolutionRulesView } from "@/components/complaints/resolution-rules-view";
import { assertComplaintsEnabled } from "@/lib/complaints/flags";

export const metadata: Metadata = {
  title: "Resolution Rules",
  description:
    "How FairGambling judges crypto casino complaints — outcomes, category standards, and why verdicts are published.",
  alternates: {
    canonical: "https://www.fairgambling.com/complaints/rules",
  },
};

export default function ComplaintRulesPage() {
  assertComplaintsEnabled();

  return <ResolutionRulesView />;
}
