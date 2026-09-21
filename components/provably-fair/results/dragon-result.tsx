"use client";

export function DragonResult({
  levels,
}: {
  levels: {
    level: number;
    eggPositions: number[];
    safePositions: number[];
  }[];
}) {
  const tiles =
    levels[0]
      ? levels[0].eggPositions.length + levels[0].safePositions.length
      : 0;

  return (
    <div className="flex flex-col gap-3 py-2">
      <p className="text-center text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Dragon Tower
      </p>
      <div className="flex flex-col-reverse gap-1.5">
        {levels.map((lvl) => {
          const eggs = new Set(lvl.eggPositions);
          return (
            <div key={lvl.level} className="flex items-center gap-2">
              <span className="w-6 text-right text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/35">
                {lvl.level}
              </span>
              <div className="flex flex-1 gap-1">
                {Array.from({ length: tiles }, (_, i) => (
                  <div
                    key={i}
                    className={`flex h-8 flex-1 items-center justify-center rounded-[8px] text-[11px] font-medium ${
                      eggs.has(i)
                        ? "bg-[#f59e0b]/90 text-white"
                        : "bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.35)] dark:bg-white/5 dark:text-white/30"
                    }`}
                  >
                    {eggs.has(i) ? "E" : ""}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
