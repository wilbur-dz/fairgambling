"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/calendar/format";

/** Live countdown that ticks every second. */
export function Countdown({
  targetMs,
  upper = false,
  className = "",
}: {
  targetMs: number;
  upper?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span suppressHydrationWarning className={`tabular-nums ${className}`}>
      {formatCountdown(targetMs, now, { upper })}
    </span>
  );
}
