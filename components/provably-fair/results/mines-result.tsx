"use client";

export function MinesResult({
  mines,
  gridSize = 25,
}: {
  mines: number[];
  gridSize?: number;
}) {
  const cols = Math.round(Math.sqrt(gridSize));
  const mineSet = new Set(mines);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Mine Positions
      </p>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: gridSize }, (_, i) => {
          const isMine = mineSet.has(i);
          return (
            <div
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-[12px] font-medium ${
                isMine
                  ? "bg-[#ef4444]/90 text-white"
                  : "bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.45)] dark:bg-white/5 dark:text-white/40"
              }`}
            >
              {isMine ? "●" : i + 1}
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/45">
        {mines.length} mines · cells {mines.map((m) => m + 1).join(", ")}
      </p>
    </div>
  );
}
