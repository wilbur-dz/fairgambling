"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

type PendingCountdownProps = {
  expiresAt: number;
  onExpire?: () => void;
};

/** Live mm:ss countdown for pending account verification. */
export function PendingCountdown({
  expiresAt,
  onExpire,
}: PendingCountdownProps) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  const remaining =
    now === 0 ? null : Math.max(0, Math.floor((expiresAt - now) / 1000));

  useEffect(() => {
    if (remaining === 0 && onExpire) onExpire();
  }, [remaining, onExpire]);

  const label =
    remaining === null
      ? "—:—"
      : `${Math.floor(remaining / 60)}:${(remaining % 60)
          .toString()
          .padStart(2, "0")}`;

  return (
    <>
      <Clock size={11} className="shrink-0" />
      {label}
    </>
  );
}
