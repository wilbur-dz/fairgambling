"use client";

export function KenoResult({ drawn }: { drawn: number[] }) {
  const set = new Set(drawn);
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Drawn Numbers
      </p>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: 40 }, (_, i) => {
          const n = i + 1;
          const hit = set.has(n);
          return (
            <div
              key={n}
              className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[12px] font-medium ${
                hit
                  ? "bg-[#8874ff] text-white"
                  : "bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.45)] dark:bg-white/5 dark:text-white/40"
              }`}
            >
              {n}
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/45">
        {drawn.join(", ")}
      </p>
    </div>
  );
}
