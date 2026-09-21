export type ShareMetricId =
  | "market-value"
  | "payment"
  | "followers"
  | "avg-viewers"
  | "view-hours"
  | "stream-hours"
  | "leaderboard";

export const SHARE_METRIC_META: Record<
  ShareMetricId,
  { label: string; unit: string; sub: string }
> = {
  "market-value": {
    label: "Market Value",
    unit: "usd",
    sub: "Estimated market value",
  },
  payment: {
    label: "Est. Monthly Payment",
    unit: "usd-month",
    sub: "Estimated casino payment per month",
  },
  followers: { label: "Followers", unit: "count", sub: "Kick followers" },
  "avg-viewers": {
    label: "Average Viewers",
    unit: "count",
    sub: "Average concurrent viewers · last 30 days",
  },
  "view-hours": {
    label: "View Hours",
    unit: "hours",
    sub: "Total hours watched · last 30 days",
  },
  "stream-hours": {
    label: "Stream Hours",
    unit: "hours",
    sub: "Hours live on air · last 30 days",
  },
  leaderboard: {
    label: "Leaderboard Prize",
    unit: "usd-month",
    sub: "Monthly leaderboard prize pool",
  },
};

export const SHARE_METRIC_OPTIONS = (
  Object.keys(SHARE_METRIC_META) as ShareMetricId[]
).map((value) => ({ value, label: SHARE_METRIC_META[value].label }));
