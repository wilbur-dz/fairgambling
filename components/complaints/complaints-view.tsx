"use client";

import {
  CasinoBreakdown,
  CategoryBreakdown,
} from "@/components/complaints/casino-breakdown";
import { ComplaintsBrowser } from "@/components/complaints/complaints-browser";
import { ResolutionHero } from "@/components/complaints/resolution-hero";
import { ResolutionHowItWorks } from "@/components/complaints/resolution-how-it-works";
import { ResolutionSummary } from "@/components/complaints/resolution-summary";
import { SHOW_COMPLAINT_STATS } from "@/lib/complaints/flags";

/**
 * Complaint Resolution Hub — matches reference `/complaints` RSC composition.
 */
export function ComplaintsView() {
  return (
    <main className="flex flex-col gap-4 px-4 pb-6 pt-6 md:gap-6 md:px-6">
      <ResolutionHero />
      <ResolutionHowItWorks />
      {SHOW_COMPLAINT_STATS ? <ResolutionSummary /> : null}
      <ComplaintsBrowser />
      <CasinoBreakdown />
      <CategoryBreakdown />
    </main>
  );
}
