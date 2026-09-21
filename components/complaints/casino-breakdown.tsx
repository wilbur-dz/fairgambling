"use client";

import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Gift,
  IdCard,
  LayoutGrid,
  MessageSquare,
  Search,
  Share2,
  ShieldAlert,
  UserRound,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ComplaintSortIcon } from "@/components/complaints/sort-icon";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClickNav } from "@/components/ui/click-nav";
import {
  getCasinoBreakdown,
  getCategoryBreakdown,
} from "@/lib/complaints/api";
import { complaintCategoryLabel } from "@/lib/complaints/display";

/** Reference category labels (`y`, module 583297). */
const CATEGORY_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  bonus: "Bonus",
  responsible_gambling: "Responsible Gambling",
  kyc: "KYC",
  account_restricted: "Account Restricted",
  provably_fair: "Provably Fair",
  affiliate: "Affiliate",
  sports: "Sports",
  other: "Other",
};

/** Reference category row icons (`N`). */
const CATEGORY_BREAKDOWN_ICONS: Record<string, LucideIcon> = {
  deposit: MessageSquare,
  withdrawal: CircleDollarSign,
  bonus: Gift,
  responsible_gambling: ShieldAlert,
  kyc: IdCard,
  account_restricted: UserRound,
  provably_fair: BadgeCheck,
  affiliate: Share2,
  sports: Volleyball,
  other: LayoutGrid,
};

type BreakdownSortKey =
  | "total"
  | "open"
  | "resolved"
  | "unresolved"
  | "rejected";

type BreakdownTableRow = {
  key: string;
  name: string;
  total: number;
  open: number;
  resolved: number;
  unresolved: number;
  rejected: number | null;
  lead: ReactNode;
  viewHref?: string;
};

