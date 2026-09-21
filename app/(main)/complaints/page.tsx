import type { Metadata } from "next";
import { ComplaintsView } from "@/components/complaints/complaints-view";
import { assertComplaintsEnabled } from "@/lib/complaints/flags";

export const metadata: Metadata = {
  title: "Complaint Resolution Hub",
  description:
    "Track complaint resolutions across every tracked crypto casino — disputes filed, resolved, refunded and outstanding, with per-casino and per-category breakdowns.",
  alternates: {
    canonical: "https://www.fairgambling.com/complaints",
  },
};

export default function ComplaintsPage() {
  assertComplaintsEnabled();

  return <ComplaintsView />;
}
