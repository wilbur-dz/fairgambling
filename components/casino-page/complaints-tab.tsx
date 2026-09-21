"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClickNav } from "@/components/ui/click-nav";
import { Dropdown } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import {
  buildComplaintStatsFallback,
  getCasinoComplaintStatsClient,
  listPublicComplaintsClient,
} from "@/lib/complaints/api";
import {
  complaintCategoryIcon,
  complaintStatusIcon,
} from "@/components/complaints/complaint-filter-icons";
import {
  COMPLAINT_CATEGORY_OPTIONS,
  COMPLAINT_STATUS_OPTIONS,
  complaintCategoryLabel,
  formatComplaintAmount,
  formatComplaintFundsRecovered,
  formatComplaintOpenedDate,
  formatComplaintPublicId,
  formatComplaintResponseTime,
  isAllFilterValue,
  stripHtmlTags,
} from "@/lib/complaints/display";
import type { CasinoComplaintStats, PublicComplaint } from "@/lib/complaints/types";
import { SHOW_COMPLAINT_STATS } from "@/lib/complaints/flags";
import { casinoRouteSlug } from "@/lib/reviews/format";

const PAGE_SIZE = 7;

type ComplaintsTabProps = {
  slug: string;
  name: string;
  casinoId: string;
  showSummary?: boolean;
  complaintCount?: number;
  openComplaintCount?: number;
};

function SummaryStatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-[#e4e4e7]/30 p-3 backdrop-blur-[20px] dark:border-[0.5px] dark:border-white/10 dark:bg-white/[0.02]">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 size-14 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex flex-col gap-1.5">
        <span className="text-[10px] uppercase tracking-wide text-[rgba(42,39,78,0.5)] dark:text-white/40">
          {label}
        </span>
        <span className="text-[20px] font-semibold leading-none text-[#2a274e] dark:text-white">
          {value}
        </span>
      </div>
    </div>
  );
}

