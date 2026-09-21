import casinosJson from "@/lib/calendar/casinos.json";

export type BonusFamily =
  | "weekly"
  | "monthly"
  | "pre_monthly"
  | "post_monthly"
  | "mid_monthly"
  | "top_monthly";

export type Recurrence =
  | { kind: "weekly"; weekday: number }
  | { kind: "monthly_day"; day: number }
  | { kind: "monthly_last_day" }
  | { kind: "monthly_nth_weekday"; nth: number; weekday: number };

export type BonusRule = {
  type: BonusFamily;
  recurrence: Recurrence | null;
  hour: number;
  minute: number;
  hasFixedTime: boolean;
  cashback: boolean;
  approximate: boolean;
  experimental: boolean;
  note?: string;
};

export type CalendarCasino = {
  id: string;
  name: string;
  slug: string;
  includedInCalendar: boolean;
  isLeaderboard?: boolean;
  rules: BonusRule[];
};

export type CalendarOccurrence = {
  casinoId: string;
  casinoName: string;
  slug: string;
  type: BonusFamily;
  instantUtc: number;
  hasFixedTime: boolean;
  cashback: boolean;
  approximate: boolean;
  isLeaderboard: boolean;
};

export type MonthDay = {
  year: number;
  month0: number;
  day: number;
  inMonth: boolean;
  dateMs: number;
};

export type PayoutRow = {
  casino: string;
  slug: string;
  totalPaid: number;
  share: number;
};

export type PayoutsPayload = {
  byTf: Record<"7d" | "30d" | "365d", PayoutRow[]>;
};

export const BONUS_META: Record<
  BonusFamily,
  { label: string; tag: string; color: string }
> = {
  weekly: { label: "Weekly", tag: "W", color: "#8874ff" },
  monthly: { label: "Monthly", tag: "Mo", color: "#4ad17d" },
  pre_monthly: { label: "Pre-monthly", tag: "Pre", color: "#5fa8ff" },
  post_monthly: { label: "Post-monthly", tag: "Post", color: "#f5b945" },
  mid_monthly: { label: "Mid-monthly", tag: "Mid", color: "#f0859a" },
  top_monthly: { label: "Top-monthly", tag: "Top", color: "#d56fb0" },
};

export const LEGEND_ORDER: BonusFamily[] = [
  "weekly",
  "monthly",
  "pre_monthly",
  "post_monthly",
  "mid_monthly",
  "top_monthly",
];

/** ~30.4375 days — monthly progress bar interval from production. */
export const MONTHLY_INTERVAL_MS = Math.round(26298e5);
export const PRIORITY_CASINO_IDS = [
  "leaderboard",
  "stake",
  "roobet",
  "rainbet",
  "shuffle",
] as const;

/** Static casino schedule catalog (from production INCLUDED_CASINOS). */
export const INCLUDED_CASINOS = casinosJson.casinos as CalendarCasino[];
