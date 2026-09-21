"use client";

import Link from "next/link";
import { ChevronDown, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Watermark } from "@/components/ui/watermark";
import type { CasinoSentiment, ReviewCasino } from "@/lib/reviews/data";
import { casinoPageHref } from "@/lib/reviews/format";

type SortKey =
  | "casino"
  | "rating"
  | "reviews"
  | "positive"
  | "pros"
  | "cons";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; cls?: string }[] = [
  { key: "casino", label: "Casino" },
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Reviews", cls: "hidden lg:table-cell" },
  { key: "positive", label: "Positive" },
  { key: "pros", label: "Top Positive", cls: "w-full lg:w-auto" },
  { key: "cons", label: "Top Negative", cls: "hidden lg:table-cell" },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDir;
}) {
  return (
    <span
      className={`inline-flex flex-col leading-none ${
        active ? "opacity-100" : "opacity-30"
      }`}
      aria-hidden
    >
      <span
        className={`text-[8px] ${
          active && direction === "asc" ? "text-[#8874ff]" : ""
        }`}
      >
        ▲
      </span>
      <span
        className={`-mt-0.5 text-[8px] ${
          active && direction === "desc" ? "text-[#8874ff]" : ""
        }`}
      >
        ▼
      </span>
    </span>
  );
}

type SentimentByCasinoProps = {
  casinos: ReviewCasino[];
  sentiment: CasinoSentiment[];
};

