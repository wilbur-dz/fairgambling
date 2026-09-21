import type { TimeLeftTone } from "@/lib/complaints/deadlines";

type TimeLeftRingProps = {
  tone: TimeLeftTone;
  percentRemaining: number;
  theme?: "auto" | "light" | "dark";
};

function ringColor(tone: TimeLeftTone, light: boolean): string {
  if (tone === "green") return light ? "#1f9d57" : "#58FF77";
  if (tone === "amber") return light ? "#b45309" : "#FFD258";
  if (tone === "red") return light ? "#dc2626" : "#FB3748";
  return light ? "rgba(42,39,78,0.40)" : "rgba(255,255,255,0.40)";
}

function TimeLeftRingInner({
  tone,
  percentRemaining,
  light,
}: Omit<TimeLeftRingProps, "theme"> & { light: boolean }) {
  const stroke = ringColor(tone, light);
  const circumference = 2 * Math.PI * 7;
  const dash = (Math.max(0, Math.min(100, percentRemaining)) / 100) * circumference;

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke={stroke}
        strokeOpacity={0.2}
        strokeWidth="1.5"
      />
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}

/** Port of reference `TimeLeftRing` (800317). */
export function TimeLeftRing({
  tone,
  percentRemaining,
  theme = "dark",
}: TimeLeftRingProps) {
  if (theme === "auto") {
    return (
      <>
        <span className="contents dark:hidden">
          <TimeLeftRingInner
            tone={tone}
            percentRemaining={percentRemaining}
            light
          />
        </span>
        <span className="hidden dark:contents">
          <TimeLeftRingInner
            tone={tone}
            percentRemaining={percentRemaining}
            light={false}
          />
        </span>
      </>
    );
  }
  return (
    <TimeLeftRingInner
      tone={tone}
      percentRemaining={percentRemaining}
      light={theme === "light"}
    />
  );
}
