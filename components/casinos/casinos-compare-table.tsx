"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { RatingGauge } from "@/components/ui/rating-gauge";
import { Watermark } from "@/components/ui/watermark";
import {
  MAJOR_GAME_PROVIDERS,
  MAJOR_HOUSE_GAMES,
  TABLE_CATEGORIES,
  type TableCategoryId,
} from "@/lib/casinos/categories";
import {
  licenseImageSrc,
  type OverviewCasino,
} from "@/lib/casinos/data";
import { getCategoryScoreColor } from "@/lib/casinos/score-color";

type ColumnDef = {
  key: string;
  label: string;
  width: number;
  render: (casino: OverviewCasino) => React.ReactNode;
};

function cellText(value: string | number) {
  return (
    <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
      {value}
    </span>
  );
}

function cellEmpty() {
  return (
    <span className="text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
      —
    </span>
  );
}

function levelBars(label: string, level: number, color: string) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className="text-[12px] font-medium"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        {label}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="h-1 w-4 rounded-[10px]"
            style={{
              backgroundColor:
                n <= level ? color : "var(--nd-divider, rgba(42,39,78,0.12))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function yesLink(href: string, enabled: boolean) {
  if (!enabled) {
    return (
      <span className="text-[14px] font-medium text-[rgba(42,39,78,0.4)] dark:text-white/40">
        No
      </span>
    );
  }
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex items-center gap-1 hover:opacity-80"
    >
      <span className="text-[14px] font-medium text-[#4ADE80]">Yes</span>
      <ExternalLink size={12} className="text-[#8874ff]" />
    </Link>
  );
}

const PF_LEVEL: Record<string, [number, string]> = {
  "Provably Fair": [3, "#00FF86"],
  "Semi-Fair": [2, "#F6B51E"],
  "Not Fair": [1, "#FB3748"],
};

const KYC_LEVEL: Record<string, [number, string]> = {
  "Full KYC": [3, "#00FF86"],
  "Light KYC": [2, "#F6B51E"],
  "No KYC": [1, "#FB3748"],
};

const RG_LEVEL: Record<string, [number, string]> = {
  Comprehensive: [3, "#00FF86"],
  Standard: [2, "#F6B51E"],
  Minimal: [1, "#FB3748"],
};

function formatMaxBet(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[.,]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("de-DE");
}

