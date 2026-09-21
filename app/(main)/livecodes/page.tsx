import { LiveCodesView } from "@/components/livecodes/livecodes-view";
import {
  fetchCasinos,
  fetchCodes,
  fetchCodesStats,
} from "@/lib/livecodes/api";
import type {
  CodeCasino,
  CodesStatsPayload,
  LiveCode,
} from "@/lib/livecodes/data";

/**
 * Live Codes page — main content from mock/4.
 * Feed: `GET /api/codes`. Stats: `GET /api/codes/stats`.
 * All Casinos filter catalog: `GET /api/casinos?limit=100` (not codes/casinos).
 */
export default async function LiveCodesPage() {
  let codes: LiveCode[] = [];
  let stats: CodesStatsPayload | null = null;
  let casinos: CodeCasino[] = [];

  const [codesResult, statsResult, casinosResult] = await Promise.allSettled([
    fetchCodes({ limit: 20 }),
    fetchCodesStats(),
    fetchCasinos({ limit: 100 }),
  ]);

  if (codesResult.status === "fulfilled") {
    codes = codesResult.value.codes;
  } else {
    console.error(
      "[livecodes] codes",
      codesResult.reason instanceof Error
        ? codesResult.reason.message
        : String(codesResult.reason),
    );
  }

  if (statsResult.status === "fulfilled") {
    stats = statsResult.value;
  } else {
    console.error(
      "[livecodes] stats",
      statsResult.reason instanceof Error
        ? statsResult.reason.message
        : String(statsResult.reason),
    );
  }

  if (casinosResult.status === "fulfilled") {
    casinos = casinosResult.value;
  } else {
    console.error(
      "[livecodes] casinos",
      casinosResult.reason instanceof Error
        ? casinosResult.reason.message
        : String(casinosResult.reason),
    );
  }

  return <LiveCodesView codes={codes} stats={stats} casinos={casinos} />;
}
