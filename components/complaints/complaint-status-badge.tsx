"use client";

import {
  complaintStatusMeta,
} from "@/lib/complaints/display";

type ComplaintStatusBadgeProps = {
  status: string | null | undefined;
  theme?: "auto" | "light" | "dark";
};

function StatusBadgeInner({
  status,
  light,
}: {
  status: string | null | undefined;
  light: boolean;
}) {
  const meta = complaintStatusMeta(status);
  const color = light
    ? ({
        "#4ADE80": "#1f9d57",
        "#FBBF24": "#b45309",
        "#F87171": "#dc2626",
        "#9CA3AF": "#6b7280",
        "#A48DFF": "#6b56e0",
        "#60A5FA": "#2563eb",
      }[meta.color] ?? meta.color)
    : meta.color;

  return (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full px-2 py-1 backdrop-blur-[35.5px]"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} ${light ? "12%" : "10%"}, transparent)`,
        boxShadow: light
          ? `inset 0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`
          : undefined,
      }}
    >
      <span
        className="size-[10px] shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-[12px] font-medium" style={{ color }}>
        {meta.label}
      </span>
    </span>
  );
}

/** Port of reference `StatusBadge` (800317). */
export function ComplaintStatusBadge({
  status,
  theme = "auto",
}: ComplaintStatusBadgeProps) {
  if (theme === "auto") {
    return (
      <>
        <span className="contents dark:hidden">
          <StatusBadgeInner status={status} light />
        </span>
        <span className="hidden dark:contents">
          <StatusBadgeInner status={status} light={false} />
        </span>
      </>
    );
  }
  return (
    <StatusBadgeInner status={status} light={theme === "light"} />
  );
}
