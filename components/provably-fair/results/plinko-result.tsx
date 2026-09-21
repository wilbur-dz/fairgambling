"use client";

export function PlinkoResult({
  path,
  bucket,
  multiplier,
}: {
  path: ("left" | "right")[];
  bucket: number;
  multiplier: number;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="text-center">
        <p className="mb-2 text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
          Multiplier
        </p>
        <p className="text-[44px] font-semibold leading-none text-[#8874ff]">
          {multiplier}
          <span className="text-[24px]">×</span>
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {path.map((dir, i) => (
          <span
            key={i}
            className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
              dir === "right"
                ? "bg-[#8874ff]/20 text-[#8874ff]"
                : "bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.55)] dark:bg-white/5 dark:text-white/50"
            }`}
          >
            {dir === "right" ? "R" : "L"}
          </span>
        ))}
      </div>
      <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/45">
        Bucket {bucket} of {path.length}
      </p>
    </div>
  );
}
