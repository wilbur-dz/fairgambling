import type { PublicComplaint } from "@/lib/complaints/types";

export type TimeLeftTone = "green" | "amber" | "red" | "gray";

export type TimeLeftInfo = {
  label: string;
  tone: TimeLeftTone;
  overdue: boolean;
};

/** Port of reference `activeDeadline` (203027). */
export function activeDeadline(
  status: string | null | undefined,
  row: PublicComplaint,
): string | null {
  switch (status) {
    case "awaiting_casino":
      return row.casinoDeadlineAt ?? null;
    case "awaiting_clarification":
    case "pending_approval":
    case "in_mediation":
      return row.userReplyDeadlineAt ?? null;
    case "awaiting_settlement_confirmation":
      return row.receiptDeadlineAt ?? null;
    default:
      return null;
  }
}

/** Port of reference `timeLeft` (203027). */
export function timeLeft(
  deadlineIso: string | null | undefined,
  now: Date = new Date(),
): TimeLeftInfo {
  if (!deadlineIso) {
    return { label: "—", tone: "gray", overdue: false };
  }

  const ms = new Date(deadlineIso).getTime() - now.getTime();
  if (Number.isNaN(ms)) {
    return { label: "—", tone: "gray", overdue: false };
  }
  if (ms <= 0) {
    return { label: "Overdue", tone: "red", overdue: true };
  }

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const percentRemaining = (ms / weekMs) * 100;
  const tone: TimeLeftTone =
    percentRemaining > 50 ? "green" : percentRemaining >= 10 ? "amber" : "red";

  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (days >= 1) {
    return {
      label: hours > 0 ? `${days}d ${hours}h left` : `${days}d left`,
      tone,
      overdue: false,
    };
  }
  if (hours >= 1) {
    return {
      label: minutes > 0 ? `${hours}h ${minutes}m left` : `${hours}h left`,
      tone,
      overdue: false,
    };
  }
  return {
    label: `${Math.max(1, minutes)}m left`,
    tone,
    overdue: false,
  };
}
