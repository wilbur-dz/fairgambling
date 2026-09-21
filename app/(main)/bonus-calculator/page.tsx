import { BonusCalculatorView } from "@/components/bonus-calculator/bonus-calculator-view";
import { fetchCasinos } from "@/lib/livecodes/api";
import type { CodeCasino } from "@/lib/livecodes/data";

/**
 * Bonus Calculator — main content from mock/7.
 * Select Casino: `GET /api/casinos?limit=100` (rates stay static).
 * Level Up: `/api/casinos/vip-levels` with bundled VIP fallback.
 */
export default async function BonusCalculatorPage() {
  let casinos: CodeCasino[] = [];

  try {
    casinos = await fetchCasinos({ limit: 100 });
  } catch (err) {
    console.error(
      "[bonus-calculator] casinos",
      err instanceof Error ? err.message : String(err),
    );
  }

  return <BonusCalculatorView casinos={casinos} />;
}