/** Port of reference `ComplaintsTab` (0yecc7za23pyb.js 170–488). */
export function ComplaintsTab({
  slug,
  name,
  casinoId,
  showSummary = false,
  complaintCount = 0,
  openComplaintCount = 0,
}: ComplaintsTabProps) {
  const ink = "text-[#2a274e] dark:text-white";
  const routeSlug = casinoRouteSlug(slug);

  const [rows, setRows] = useState<PublicComplaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stats, setStats] = useState<CasinoComplaintStats | null>(null);

  useEffect(() => {
    if (!showSummary || !slug) return;
    let cancelled = false;

    getCasinoComplaintStatsClient(slug)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setStats(data);
          return;
        }
        setStats(
          buildComplaintStatsFallback({
            complaintCount,
            openComplaintCount,
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setStats(
            buildComplaintStatsFallback({
              complaintCount,
              openComplaintCount,
            }),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showSummary, slug, complaintCount, openComplaintCount]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listPublicComplaintsClient({
      page,
      limit: PAGE_SIZE,
      casinoId,
      bucket: statusFilter || undefined,
      category: categoryFilter || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, casinoId, statusFilter, categoryFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const resolutionRate =
    stats && stats.totalDisputes > 0
      ? Math.round((stats.resolved / stats.totalDisputes) * 1000) / 10
      : null;

  return (
    <div className="flex flex-col gap-4">
      {SHOW_COMPLAINT_STATS && showSummary && stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryStatTile
            label="Total Disputes"
            value={stats.totalDisputes.toLocaleString("en-US")}
            accent="#8874ff"
          />
          <SummaryStatTile
            label="Resolution Rate"
            value={resolutionRate != null ? `${resolutionRate}%` : "—"}
            accent="#ed6be5"
          />
          <SummaryStatTile
            label="Avr Response Time"
            value={formatComplaintResponseTime(stats.avgResponseHours)}
            accent="#f7e045"
          />
          <SummaryStatTile
            label="Open Complaints"
            value={stats.open.toLocaleString("en-US")}
            accent="#ffff0f"
          />
          <SummaryStatTile
            label="Resolved"
            value={stats.resolved.toLocaleString("en-US")}
            accent="#00ff86"
          />
          <SummaryStatTile
            label="Funds Recovered"
            value={formatComplaintFundsRecovered(stats.fundsRecoveredUsd)}
            accent="#c39bff"
          />
        </div>
      ) : null}

      <Card variant="panel" blur contentClassName="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-[18px] font-medium ${ink}`}>Complaint History</h2>
          {showSummary ? (
            <ClickNav href={`/${routeSlug}/complaints`}>
              <Button
                variant="ghost"
                theme="auto"
                size="sm"
                rightIcon={<ArrowUpRight size={18} />}
              >
                View All
              </Button>
            </ClickNav>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            theme="auto"
            options={[...COMPLAINT_STATUS_OPTIONS]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(isAllFilterValue(value) ? "" : value);
              setPage(1);
            }}
            placeholder="All Statuses"
            panelWidth={170}
            renderIcon={(value, size) => complaintStatusIcon(value, size)}
          />
          <Dropdown
            theme="auto"
            options={[...COMPLAINT_CATEGORY_OPTIONS]}
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(isAllFilterValue(value) ? "" : value);
              setPage(1);
            }}
            placeholder="All Categories"
            panelWidth={190}
            renderIcon={(value, size) => complaintCategoryIcon(value, size)}
          />
        </div>

        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-[12px] uppercase text-[#2a274e]/40 dark:text-white/40 [&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-[#2a274e]/10 [&>th]:px-4 [&>th]:py-3.5 [&>th]:font-normal dark:[&>th]:border-white/[0.08]">
                <th className="w-[10%]">ID</th>
                <th className="w-[16%]">Casino</th>
                <th>Category / Title</th>
                <th className="w-[14%]">Amount</th>
                <th className="w-[16%]">Status</th>
                <th className="w-[14%]">Opened</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td]:border-b [&>tr>td]:border-[#2a274e]/[0.06] [&>tr>td]:px-4 [&>tr>td]:py-3 dark:[&>tr>td]:border-white/[0.06] [&>tr:hover>td]:bg-[#2a274e]/[0.02] dark:[&>tr:hover>td]:bg-white/[0.02]">
              {loading && rows.length === 0
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-6 animate-pulse rounded bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.04]" />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40"
                  >
                    No complaints yet for {name}.
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((row) => {
                    const casinoName = row.casinoName ?? name;
                    return (
                      <tr key={row.id} className="transition-colors">
                        <td className="whitespace-nowrap text-[14px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60">
                          <Link
                            href={`/complaints/${row.id}`}
                            className="hover:underline"
                          >
                            {formatComplaintPublicId(row.id)}
                          </Link>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <AnalyticsCasinoIcon
                              casinoName={casinoName}
                              size={26}
                              theme="auto"
                            />
                            <span
                              className={`whitespace-nowrap text-[14px] font-medium ${ink}`}
                            >
                              {casinoName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Link
                            href={`/complaints/${row.id}`}
                            className="block max-w-[240px] min-w-0"
                          >
                            <div
                              className={`truncate text-[14px] font-medium ${ink}`}
                            >
                              {complaintCategoryLabel(row.category)}
                            </div>
                            <div className="truncate text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                              {stripHtmlTags(row.title ?? "")}
                            </div>
                          </Link>
                        </td>
                        <td className={`whitespace-nowrap text-[14px] font-medium ${ink}`}>
                          {row.disputedAmount
                            ? `$${formatComplaintAmount(row.disputedAmount)}`
                            : "—"}
                        </td>
                        <td>
                          <ComplaintStatusBadge
                            status={row.status}
                            theme="auto"
                          />
                        </td>
                        <td className={`whitespace-nowrap text-[14px] ${ink}`}>
                          {formatComplaintOpenedDate(row.submittedAt)}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="pt-2"
        />
      </Card>
    </div>
  );
}
