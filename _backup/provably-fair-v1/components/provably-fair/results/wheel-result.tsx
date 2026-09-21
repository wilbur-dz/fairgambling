"use client";

export function WheelResultView({
  index,
  multiplier,
}: {
  index: number;
  multiplier: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Segment
      </p>
      <p className="text-[40px] font-semibold leading-none text-[#2a274e] dark:text-white">
        #{index}
      </p>
      <p className="text-[28px] font-semibold text-[#8874ff]">
        {multiplier}
        <span className="text-[18px]">×</span>
      </p>
    </div>
  );
}
