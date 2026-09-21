import type { LeaderboardSortKey } from "@/lib/streamers/view-format";

export type LeaderboardColumn = {
  label: string;
  key: LeaderboardSortKey | null;
  right?: boolean;
  center?: boolean;
  w: number;
};

export const LEADERBOARD_DESKTOP_COLUMNS: LeaderboardColumn[] = [
  { label: "#", key: "rank", w: 40 },
  { label: "Streamer", key: "name", w: 150 },
  { label: "IRL", key: null, center: true, w: 64 },
  { label: "Market Value", key: "marketvalue", right: true, w: 100 },
  { label: "Lang", key: null, w: 50 },
  { label: "Casino", key: null, w: 100 },
  { label: "Est. Payment", key: "payment", right: true, w: 110 },
  { label: "Degen", key: "degen", w: 75 },
  { label: "Money", key: null, w: 70 },
  { label: "Followers", key: "followers", right: true, w: 90 },
  { label: "Avg Viewers", key: "avg", right: true, w: 90 },
  { label: "View Hrs", key: "hours", right: true, w: 85 },
  { label: "Stream Hrs", key: "streamhours", right: true, w: 85 },
  { label: "Last Live", key: "lastlive", w: 80 },
  { label: "Leaderboard", key: "leaderboard", right: true, w: 120 },
];

/** Columns where rows without stats sort after those with stats. */
export const LEADERBOARD_STATS_AWARE_KEYS = new Set<LeaderboardSortKey>([
  "avg",
  "hours",
]);

export type ListTabId = "Live" | "Most Valuable" | "Newcomers";

export type SortState = { key: LeaderboardSortKey; dir: "asc" | "desc" };

export const LIST_TAB_DEFAULT_SORT: Record<ListTabId, SortState> = {
  Live: { key: "liveviewers", dir: "desc" },
  "Most Valuable": { key: "marketvalue", dir: "desc" },
  Newcomers: { key: "newcomer", dir: "desc" },
};

export const TABLE_HEAD_CLASS =
  "px-3 pb-3 text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35 sm:whitespace-nowrap";

export const TABLE_CELL_CLASS =
  "whitespace-nowrap border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.05] px-3 py-3.5 text-[13px]";

export const MOBILE_CELL_CLASS =
  "whitespace-nowrap border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.05] px-2.5 py-3 text-[12px]";

export const MOBILE_STICKY_RANK = "sticky left-0 z-[2] w-8";
export const MOBILE_STICKY_NAME = "sticky left-8 z-[2]";
export const MOBILE_STICKY_BG = "bg-[#f4f4f4] dark:bg-[#181c2c]";
export const MOBILE_ROW_BG = "bg-[#f4f4f4] dark:bg-[#111525]";
