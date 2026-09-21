import { mvOf, parseMoney } from "@/lib/streamers/data";
import type { StreamerRecord } from "@/lib/streamers/types";

export function formatCompactNumber(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString("en-US");
}

export function formatRelativeLastLive(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

export function marketValueHue(usd: number): string {
  const t = Math.min(Math.pow(Math.max(Math.log10(usd / 1e6), 0) / 2, 1.2), 1);
  return `hsl(270, ${90 * t}%, ${45 + (1 - t) * 25}%)`;
}

export function isNewcomerStreamer(row: StreamerRecord): boolean {
  if (!row.firstStreamed) return false;
  return Date.now() - Date.parse(row.firstStreamed) <= 31_536e6;
}

export type LeaderboardSortKey =
  | "followers"
  | "avg"
  | "hours"
  | "payment"
  | "marketvalue"
  | "liveviewers"
  | "lastlive"
  | "newcomer"
  | "rank"
  | "name"
  | "degen"
  | "streamhours"
  | "leaderboard";

function parsePaymentString(raw: string | null | undefined): number {
  if (!raw) return 0;
  const match = raw.match(/([\d.]+)\s*([MK])?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "M") return 1e6 * num;
  if (suffix === "K") return 1e3 * num;
  return num;
}

export function leaderboardSortValue(
  row: StreamerRecord,
  key: LeaderboardSortKey,
): number {
  switch (key) {
    case "followers":
      return row.followers;
    case "avg":
      return row.avgViewers30d;
    case "hours":
      return row.hoursWatched30d;
    case "payment":
      return parsePaymentString(row.estMonthlyPayment);
    case "marketvalue":
      return mvOf(row) ?? 0;
    case "liveviewers":
      return row.liveViewers ?? 0;
    case "lastlive":
      return row.lastStreamed ? Date.parse(row.lastStreamed) : 0;
    case "newcomer":
      return row.firstStreamed ? Date.parse(row.firstStreamed) : 0;
    case "rank":
      return 0;
    case "name":
      return row.username.charCodeAt(0);
    case "degen":
      return row.degen === "High" ? 3 : row.degen === "Medium" ? 2 : 1;
    case "streamhours":
      return row.streamHours30d ?? 0;
    case "leaderboard":
      return row.monthlyLeaderboardUsd ?? 0;
    default:
      return 0;
  }
}

export function paymentBadgeStyle(raw: string): {
  color: string;
  borderColor: string;
  backgroundColor: string;
} | null {
  const amount = parseMoney(raw);
  if (!amount || amount <= 0) return null;
  const t = Math.min(Math.pow(Math.max(Math.log10(amount / 1e6), 0) / 3, 1.1), 1);
  const sat = 40 + 50 * t;
  const light = 55 - 15 * t;
  const color = `hsl(134, ${sat}%, ${light}%)`;
  return {
    color,
    borderColor: color,
    backgroundColor: `hsla(134, ${sat}%, ${light}%, 0.08)`,
  };
}

export const BUBBLE_CHART_COLORS = [
  "#8874ff",
  "#4ad17d",
  "#f5b83d",
  "#f7575f",
  "#5b9dff",
  "#b06bf5",
  "#4fd1c5",
  "#ec81a7",
  "#f59e6b",
  "#6ee7b7",
] as const;

export const STREAMER_TOP_LIMITS = [10, 25, 50, 100, "all"] as const;
