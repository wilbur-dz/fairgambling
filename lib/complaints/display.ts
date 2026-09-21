import { stripReviewHtml } from "@/lib/reviews/format";

export const COMPLAINT_CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "bonus", label: "Bonus" },
  { value: "responsible_gambling", label: "Responsible Gambling" },
  { value: "kyc", label: "KYC" },
  { value: "account_restricted", label: "Account Restricted" },
  { value: "provably_fair", label: "Provably Fair" },
  { value: "affiliate", label: "Affiliate" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
] as const;

export const COMPLAINT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "unresolved", label: "Unresolved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
] as const;

export function isAllFilterValue(value: string | null | undefined): boolean {
  return !value || value === "all";
}

export function complaintCategoryLabel(category: string | null | undefined): string {
  if (!category) return "—";
  return (
    COMPLAINT_CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label ??
    category
  );
}

export function stripHtmlTags(html: string): string {
  return stripReviewHtml(html);
}

export function formatComplaintPublicId(id: string | number): string {
  return `#DC-${String(id).padStart(4, "0")}`;
}

export function formatComplaintAmount(
  value: number | string | null | undefined,
): string {
  if (value == null || value === "") return "";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatComplaintOpenedDate(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatComplaintFundsRecovered(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatComplaintResponseTime(hours: number | null | undefined): string {
  if (hours == null) return "—";
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/** Port of reference `formatRelative` (800317). */
export function formatComplaintRelative(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.round((Date.now() - then) / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function formatComplaintDisputeCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString("en-US");
}

export function formatComplaintFundsRecoveredLarge(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

type StatusMeta = { label: string; color: string };

/** Port of reference `q` (800317). */
export function complaintStatusMeta(status: string | null | undefined): StatusMeta {
  switch (status) {
    case "resolved":
      return { label: "Resolved", color: "#4ADE80" };
    case "awaiting_casino":
      return { label: "Awaiting Casino", color: "#FBBF24" };
    case "unresolved":
      return { label: "Unresolved", color: "#F87171" };
    case "rejected":
      return { label: "Rejected", color: "#9CA3AF" };
    case "withdrawn":
      return { label: "Withdrawn", color: "#9CA3AF" };
    case "draft":
      return { label: "Draft", color: "#9CA3AF" };
    case "reopened":
      return { label: "Reopened", color: "#A48DFF" };
    case "pending_approval":
    case "pending":
      return { label: "Pending", color: "#60A5FA" };
    case "open":
      return { label: "Open", color: "#A48DFF" };
    default:
      return { label: "Open", color: "#A48DFF" };
  }
}