/** Port of reference Sentiment by Casino (`J`). */
export function SentimentByCasino({
  casinos,
  sentiment,
}: SentimentByCasinoProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState(false);

  const sentimentMap = useMemo(
    () => new Map(sentiment.map((row) => [row.casinoId, row])),
    [sentiment],
  );

  const rows = useMemo(() => {
    return casinos
      .filter((c) => c.averageRating != null && (c.reviewCount ?? 0) > 0)
      .map((casino) => {
        const hit =
          sentimentMap.get(casino.id) ??
          sentimentMap.get(casino.slug) ??
          sentimentMap.get(casino.name.toLowerCase());
        const positivePct = hit
          ? hit.positivePct
          : Math.round(((casino.averageRating ?? 0) / 5) * 100);
        return {
          casino,
          positivePct,
          pros: hit?.topPositive ?? null,
          cons: hit?.topNegative ?? null,
        };
      });
  }, [casinos, sentimentMap]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case "casino":
          return a.casino.name.localeCompare(b.casino.name) * dir;
        case "reviews":
          return (
            ((a.casino.reviewCount ?? 0) - (b.casino.reviewCount ?? 0)) * dir
          );
        case "positive":
          return (a.positivePct - b.positivePct) * dir;
        case "pros":
          return (a.pros ?? "").localeCompare(b.pros ?? "") * dir;
        case "cons":
          return (a.cons ?? "").localeCompare(b.cons ?? "") * dir;
        default:
          return (
            ((a.casino.averageRating ?? 0) - (b.casino.averageRating ?? 0)) *
            dir
          );
      }
    });
  }, [rows, sortKey, sortDir]);

  if (rows.length === 0) return null;

  const visible = expanded ? sorted : sorted.slice(0, 10);
  const cell =
    "border-b border-[#2a274e]/[0.08] px-2 align-middle lg:px-4 dark:border-[#eaecf0]/10";
  const hover =
    "group-hover:bg-[#2a274e]/[0.02] dark:group-hover:bg-white/[0.02]";
  const text = "text-[#2a274e] dark:text-white";

  return (
    <Card variant="panel" blur>
      <div className="flex flex-col gap-4 md:gap-6">
        <h2 className={`text-[18px] font-medium ${text}`}>
          Sentiment by Casino
        </h2>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <Watermark opacity={0.05} logoWidth={300} repeat={1}>
            <table className="w-full border-separate border-spacing-0 text-left lg:min-w-[820px]">
              <thead>
                <tr className="h-11">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`border-b border-[#2a274e]/[0.08] px-2 text-[12px] font-medium uppercase text-[#2a274e]/40 lg:px-4 dark:border-white/[0.06] dark:text-white/30 ${
                        col.cls ?? ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (col.key === sortKey) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortKey(col.key);
                            setSortDir(
                              col.key === "casino" ||
                                col.key === "pros" ||
                                col.key === "cons"
                                ? "asc"
                                : "desc",
                            );
                          }
                        }}
                        className="flex items-center gap-1 uppercase hover:text-[#2a274e]/70 dark:hover:text-white/70"
                      >
                        <span
                          className={
                            col.key === "casino" ? "hidden lg:inline" : undefined
                          }
                        >
                          {col.label}
                        </span>
                        <SortIcon
                          active={sortKey === col.key}
                          direction={sortDir}
                        />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.casino.id} className="group h-[54px]">
                    <td className={`${cell} ${hover}`}>
                      <Link
                        href={casinoPageHref(row.casino.slug)}
                        prefetch={false}
                        className="flex items-center justify-center gap-0 hover:opacity-80 lg:justify-start lg:gap-2"
                      >
                        <span className="size-[26px] shrink-0">
                          <AnalyticsCasinoIcon
                            casinoName={row.casino.name}
                            size={26}
                            theme="auto"
                          />
                        </span>
                        <span
                          className={`hidden truncate text-[14px] font-semibold lg:block ${text}`}
                        >
                          {row.casino.name}
                        </span>
                      </Link>
                    </td>
                    <td className={`${cell} ${hover}`}>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Star
                          size={14}
                          className="text-[#FFCF2F]"
                          fill="currentColor"
                        />
                        <span className={`text-[14px] font-medium ${text}`}>
                          {(row.casino.averageRating ?? 0).toFixed(1)}
                        </span>
                        <span className="text-[12px] font-medium text-[#2a274e]/50 dark:text-[#97a1af]">
                          / 5
                        </span>
                      </span>
                    </td>
                    <td
                      className={`${cell} hidden text-[14px] font-medium ${text} ${hover} lg:table-cell`}
                    >
                      {(row.casino.reviewCount ?? 0).toLocaleString()}
                    </td>
                    <td className={`${cell} ${hover}`}>
                      <span className="flex items-center gap-3">
                        <span className="w-9 text-right text-[14px] font-medium text-[#2a274e]/80 dark:text-white/80">
                          {row.positivePct}%
                        </span>
                        <span className="hidden h-[6px] w-16 overflow-hidden rounded-full bg-[#2a274e]/10 lg:block dark:bg-[#344051]">
                          <span
                            className="block h-full rounded-full bg-[#9a80f9]"
                            style={{ width: `${row.positivePct}%` }}
                          />
                        </span>
                      </span>
                    </td>
                    <td className={`${cell} w-full ${hover} lg:w-auto`}>
                      {row.pros ? (
                        <span className="inline-flex items-center rounded-[4px] bg-[#1f9d57]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#1f9d57] dark:bg-[#00ff86]/10 dark:text-[#00ff86]">
                          {row.pros}
                        </span>
                      ) : (
                        <span className="text-[14px] text-[#2a274e]/30 dark:text-white/30">
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className={`${cell} hidden ${hover} lg:table-cell lg:w-auto`}
                    >
                      {row.cons ? (
                        <span className="inline-flex items-center rounded-[4px] bg-[rgba(247,87,95,0.1)] px-1.5 py-0.5 text-[10px] font-medium text-[#f7575f]">
                          {row.cons}
                        </span>
                      ) : (
                        <span className="text-[14px] text-[#2a274e]/30 dark:text-white/30">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Watermark>
        </div>
        {sorted.length > 10 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mx-auto flex h-[48px] items-center gap-2 rounded-[50px] border-[0.5px] border-[#2a274e]/15 bg-[rgba(133,111,252,0.04)] px-3 text-[14px] font-medium text-[#8874ff] backdrop-blur-[8px] transition-colors hover:bg-[rgba(133,111,252,0.08)] dark:border-white/20"
          >
            {expanded ? "Show Less" : "Show All Tracking"}
            <ChevronDown
              size={24}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
