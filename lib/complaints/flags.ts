import { notFound } from "next/navigation";
import { isComplaintsEnabled } from "@/lib/navigation";

/**
 * Complaints feature flags — reference `701729` in `1ii5go3-6y6rv.js`.
 * Production snapshot: `SHOW_COMPLAINT_STATS` is `false` (Resolution Hub RSC renders `false` for summary).
 */
export const SHOW_COMPLAINT_STATS = false;

export function assertComplaintsEnabled(): void {
  if (!isComplaintsEnabled()) {
    notFound();
  }
}

/** Reference `isComplaintTriageEnabled` — triage UI not shipped in snapshot. */
export function isComplaintTriageEnabled(): boolean {
  return false;
}

export { isComplaintsEnabled };