const COLUMN_GROUPS: Record<TableCategoryId, ColumnDef[]> = {
  basicInfo: [
    {
      key: "founded",
      label: "Founded",
      width: 120,
      render: (c) => cellText(c.founded ?? "—"),
    },
    {
      key: "depositVolume30d",
      label: "30d Deposit Vol.",
      width: 150,
      render: (c) => cellText(c.depositVolume30d),
    },
    {
      key: "estimatedNgr",
      label: "Est. NGR",
      width: 120,
      render: (c) => (c.estimatedNgr ? cellText(c.estimatedNgr) : cellEmpty()),
    },
    {
      key: "userReviews",
      label: "User Reviews",
      width: 140,
      render: (c) =>
        (c.reviewCount ?? 0) <= 0 || c.userReviews <= 0 ? (
          cellEmpty()
        ) : (
          <span className="flex items-center gap-1.5">
            <Star size={14} className="text-[#FFCF2F]" fill="currentColor" />
            <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
              {c.userReviews.toFixed(1)}
            </span>
            <span className="text-[12px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
              / 5
            </span>
          </span>
        ),
    },
    {
      key: "fgRating",
      label: "Rating",
      width: 110,
      render: (c) =>
        c.fgPending ? (
          <span className="rounded-full border border-[rgba(42,39,78,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.5)] dark:border-white/15 dark:text-white/50">
            Soon
          </span>
        ) : (
          <RatingGauge value={c.fgRating} maxValue={100} color="#3EBC63" />
        ),
    },
    {
      key: "license",
      label: "License",
      width: 150,
      render: (c) => {
        const src = licenseImageSrc(c.license.icon);
        return (
          <span className="flex items-center gap-2">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={c.license.name}
                className="size-5 object-contain"
              />
            ) : (
              <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(42,39,78,0.06)] text-[10px] dark:bg-white/10">
                🔒
              </span>
            )}
            <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
              {c.license.name}
            </span>
          </span>
        );
      },
    },
  ],
  gamesInfo: [
    {
      key: "numOriginals",
      label: "# of Originals",
      width: 130,
      render: (c) => cellText(c.numOriginals),
    },
    {
      key: "provablyFair",
      label: "Provably Fair",
      width: 140,
      render: (c) => {
        const level = PF_LEVEL[c.provablyFair];
        return level ? levelBars(c.provablyFair, ...level) : cellEmpty();
      },
    },
    {
      key: "avgHouseEdge",
      label: "Avg. House Edge",
      width: 150,
      render: (c) =>
        c.avgHouseEdge != null ? cellText(`${c.avgHouseEdge}%`) : cellEmpty(),
    },
    {
      key: "numSlots",
      label: "# of Slots",
      width: 120,
      render: (c) => cellText(c.numSlots.toLocaleString()),
    },
    {
      key: "totalProviders",
      label: "# Providers",
      width: 120,
      render: (c) => cellText(`${c.totalProviders}+`),
    },
    {
      key: "sportsbook",
      label: "Sportsbook",
      width: 150,
      render: (c) => {
        if (c.sportsbook.name === "None" || c.sportsbook.name === "No") {
          return cellText("No");
        }
        return (
          <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
            {c.sportsbook.hasOwn ? "In-House" : c.sportsbook.name}
          </span>
        );
      },
    },
    {
      key: "avgVigSports",
      label: "Sports Edge",
      width: 120,
      render: (c) =>
        c.avgVigSports != null ? cellText(`${c.avgVigSports}%`) : cellEmpty(),
    },
    {
      key: "hasSeedAnalyzer",
      label: "Seed Analyzer",
      width: 130,
      render: (c) => yesLink(`/seed-analyzer/${c.slug}`, c.hasSeedAnalyzer),
    },
  ],
  bonusing: [
    {
      key: "bonusRating",
      label: "Bonus Rating",
      width: 120,
      render: (c) =>
        c.bonusRating > 3 || (c.bonusRating === 3 && c.slug === "rainbet") ? (
          <RatingGauge
            value={c.bonusRating}
            maxValue={10}
            color={getCategoryScoreColor(c.bonusRating)}
          />
        ) : (
          cellEmpty()
        ),
    },
    {
      key: "estRakeback",
      label: "Est. Rakeback",
      width: 130,
      render: (c) =>
        c.estRakebackStr ? (
          cellText(c.estRakebackStr)
        ) : (
          <span className="text-[12px] italic text-[rgba(42,39,78,0.4)] dark:text-white/40">
            Coming soon
          </span>
        ),
    },
    {
      key: "estLossback",
      label: "Est. Lossback",
      width: 130,
      render: (c) =>
        c.estLossbackStr ? cellText(c.estLossbackStr) : cellEmpty(),
    },
    {
      key: "hasCodeFeed",
      label: "Code Feed",
      width: 120,
      render: (c) => yesLink(`/${c.slug}#codes`, c.hasCodeFeed),
    },
    {
      key: "leaderboardRaffle",
      label: "Leaderboard / Raffle (30d)",
      width: 200,
      render: (c) =>
        c.leaderboardSize ? cellText(c.leaderboardSize) : cellEmpty(),
    },
  ],
  complianceRG: [
    {
      key: "kyc",
      label: "KYC",
      width: 160,
      render: (c) => {
        const level = KYC_LEVEL[c.kyc];
        return level ? levelBars(c.kyc, ...level) : cellEmpty();
      },
    },
    {
      key: "responsibleGambling",
      label: "Responsible Gambling",
      width: 180,
      render: (c) => {
        const level = RG_LEVEL[c.responsibleGambling] ?? [
          1,
          "var(--nd-muted)",
        ];
        return levelBars(c.responsibleGambling, ...level);
      },
    },
  ],
  games: [
    ...MAJOR_HOUSE_GAMES.map(
      (game): ColumnDef => ({
        key: `game_${game.id}`,
        label: game.name,
        width: 110,
        render: (c) => {
          const row = c.houseGames?.find((g) => g.gameId === game.id);
          return row?.rtp != null ? cellText(`${row.rtp}%`) : cellEmpty();
        },
      }),
    ),
    ...MAJOR_GAME_PROVIDERS.flatMap((provider) =>
      provider.games.map(
        (game): ColumnDef => ({
          key: `slotgame_${provider.id}__${game.name}`,
          label: game.name,
          width: 240,
          render: (c) => {
            if (!c.providers.includes(provider.id)) return cellEmpty();
            const live = c.slotGameData?.[provider.id]?.[game.name];
            const rtp =
              live?.rtp ??
              (game.rtp ? parseFloat(game.rtp) : null);
            const maxBet = live?.maxBet ?? game.maxBet;
            return cellText(
              `${rtp != null ? `${rtp}%` : "—"} / ${formatMaxBet(maxBet)}`,
            );
          },
        }),
      ),
    ),
  ],
};

