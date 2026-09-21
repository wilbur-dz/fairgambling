"use client";

const GEM_COLORS: Record<string, string> = {
  green: "#22c55e",
  purple: "#a855f7",
  yellow: "#eab308",
  red: "#ef4444",
  cyan: "#06b6d4",
  pink: "#ec4899",
  blue: "#3b82f6",
};

export function DiamondsResult({ gems }: { gems: string[] }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Gems
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {gems.map((gem, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className="h-12 w-12 rotate-45 rounded-[6px] shadow-md"
              style={{ backgroundColor: GEM_COLORS[gem] ?? "#8874ff" }}
            />
            <span className="text-[11px] capitalize text-[rgba(42,39,78,0.5)] dark:text-white/45">
              {gem}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
