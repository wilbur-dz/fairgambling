import type { Metadata } from "next";
import { Suspense } from "react";
import { ComplaintNewWizard } from "@/components/complaints/complaint-new-wizard";
import { assertComplaintsEnabled } from "@/lib/complaints/flags";

export const metadata: Metadata = {
  title: "File a Complaint",
  description:
    "Submit a crypto casino dispute to FairGambling Resolution — free independent mediation with published outcomes.",
  alternates: {
    canonical: "https://www.fairgambling.com/complaints/new",
  },
};

export default function NewComplaintPage() {
  assertComplaintsEnabled();

  return (
    <Suspense
      fallback={
        <main className="px-4 py-8 md:px-6">
          <p className="text-sm text-white/50">Loading…</p>
        </main>
      }
    >
      <ComplaintNewWizard />
    </Suspense>
  );
}