/** Port of reference `k` (583297). */
function BreakdownTable({
  title,
  rows,
  searchable = false,
  widthClass = "",
}: {
  title: string;
  rows: BreakdownTableRow[];
  searchable?: boolean;
  widthClass?: string;
}) {
  const ink = "text-[#2a274e] dark:text-white";
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<BreakdownSortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter((row) => row.name.toLowerCase().includes(q))
      : rows;

    const metric = (row: BreakdownTableRow) => row[sortKey] ?? 0;

    return [...base].sort((a, b) => {
      const diff = Number(metric(a)) - Number(metric(b));
      const ordered = sortDir === "desc" ? -diff : diff;
      if (ordered !== 0) return ordered;
      return a.name.localeCompare(b.name);
    });
  }, [query, rows, sortDir, sortKey]);

  const hasQuery = query.trim().length > 0;
  const visible =
    !searchable || expanded || hasQuery ? filtered : filtered.slice(0, 10);
  const showView = rows.some((row) => row.viewHref);

  function sortHeader(label: string, key: BreakdownSortKey, className = "") {
    return (
      <th key={key} className={`px-2 py-3.5 lg:px-4 ${className}`}>
        <button
          type="button"
          onClick={() => {
            if (key === sortKey) {
              setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
            } else {
              setSortKey(key);
              setSortDir("desc");
            }
          }}
          className={`inline-flex items-center gap-1.5 transition-colors ${
            sortKey === key
              ? ink
              : "text-[rgba(42,39,78,0.4)] hover:text-[rgba(42,39,78,0.7)] dark:text-white/40 dark:hover:text-white/70"
          }`}
        >
          {label}
          <ComplaintSortIcon
            active={sortKey === key}
            direction={sortDir}
            theme="auto"
          />
        </button>
      </th>
    );
  }

  return (
    <Card
      variant="panel"
      blur
      contentClassName="flex flex-col gap-4 md:gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-[18px] font-medium ${ink}`}>{title}</h2>
        {searchable ? (
          <div className="relative flex h-9 w-full items-center gap-2 rounded-full border border-[#e4e4e7] bg-[#e4e4e7]/30 px-3.5 text-[rgba(42,39,78,0.5)] nd-ring-dark-only dark:border-0 dark:bg-transparent dark:text-white/50 md:w-[320px]">
            <Search size={16} className="shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-transparent text-[14px] text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.5)] dark:text-white dark:placeholder:text-white/50"
            />
          </div>
        ) : null}
      </div>

      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
        <table
          className={`border-separate border-spacing-0 text-left ${widthClass}`}
        >
          <thead>
            <tr className="text-[12px] uppercase [&>th]:whitespace-nowrap [&>th]:border-b [&>th]:font-normal [&>th]:border-[rgba(42,39,78,0.1)] dark:[&>th]:border-white/[0.08]">
              <th className="px-2 py-3.5 text-[rgba(42,39,78,0.4)] lg:px-4 dark:text-white/40">
                {title}
              </th>
              {sortHeader("Total", "total")}
              {sortHeader("Open", "open")}
              {sortHeader("Resolved", "resolved")}
              {sortHeader("Unresolved", "unresolved")}
              {sortHeader("Rejected", "rejected", "hidden lg:table-cell")}
              {showView ? <th className="hidden lg:table-cell" /> : null}
            </tr>
          </thead>
          <tbody className="[&>tr>td]:border-b [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>td]:lg:px-4 [&>tr>td]:border-[rgba(42,39,78,0.06)] [&>tr:hover>td]:bg-[rgba(42,39,78,0.02)] dark:[&>tr>td]:border-white/[0.06] dark:[&>tr:hover>td]:bg-white/[0.02]">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={showView ? 7 : 6}
                  className="px-4 py-10 text-center text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40"
                >
                  No data.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.key}>
                  <td>{row.lead}</td>
                  <td className={`text-[14px] font-medium tabular-nums ${ink}`}>
                    {row.total.toLocaleString()}
                  </td>
                  <td className={`text-[14px] font-medium tabular-nums ${ink}`}>
                    {row.open.toLocaleString()}
                  </td>
                  <td className={`text-[14px] font-medium tabular-nums ${ink}`}>
                    {row.resolved.toLocaleString()}
                  </td>
                  <td className={`text-[14px] font-medium tabular-nums ${ink}`}>
                    {row.unresolved.toLocaleString()}
                  </td>
                  <td className="hidden text-[14px] font-medium tabular-nums text-[rgba(42,39,78,0.4)] lg:table-cell dark:text-white/40">
                    {row.rejected == null
                      ? "—"
                      : row.rejected.toLocaleString()}
                  </td>
                  {showView ? (
                    <td className="hidden text-right lg:table-cell">
                      {row.viewHref ? (
                        <ClickNav
                          href={row.viewHref}
                          className="text-[14px] font-medium text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
                        >
                          View
                        </ClickNav>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {searchable && !hasQuery && filtered.length > 10 ? (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            theme="auto"
            size="sm"
            rightIcon={expanded ? <ChevronUp /> : <ChevronDown />}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : `Show all (${filtered.length})`}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

/** Port of reference `CasinoBreakdown`. */
export function CasinoBreakdown() {
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof getCasinoBreakdown>>["rows"]
  >([]);

  useEffect(() => {
    let cancelled = false;
    getCasinoBreakdown()
      .then((data) => {
        if (!cancelled) setRows(data.rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const tableRows = useMemo(
    () =>
      rows
        .filter((row) => row.slug !== "500-casino" && row.total > 0)
        .map((row) => ({
          key: String(row.casinoId),
          name: row.name,
          total: row.total,
          open: row.open,
          resolved: row.resolved,
          unresolved: row.unresolved,
          rejected: row.rejected,
          viewHref: `/${row.slug}/complaints`,
          lead: (
            <ClickNav
              href={`/${row.slug}/complaints`}
              className="flex items-center gap-2 hover:opacity-80 lg:gap-2.5"
            >
              <AnalyticsCasinoIcon
                casinoName={row.name}
                logoUrl={row.logoUrl ?? undefined}
                size={26}
                theme="auto"
              />
              <span className="truncate text-[14px] font-medium text-[#2a274e] dark:text-white">
                {row.name}
              </span>
            </ClickNav>
          ),
        })),
    [rows],
  );

  return (
    <BreakdownTable
      title="Casino"
      rows={tableRows}
      searchable
      widthClass="lg:w-full lg:min-w-[840px]"
    />
  );
}

type CategoryBreakdownProps = {
  casinoId?: number;
};

/** Port of reference `CategoryBreakdown`. */
export function CategoryBreakdown({ casinoId }: CategoryBreakdownProps) {
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof getCategoryBreakdown>>["rows"]
  >([]);

  useEffect(() => {
    let cancelled = false;
    getCategoryBreakdown(casinoId)
      .then((data) => {
        if (!cancelled) setRows(data.rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [casinoId]);

  const tableRows = useMemo(
    () =>
      rows.map((row) => {
        const label =
          CATEGORY_LABELS[row.category] ??
          complaintCategoryLabel(row.category);
        const Icon =
          CATEGORY_BREAKDOWN_ICONS[row.category] ?? LayoutGrid;
        return {
          key: row.category,
          name: label,
          total: row.total,
          open: row.open,
          resolved: row.resolved,
          unresolved: row.unresolved,
          rejected: row.rejected ?? null,
          lead: (
            <div className="flex items-center gap-2.5">
              <Icon
                size={18}
                className="shrink-0 text-[#6b56e0] dark:text-[#8E8EFF]"
              />
              <span className="whitespace-nowrap text-[14px] font-medium text-[#2a274e] dark:text-white">
                {label}
              </span>
            </div>
          ),
        };
      }),
    [rows],
  );

  return (
    <BreakdownTable
      title="Category"
      rows={tableRows}
      widthClass="lg:w-full lg:min-w-[760px]"
    />
  );
}
