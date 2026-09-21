"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Watermark } from "@/components/ui/watermark";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";
import { REVIEWABLE_CASINO_SLUGS } from "@/lib/reviews/constants";
import type { ReviewCasino, ReviewMarketRow } from "@/lib/reviews/data";
import { casinoPageHref } from "@/lib/reviews/format";

function marketVolumeKey(name: string) {
  return name.toLowerCase().replace(/[-\s]/g, "");
}

export type BestRatedCasinosProps = {
  /** Reference `ReviewsView` → `initialCasinos` (`e`). */
  casinos: ReviewCasino[];
  /** Reference `ReviewsView` → `initialMarketData` (`d`). */
  marketData: ReviewMarketRow[];
};

type SortKey = "rank" | "name" | "reviews" | "rating";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey | null; label: string; cls: string }[] = [
  {
    key: "rank",
    label: "#",
    cls: "hidden w-10 pr-1.5 lg:table-cell lg:w-12 lg:pr-2",
  },
  { key: "name", label: "Casino", cls: "pr-2 lg:pr-3" },
  { key: "reviews", label: "Reviews", cls: "px-2 lg:px-3" },
  {
    key: "rating",
    label: "Avg Rating",
    cls: "w-full px-2 lg:w-auto lg:px-3",
  },
  {
    key: null,
    label: "",
    cls: "hidden pl-2 text-right lg:table-cell lg:pl-3",
  },
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

/** Port of reference Best Rated table (`j`); list prep matches `ReviewsView` `N` (L2147–2165). */
export function BestRatedCasinos({
  casinos,
  marketData,
}: BestRatedCasinosProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("reviews");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState(false);

  const volumeByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of marketData) {
      map.set(marketVolumeKey(row.casinoName), row.depositVolume);
    }
    return map;
  }, [marketData]);

  const reviewableCasinos = useMemo(() => {
    const filtered = casinos.filter(
      (casino) =>
        REVIEWABLE_CASINO_SLUGS.has(casino.slug) &&
        (casino.logoUrl || getCasinoLogoUrl(casino.slug, "light")),
    );
    const seen = new Set<string>();
    return filtered
      .filter((casino) => {
        const key = casino.slug.replace(/-/g, "").toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const left = volumeByName.get(marketVolumeKey(a.name)) ?? 0;
        const right = volumeByName.get(marketVolumeKey(b.name)) ?? 0;
        return right - left;
      });
  }, [casinos, volumeByName]);

  const rated = useMemo(
    () =>
      reviewableCasinos.filter(
        (c) => c.averageRating != null && (c.reviewCount ?? 0) > 0,
      ),
    [reviewableCasinos],
  );

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rated].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "reviews":
          return ((a.reviewCount ?? 0) - (b.reviewCount ?? 0)) * dir;
        case "rank":
          return 0;
        default:
          return ((a.averageRating ?? 0) - (b.averageRating ?? 0)) * dir;
      }
    });
  }, [rated, sortKey, sortDir]);

  if (rated.length === 0) return null;

  const rows = expanded ? sorted : sorted.slice(0, 10);
  const cellBorder =
    "border-b border-[#2a274e]/[0.08] dark:border-[#eaecf0]/10";
  const hover = "group-hover:bg-[#2a274e]/[0.02] dark:group-hover:bg-white/[0.02]";
  const text = "text-[#2a274e] dark:text-white";
  const muted = "text-[#2a274e]/50 dark:text-[#97a1af]";

  return (
    <Card variant="panel" blur>
      <div className="flex flex-col gap-4 md:gap-6">
        <h2 className={`text-[18px] font-medium ${text}`}>
          Best Rated Casinos
        </h2>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <Watermark
            opacity={0.05}
            logoWidth={300}
            repeat={Math.max(1, Math.ceil(rows.length / 12))}
          >
            <table className="w-full border-separate border-spacing-0 text-left lg:min-w-[640px]">
              <thead>
                <tr className="h-11">
                  {COLUMNS.map((col, index) => (
                    <th
                      key={index}
                      className={`text-[12px] font-medium uppercase text-[#2a274e]/40 dark:text-white/30 ${col.cls}`}
                    >
                      {col.key ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (col.key === sortKey) {
                              setSortDir((d) =>
                                d === "asc" ? "desc" : "asc",
                              );
                            } else {
                              setSortKey(col.key!);
                              setSortDir(col.key === "name" ? "asc" : "desc");
                            }
                          }}
                          className="flex items-center gap-1.5 whitespace-nowrap uppercase hover:text-[#2a274e]/70 dark:hover:text-white/70"
                        >
                          <span>{col.label}</span>
                          <SortIcon
                            active={sortKey === col.key}
                            direction={sortDir}
                          />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((casino, index) => (
                  <tr key={casino.id} className="group h-[54px]">
                    <td
                      className={`${cellBorder} hidden w-10 pr-1.5 text-[14px] font-medium ${muted} ${hover} lg:table-cell lg:w-12 lg:pr-2`}
                    >
                      {index + 1}
                    </td>
                    <td className={`${cellBorder} pr-2 ${hover} lg:pr-3`}>
                      <Link
                        href={casinoPageHref(casino.slug)}
                        prefetch={false}
                        className="flex min-w-0 items-center gap-2.5 hover:opacity-80"
                      >
                        <span className="size-[26px] shrink-0">
                          <AnalyticsCasinoIcon
                            casinoName={casino.name}
                            size={26}
                            theme="auto"
                          />
                        </span>
                        <span
                          className={`block truncate text-[14px] font-semibold ${text}`}
                        >
                          {casino.name}
                        </span>
                      </Link>
                    </td>
                    <td
                      className={`${cellBorder} px-2 text-[14px] font-medium ${text} ${hover} lg:px-3`}
                    >
                      {(casino.reviewCount ?? 0).toLocaleString()}
                    </td>
                    <td
                      className={`${cellBorder} w-full px-2 ${hover} lg:w-auto lg:px-3`}
                    >
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Star
                          size={14}
                          className="text-[#FFCF2F]"
                          fill="currentColor"
                        />
                        <span className={`text-[14px] font-medium ${text}`}>
                          {(casino.averageRating ?? 0).toFixed(1)}
                        </span>
                        <span className={`text-[12px] font-medium ${muted}`}>
                          / 5
                        </span>
                      </span>
                    </td>
                    <td
                      className={`${cellBorder} hidden pr-2 pl-2 text-right ${hover} lg:table-cell lg:pr-4 lg:pl-3`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/${casino.slug}/reviews`)
                        }
                        className="whitespace-nowrap text-[14px] text-[#8874ff] underline underline-offset-2 hover:opacity-80"
                      >
                        View More
                      </button>
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
