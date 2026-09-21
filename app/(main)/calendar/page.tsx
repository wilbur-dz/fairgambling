import { CalendarView } from "@/components/calendar/calendar-view";
import { fetchBonusPayouts } from "@/lib/calendar/api";
import type { PayoutsPayload } from "@/lib/calendar/data";

/**
 * Bonus Calendar — main content from mock/6.
 * Schedule is client-side from static INCLUDED_CASINOS.
 * Payouts from `GET /api/casinos/bonus-payouts` (all TFs in one response).
 */
export default async function CalendarPage() {
  let payouts: PayoutsPayload | null = null;
  try {
    payouts = await fetchBonusPayouts();
  } catch (err) {
    console.error(
      "[calendar] bonus-payouts",
      err instanceof Error ? err.message : String(err),
    );
  }

  return <CalendarView payouts={payouts} />;
}
