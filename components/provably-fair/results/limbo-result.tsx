"use client";

export function LimboResult({ multiplier }: { multiplier: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Crash Multiplier
      </p>
      <p className="text-[52px] font-semibold leading-none text-[#8874ff]">
        {multiplier.toFixed(2)}
        <span className="text-[28px]">×</span>
      </p>
    </div>
  );
}
