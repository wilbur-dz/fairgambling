import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { SUPPORTED_SITES } from "@/lib/leaderboard/data";

/** Partnered casino chips that count toward the leaderboard. */
export function SupportedSites() {
  return (
    <Card variant="panel" padded={false} className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <p className="shrink-0 text-xs font-semibold text-[rgba(42,39,78,0.8)] sm:text-sm dark:text-white/80">
          Supported Sites
        </p>
        <div className="scrollbar-hide flex max-w-full items-center gap-2.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {SUPPORTED_SITES.map((site) => (
            <div
              key={site}
              title={site}
              className="flex shrink-0 items-center gap-1.5 rounded-full border-[0.5px] border-[rgba(42,39,78,0.1)] bg-white/[0.5] py-1 pl-1 pr-2.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <AnalyticsCasinoIcon
                casinoName={site}
                size={20}
                theme="auto"
              />
              <span className="whitespace-nowrap text-[11px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60">
                {site}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
        Only wager on these partnered casinos counts toward the leaderboard.
      </p>
    </Card>
  );
}
