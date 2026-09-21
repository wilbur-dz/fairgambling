type SortIconProps = {
  active: boolean;
  direction: "asc" | "desc";
  theme?: "auto" | "light" | "dark";
};

/** Port of reference `SortIcon` (800317). */
export function ComplaintSortIcon({
  active,
  direction,
  theme = "auto",
}: SortIconProps) {
  if (theme === "auto") {
    const stroke = (on: boolean) =>
      on
        ? "text-[#2a274e] dark:text-white"
        : "text-[#2a274e]/35 dark:text-[#414E62]";

    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M0.833 3.75L3.083 1.5M3.083 1.5L5.333 3.75M3.083 1.5V8.25"
          stroke="currentColor"
          className={stroke(active && direction === "asc")}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.167 8.25L8.917 10.5M8.917 10.5L6.667 8.25M8.917 10.5V3.75"
          stroke="currentColor"
          className={stroke(active && direction === "desc")}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const activeStroke = theme === "light" ? "#2a274e" : "#ffffff";
  const idleStroke = theme === "light" ? "rgba(42,39,78,0.35)" : "#414E62";

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M0.833 3.75L3.083 1.5M3.083 1.5L5.333 3.75M3.083 1.5V8.25"
        stroke={active && direction === "asc" ? activeStroke : idleStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.167 8.25L8.917 10.5M8.917 10.5L6.667 8.25M8.917 10.5V3.75"
        stroke={active && direction === "desc" ? activeStroke : idleStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
