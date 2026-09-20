type LiveBadgeProps = {
  active?: boolean;
  color?: "green" | "red";
  theme?: "auto" | "light" | "dark";
  compact?: boolean;
  className?: string;
};

/** Port of reference `LiveBadge`. */
export function LiveBadge({
  active = true,
  color = "green",
  theme = "dark",
  compact = false,
  className = "",
}: LiveBadgeProps) {
  const dot = color === "red" ? "#f7575f" : "#00ff86";

  return (
    <span
      className={
        compact
          ? `relative inline-flex h-4 items-center justify-center overflow-hidden rounded-[4px] px-[5px] ${className}`
          : `relative inline-flex h-6 items-center justify-center gap-1.5 overflow-hidden rounded-[50px] border bg-white/[0.05] px-2.5 backdrop-blur-[35.5px] ${className}`
      }
      style={
        compact
          ? { backgroundColor: color === "red" ? "#dc2626" : "#00893f" }
          : { borderColor: color === "red" ? "#6A3A3A" : "#346A63" }
      }
    >
      {active && !compact ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[50px] opacity-40 blur-[10px]"
          style={{ backgroundColor: dot }}
        />
      ) : null}
      {!compact ? (
        <span className="relative z-10 flex size-1.5 items-center justify-center">
          {active ? (
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: dot }}
            />
          ) : null}
          <span
            className="relative size-1.5 rounded-full"
            style={{ backgroundColor: active ? dot : "#6b7280" }}
          />
        </span>
      ) : null}
      <span
        className={`relative z-10 block leading-none ${
          compact
            ? "text-[10px] font-semibold tracking-[0.01em] text-white"
            : `text-[13px] font-medium${
                theme === "auto" ? " text-black dark:text-white" : ""
              }`
        }`}
        style={
          compact || theme === "auto"
            ? undefined
            : { color: theme === "light" ? "#000000" : "#ffffff" }
        }
      >
        Live
      </span>
    </span>
  );
}
