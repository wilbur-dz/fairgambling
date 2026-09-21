"use client";

const RED = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function pocketColor(n: number): string {
  if (n === 0) return "#22c55e";
  return RED.has(n) ? "#ef4444" : "#1f2937";
}

export function RouletteResult({ pocket }: { pocket: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Pocket
      </p>
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-[36px] font-semibold text-white shadow-lg"
        style={{ backgroundColor: pocketColor(pocket) }}
      >
        {pocket}
      </div>
      <p className="text-[13px] capitalize text-[rgba(42,39,78,0.5)] dark:text-white/45">
        {pocket === 0 ? "green" : RED.has(pocket) ? "red" : "black"}
      </p>
    </div>
  );
}
