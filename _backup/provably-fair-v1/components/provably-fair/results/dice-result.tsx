"use client";

export function DiceResult({ roll }: { roll: number }) {
  const pct = Math.min(100, Math.max(0, roll));
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
          Roll Result
        </p>
        <p className="text-[48px] font-semibold leading-none text-[#2a274e] dark:text-white">
          {roll.toFixed(2)}
        </p>
      </div>
      <div className="relative h-3 w-full max-w-[320px] rounded-full bg-[rgba(42,39,78,0.08)] dark:bg-white/10">
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#8874ff] shadow-[0_0_0_3px_rgba(136,116,255,0.25)]"
          style={{ left: `${pct}%` }}
        />
        <div className="absolute inset-x-0 top-full mt-2 flex justify-between text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/35">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