const CATEGORY_IDS = TABLE_CATEGORIES.map((c) => c.id);
const ALL_COLUMNS = CATEGORY_IDS.flatMap((id) => COLUMN_GROUPS[id]);
const TOTAL_DATA_WIDTH = ALL_COLUMNS.reduce((sum, col) => sum + col.width, 0);
const CATEGORY_OFFSETS = (() => {
  const offsets: Record<TableCategoryId, number> = {
    basicInfo: 0,
    gamesInfo: 0,
    bonusing: 0,
    complianceRG: 0,
    games: 0,
  };
  let acc = 0;
  for (const id of CATEGORY_IDS) {
    offsets[id] = acc;
    acc += COLUMN_GROUPS[id].reduce((s, c) => s + c.width, 0);
  }
  return offsets;
})();

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown size={12} className="opacity-40" />;
  }
  return direction === "asc" ? (
    <ArrowUp size={12} />
  ) : (
    <ArrowDown size={12} />
  );
}

/** Reference `eo` — wide comparison table with sticky casino column. */
export function CasinosCompareTable({
  casinos,
  loading,
  sortKey,
  sortDirection,
  onSort,
  tableTab,
  onTableTabChange,
}: {
  casinos: OverviewCasino[];
  loading: boolean;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  tableTab: TableCategoryId;
  onTableTabChange: (tab: TableCategoryId) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const skipScrollSync = useRef(false);
  const programmaticScroll = useRef(false);
  const isMobile = useIsMobile();
  const stickyBg = "var(--nd-sticky-bg, #f7f7f8)";
  const rowBgs = [
    "var(--nd-row-bg-0, transparent)",
    "var(--nd-row-bg-1, rgba(42,39,78,0.02))",
  ];
  const muted = "text-[rgba(42,39,78,0.4)] dark:text-white/40";
  const border = "border-[rgba(42,39,78,0.08)] dark:border-white/[0.06]";
  const skeleton = "bg-[rgba(42,39,78,0.08)] dark:bg-white/10";
  const nameWidth = isMobile ? 56 : 200;
  const stickyWidth = 48 + nameWidth;
  const minWidth = stickyWidth + TOTAL_DATA_WIDTH;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (skipScrollSync.current) {
      skipScrollSync.current = false;
      return;
    }
    const target = CATEGORY_OFFSETS[tableTab];
    if (Math.abs(el.scrollLeft - target) < 4) return;
    programmaticScroll.current = true;
    el.scrollTo({ left: target, behavior: "smooth" });
  }, [tableTab]);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const left = el.scrollLeft;
    if (programmaticScroll.current) {
      if (Math.abs(left - CATEGORY_OFFSETS[tableTab]) < 4) {
        programmaticScroll.current = false;
      }
      return;
    }
    const probe = left + (el.clientWidth - stickyWidth) / 3;
    let next: TableCategoryId = CATEGORY_IDS[0];
    for (const id of CATEGORY_IDS) {
      if (probe >= CATEGORY_OFFSETS[id]) next = id;
    }
    if (next !== tableTab) {
      skipScrollSync.current = true;
      onTableTabChange(next);
    }
  }, [tableTab, onTableTabChange, stickyWidth]);

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="scrollbar-hide overflow-x-auto"
    >
      <Watermark
        opacity={0.05}
        logoWidth={300}
        repeat={Math.max(1, Math.ceil(casinos.length / 12))}
      >
        <table
          className="w-full table-fixed border-separate border-spacing-0 text-left"
          style={{ minWidth }}
        >
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: nameWidth }} />
            {ALL_COLUMNS.map((col, i) => (
              <col key={i} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead>
            <tr className="h-10">
              <th
                className={`sticky left-0 z-20 px-4 text-[12px] font-medium uppercase ${muted}`}
                style={{ width: 48, backgroundColor: stickyBg }}
              >
                #
              </th>
              <th
                className={`sticky z-20 px-2 text-[12px] font-medium uppercase ${muted}`}
                style={{
                  left: 48,
                  width: nameWidth,
                  backgroundColor: stickyBg,
                }}
              >
                <span className="hidden md:inline">Casino</span>
              </th>
              {ALL_COLUMNS.map((col, i) => (
                <th
                  key={i}
                  style={{ width: col.width }}
                  className={`px-3 text-[12px] font-medium uppercase ${muted}`}
                >
                  {col.key ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="flex items-center gap-1.5 uppercase hover:text-[rgba(42,39,78,0.7)] dark:hover:text-white/70"
                    >
                      {col.label}
                      <SortIcon
                        active={sortKey === col.key}
                        direction={sortDirection}
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
            {loading
              ? Array.from({ length: 10 }, (_, row) => (
                  <tr key={row} className="h-[60px] animate-pulse">
                    <td
                      className="sticky left-0 z-10 px-4"
                      style={{ backgroundColor: stickyBg }}
                    >
                      <div className={`h-3 w-4 rounded ${skeleton}`} />
                    </td>
                    <td
                      className="sticky px-2"
                      style={{ left: 48, backgroundColor: stickyBg }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`size-8 rounded-lg ${skeleton}`} />
                        <div className={`h-3 w-20 rounded ${skeleton}`} />
                      </div>
                    </td>
                    {ALL_COLUMNS.map((_, i) => (
                      <td key={i} className="px-3">
                        <div className={`h-3 w-16 rounded ${skeleton}`} />
                      </td>
                    ))}
                  </tr>
                ))
              : casinos.map((casino, index) => {
                  const bg = rowBgs[index % 2];
                  return (
                    <tr
                      key={casino.id}
                      className="group h-[60px]"
                      style={{ backgroundColor: bg }}
                    >
                      <td
                        className={`sticky left-0 z-10 border-b px-4 text-[14px] font-medium ${border} text-[rgba(42,39,78,0.4)] group-hover:text-[rgba(42,39,78,0.7)] dark:text-white/40 dark:group-hover:text-white/70`}
                        style={{ backgroundColor: bg }}
                      >
                        {casino.rank}
                      </td>
                      <td
                        className={`sticky z-10 border-b px-2 ${border}`}
                        style={{ left: 48, backgroundColor: bg }}
                      >
                        <Link
                          href={`/${casino.slug}`}
                          prefetch={false}
                          className="flex items-center gap-2.5 hover:opacity-80"
                        >
                          <span className="size-8 shrink-0">
                            <AnalyticsCasinoIcon
                              casinoName={casino.name}
                              size={32}
                              theme="auto"
                              logoUrl={casino.logoUrl}
                            />
                          </span>
                          <span className="hidden truncate text-[14px] font-medium text-[#2a274e] md:inline dark:text-white">
                            {casino.name}
                          </span>
                        </Link>
                      </td>
                      {ALL_COLUMNS.map((col, i) => (
                        <td
                          key={i}
                          className={`border-b px-3 ${border} group-hover:bg-[rgba(42,39,78,0.03)] dark:group-hover:bg-white/[0.02]`}
                        >
                          {col.render(casino)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </Watermark>
    </div>
  );
}
