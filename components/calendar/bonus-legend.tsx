import { BONUS_META, LEGEND_ORDER } from "@/lib/calendar/data";

/** Bonus-type color legend under the month grid. */
export function BonusLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      {LEGEND_ORDER.map((id) => {
        const meta = BONUS_META[id];
        return (
          <span
            key={id}
            className="flex items-center gap-1.5 text-[12px] text-[rgba(42,39,78,0.55)] dark:text-white/55"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
