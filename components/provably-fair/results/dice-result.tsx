"use client";

/** Dice roll visualization matching mock/9 (always shows track). */
export function DiceResult({ roll }: { roll: number | null }) {
  const value = roll ?? 0;
  const pct = Math.min(100, Math.max(0, value));
  const hasResult = roll != null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg text-[rgba(42,39,78,0.55)] dark:text-white/50">
        Roll Result
      </p>
      <div className="flex h-[48px] items-center gap-2">
        {hasResult ? (
          <p className="text-[40px] font-semibold leading-none text-[#2a274e] dark:text-white">
            {value.toFixed(2)}
          </p>
        ) : null}
      </div>

      <div className="mt-6 w-full rounded-[22px] border border-[rgba(42,39,78,0.12)] bg-white p-4 sm:p-6 dark:border-white/[0.08] dark:bg-[#161C32]">
        <div className="relative">
          <div className="relative mb-4 h-2">
            <div className="absolute inset-0 h-2 rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-[rgba(255,255,255,0.12)]" />
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-[#8874ff]"
              style={{ width: `${pct}%` }}
            />
            <div
              className="pointer-events-none absolute top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#8874ff] shadow-md"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="relative h-5">
            {[0, 25, 50, 75, 100].map((n) => (
              <span
                key={n}
                className="absolute text-sm text-[rgba(42,39,78,0.45)] dark:text-white/45"
                style={{ left: `${n}%`, transform: "translateX(-50%)" }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
