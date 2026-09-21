import { ApiError, apiFetch, handleResponse } from "@/lib/api/client";
import type { PayoutsPayload } from "@/lib/calendar/data";
import { normalizeBonusPayouts } from "@/lib/calendar/normalize";

export type FetchBonusPayoutsOptions = {
  /** Server-only Next.js cache hints. */
  revalidate?: number | false;
};

/**
 * `GET /api/casinos/bonus-payouts`
 * Returns all timeframes (`7d` / `30d` / `365d`) in one payload.
 * @see https://api.fairgambling.com/api/casinos/bonus-payouts
 */
export async function fetchBonusPayouts(
  options: FetchBonusPayoutsOptions = {},
): Promise<PayoutsPayload> {
  const payload = await apiFetch<unknown>("/api/casinos/bonus-payouts", {
    method: "GET",
    next:
      options.revalidate === false
        ? { revalidate: false }
        : {
            revalidate: options.revalidate ?? 60,
            tags: ["bonus-payouts", "calendar"],
          },
  });

  const data = normalizeBonusPayouts(payload);
  if (!data) {
    throw new ApiError("Invalid bonus-payouts payload", 500, payload);
  }
  return data;
}

/**
 * Browser fetch via Next rewrite (`/api/...` → api.fairgambling.com).
 */
export async function fetchBonusPayoutsClient(): Promise<PayoutsPayload> {
  const response = await fetch("/api/casinos/bonus-payouts", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const payload = await handleResponse<unknown>(response);
  const data = normalizeBonusPayouts(payload);
  if (!data) {
    throw new Error("Invalid bonus-payouts payload");
  }
  return data;
}
