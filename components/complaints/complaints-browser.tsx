"use client";

import Link from "next/link";
import {
  Ban,
  FileXCorner,
  Handshake,
  Hourglass,
  LayoutGrid,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import {
  complaintAllCasinosIcon,
  complaintCategoryIcon,
} from "@/components/complaints/complaint-filter-icons";
import { ComplaintSortIcon } from "@/components/complaints/sort-icon";
import { TimeLeftRing } from "@/components/complaints/time-left-ring";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Tabs } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { clientGetMarketBreakdown } from "@/lib/casinos/client-api";
import {
  getCasinoBreakdownClient,
  getMyComplaintsClient,
  listPublicComplaintsClient,
  withdrawComplaintClient,
} from "@/lib/complaints/api";
import { COMPLAINTS_BROWSER_PAGE_SIZE, sortCasinosForComplaintFilters } from "@/lib/complaints/browser-helpers";
import { activeDeadline, timeLeft } from "@/lib/complaints/deadlines";
import {
  COMPLAINT_CATEGORY_OPTIONS,
  complaintCategoryLabel,
  formatComplaintAmount,
  formatComplaintOpenedDate,
  formatComplaintPublicId,
  formatComplaintRelative,
  isAllFilterValue,
  stripHtmlTags,
} from "@/lib/complaints/display";
import { ND_COLORS } from "@/lib/complaints/resolution-workflow";
import type {
  CasinoComplaintBreakdownRow,
  ComplaintBucketCounts,
  PublicComplaint,
} from "@/lib/complaints/types";

const BUCKET_TABS = [
  {
    id: "",
    label: "All",
    icon: LayoutGrid,
    color: "#8874ff",
    count: (c: ComplaintBucketCounts) => c.all,
  },
  {
    id: "active",
    label: "Open",
    icon: Hourglass,
    color: "#A48DFF",
    count: (c: ComplaintBucketCounts) => c.active,
  },
  {
    id: "unresolved",
    label: "Unresolved",
    icon: FileXCorner,
    color: "#F87171",
    count: (c: ComplaintBucketCounts) => c.unresolved,
  },
  {
    id: "resolved",
    label: "Resolved",
    icon: Handshake,
    color: "#4ADE80",
    count: (c: ComplaintBucketCounts) => c.resolved,
  },
  {
    id: "dismissed",
    label: "Rejected",
    icon: Ban,
    color: "#9CA3AF",
    count: (c: ComplaintBucketCounts) => c.dismissed,
  },
] as const;

const WITHDRAW_REASONS = [
  { value: "paid_outside", label: "Already paid / settled outside" },
  { value: "no_longer_relevant", label: "No longer relevant" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "wrong_casino", label: "Wrong casino" },
  { value: "other", label: "Other (add a note)" },
] as const;

const CLOSED_STATUSES = new Set(["resolved", "unresolved", "rejected"]);
const OPEN_STATUSES = new Set([
  "pending_approval",
  "awaiting_clarification",
  "awaiting_casino",
  "in_mediation",
  "awaiting_settlement_confirmation",
]);

function StatusBucketTabs({
  value,
  counts,
  onChange,
}: {
  value: string;
  counts: ComplaintBucketCounts | null;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Complaint status"
      className="grid grid-cols-5 gap-1.5 md:gap-3"
    >
      {BUCKET_TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        const n = counts ? tab.count(counts) : null;
        return (
          <button
            key={tab.id || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative flex min-w-0 flex-col items-center gap-1.5 rounded-[16px] px-1 py-2.5 text-left transition-colors md:flex-row md:gap-3 md:rounded-[20px] md:px-4 md:py-3.5 ${
              active
                ? "nd-gradient-border-auto bg-[rgba(136,116,255,0.12)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
                : "nd-ring-dark-only border border-[rgba(42,39,78,0.08)] bg-white/[0.5] hover:bg-white/80 dark:border-0 dark:bg-white/[0.01] dark:hover:bg-white/[0.04]"
            }`}
          >
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full md:size-10"
              style={
                active
                  ? {
                      background: `linear-gradient(180deg, ${ND_COLORS.accent}, ${ND_COLORS.accentDeep})`,
                      color: "#fff",
                      boxShadow: "0 0 18px rgba(153,51,229,0.35)",
                    }
                  : {
                      backgroundColor: `${tab.color}1f`,
                      color: tab.color,
                    }
              }
            >
              <Icon strokeWidth={1.9} className="size-3.5 md:size-[18px]" />
            </span>
            <span className="flex min-w-0 max-w-full flex-col items-center md:items-start">
              <span
                className={`text-[15px] font-semibold leading-none tabular-nums md:text-[22px] ${
                  active
                    ? "text-[#2a274e] dark:text-white"
                    : "text-[#2a274e]/85 dark:text-white/85"
                }`}
              >
                {n == null ? "–" : n.toLocaleString("en-US")}
              </span>
              <span
                className={`mt-1 max-w-full truncate text-[10px] sm:text-[11px] md:text-[13px] ${
                  active
                    ? "text-[#2a274e]/80 dark:text-white/80"
                    : "text-[#2a274e]/55 dark:text-white/50"
                }`}
              >
                {tab.label}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function WithdrawPanel({
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (reason: string, note?: string) => void;
}) {
  const [reason, setReason] = useState<string>("changed_mind");
  const [note, setNote] = useState("");
  const needsNote = reason === "other";
  const canSubmit = !busy && (!needsNote || note.trim().length > 0);

  return (
    <div className="my-3 flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
      <p className="text-xs font-medium text-white/70">Why withdraw?</p>
      <select
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 text-sm text-white outline-none"
      >
        {WITHDRAW_REASONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#0f1424]"
          >
            {option.label}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={2}
        placeholder={
          needsNote ? 'Required for "Other"' : "Optional note for the resolver"
        }
        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.02] px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/40"
      />
      {error ? <p className="text-xs text-[#FB3748]">{error}</p> : null}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-white/60 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(reason, note.trim() || undefined)}
          className="rounded-lg bg-[#FB3748] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#FB3748]/85 disabled:opacity-50"
        >
          {busy ? "Withdrawing…" : "Withdraw"}
        </button>
      </div>
    </div>
  );
}

function MyComplaintsPanel() {
  const { isAuthenticated, accessToken, isLoading } = useAuth();
  const [rows, setRows] = useState<PublicComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<"newest" | "oldest" | "amount">(
    "newest",
  );
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await getMyComplaintsClient(
      { page: 1, limit: 20, includeDrafts: true },
      accessToken,
    );
    setRows(data.rows);
  }, [accessToken]);

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, accessToken, reload]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (statusFilter === "open") {
      list = list.filter((row) => OPEN_STATUSES.has(row.status ?? ""));
    } else if (statusFilter === "closed") {
      list = list.filter((row) => CLOSED_STATUSES.has(row.status ?? ""));
    } else if (statusFilter === "draft") {
      list = list.filter((row) => row.status === "draft");
    }
    list.sort((a, b) => {
      if (sortKey === "amount") {
        const av = a.disputedAmount ? Number(a.disputedAmount) : 0;
        const bv = b.disputedAmount ? Number(b.disputedAmount) : 0;
        return bv - av;
      }
      const at = new Date(a.submittedAt ?? a.updatedAt ?? 0).getTime();
      const bt = new Date(b.submittedAt ?? b.updatedAt ?? 0).getTime();
      return sortKey === "oldest" ? at - bt : bt - at;
    });
    return list;
  }, [rows, sortKey, statusFilter]);

  const onWithdraw = async (
    id: string,
    reason: string,
    note?: string,
  ) => {
    if (!accessToken) return;
    setWithdrawBusy(true);
    setWithdrawError(null);
    try {
      await withdrawComplaintClient(id, { reason, note }, accessToken);
      await reload();
      setWithdrawTarget(null);
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setWithdrawBusy(false);
    }
  };

  if (isLoading || loading) {
    return <p className="text-sm text-white/50">Loading…</p>;
  }
  if (error) {
    return <p className="text-sm text-[#FB3748]">{error}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-white/50">
        Nothing here yet.{" "}
        <Link
          href="/complaints/new"
          className="font-medium text-[#8E8EFF] hover:underline"
        >
          Submit a Complaint
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          options={[
            { value: "", label: "All complaints" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "draft", label: "Drafts" },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          placeholder="All complaints"
          panelWidth={180}
        />
        <Dropdown
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "amount", label: "Largest amount" },
          ]}
          value={sortKey}
          onChange={(value) =>
            setSortKey(value as "newest" | "oldest" | "amount")
          }
          placeholder="Sort"
          panelWidth={180}
        />
        <span className="ml-auto text-xs text-white/50">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-[#8874ff]/30 bg-[#8874ff]/10 px-3 py-2 text-xs text-white/70">
          You&apos;re not signed in. These drafts live in this browser for 30
          days. Sign in from the wizard to submit one to the resolver queue.
        </div>
      ) : null}

      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left lg:min-w-[1000px]">
          <thead>
            <tr className="text-[12px] uppercase text-white/40 [&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-white/[0.08] [&>th]:px-2 [&>th]:py-3.5 [&>th]:font-normal [&>th]:lg:px-4">
              <th>ID</th>
              <th>
                <span className="hidden lg:inline">Casino</span>
              </th>
              <th>Category / Title</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Opened</th>
              <th>Last Activity</th>
              <th />
            </tr>
          </thead>
          <tbody className="[&>tr>td]:border-b [&>tr>td]:border-white/[0.06] [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr:hover>td]:bg-white/[0.02] [&>tr>td]:lg:px-4">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-[14px] text-white/40"
                >
                  Nothing matches this filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const isDraft = row.status === "draft";
                const isClosed = CLOSED_STATUSES.has(row.status ?? "");
                const canWithdraw =
                  !isDraft &&
                  !isClosed &&
                  row.status !== "withdrawn" &&
                  row.status !== "reopened";
                const href = isDraft
                  ? `/complaints/new?draft=${row.id}`
                  : `/complaints/${row.id}`;
                const withdrawing = withdrawTarget === row.id;

                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td className="whitespace-nowrap text-[14px] font-medium text-white/60">
                        <Link href={href} className="hover:underline">
                          {formatComplaintPublicId(row.id)}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={row.casinoSlug ? `/${row.casinoSlug}` : href}
                          className="flex items-center justify-center gap-0 hover:opacity-80 lg:justify-start lg:gap-2.5"
                        >
                          <AnalyticsCasinoIcon
                            casinoName={row.casinoName ?? "—"}
                            size={26}
                          />
                          <span className="hidden whitespace-nowrap text-[14px] font-medium text-white hover:underline lg:inline">
                            {row.casinoName ?? "—"}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className="block max-w-[240px] min-w-0">
                          <div className="truncate text-[14px] font-medium text-white">
                            {complaintCategoryLabel(row.category)}
                          </div>
                          <div className="truncate text-[12px] text-white/50">
                            {stripHtmlTags(row.title ?? "")}
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-[14px] font-medium text-white">
                        {row.disputedAmount
                          ? `${formatComplaintAmount(row.disputedAmount)} ${row.disputedCurrency ?? ""}`.trim()
                          : "—"}
                      </td>
                      <td>
                        <ComplaintStatusBadge status={row.status} />
                      </td>
                      <td className="whitespace-nowrap text-[14px] text-white">
                        {formatComplaintOpenedDate(row.submittedAt)}
                      </td>
                      <td className="whitespace-nowrap text-[14px] text-white/70">
                        {formatComplaintRelative(row.updatedAt)}
                      </td>
                      <td className="whitespace-nowrap text-right">
                        {isDraft ? (
                          <Link
                            href={href}
                            className="text-[14px] font-medium text-[#8E8EFF] hover:underline"
                          >
                            Resume
                          </Link>
                        ) : canWithdraw ? (
                          <button
                            type="button"
                            onClick={() => {
                              setWithdrawError(null);
                              setWithdrawTarget(withdrawing ? null : row.id);
                            }}
                            className="text-[14px] font-medium text-[#8E8EFF] hover:underline"
                          >
                            Withdraw
                          </button>
                        ) : (
                          <Link
                            href={`/complaints/${row.id}`}
                            className="text-[14px] font-medium text-[#8E8EFF] hover:underline"
                          >
                            Details
                          </Link>
                        )}
                      </td>
                    </tr>
                    {withdrawing ? (
                      <tr>
                        <td colSpan={8} className="!py-0">
                          <WithdrawPanel
                            busy={withdrawBusy}
                            error={withdrawError}
                            onCancel={() => setWithdrawTarget(null)}
                            onSubmit={(reason, note) =>
                              onWithdraw(row.id, reason, note)
                            }
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Port of reference `ComplaintsBrowser` (170990). */
export function ComplaintsBrowser() {
  const ink = "text-[#2a274e] dark:text-white";
  const isMobile = useIsMobile();

  const [section, setSection] = useState<"all" | "mine">("all");
  const [casinos, setCasinos] = useState<CasinoComplaintBreakdownRow[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [bucket, setBucket] = useState("");
  const [category, setCategory] = useState("");
  const [casinoId, setCasinoId] = useState("");
  const [counts, setCounts] = useState<ComplaintBucketCounts | null>(null);
  const [sortBy, setSortBy] = useState<
    "activity" | "opened" | "amount"
  >("activity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [rows, setRows] = useState<PublicComplaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNowMs(Date.now()));
    return () => cancelAnimationFrame(id);
  }, [rows]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCasinoBreakdownClient(),
      clientGetMarketBreakdown("30D").catch(() => []),
    ])
      .then(([breakdown, market]) => {
        if (cancelled) return;
        setCasinos(sortCasinosForComplaintFilters(breakdown.rows, market));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    listPublicComplaintsClient({
      page,
      limit: COMPLAINTS_BROWSER_PAGE_SIZE,
      bucket: bucket || undefined,
      casinoId: casinoId ? Number(casinoId) : undefined,
      category: category || undefined,
      search: search || undefined,
      sortBy,
      sortDir,
    })
      .then((data) => {
        console.log('11111', data)
        if (cancelled) return;
        setRows(data.rows);
        setTotal(data.total);
        if (data.counts) setCounts(data.counts);
      })
      .catch((error) => {
        console.log('error', error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, bucket, casinoId, category, search, sortBy, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / COMPLAINTS_BROWSER_PAGE_SIZE),
  );
  const casinoOptions = useMemo(
    () => [
      { value: "", label: "All Casinos" },
      ...casinos.map((row) => ({
        value: String(row.casinoId),
        label: row.name,
      })),
    ],
    [casinos],
  );
  const casinoById = useMemo(
    () => new Map(casinos.map((row) => [String(row.casinoId), row])),
    [casinos],
  );

  function toggleSort(next: typeof sortBy) {
    if (next === sortBy) {
      setSortDir((dir) => (dir === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(next);
      setSortDir("desc");
    }
    setPage(1);
  }

  function sortHeader(label: string, key: typeof sortBy) {
    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className={`inline-flex items-center gap-1.5 uppercase transition-colors ${
          sortBy === key
            ? ink
            : "text-[rgba(42,39,78,0.4)] hover:text-[rgba(42,39,78,0.7)] dark:text-white/40 dark:hover:text-white/70"
        }`}
      >
        {label}
        <ComplaintSortIcon
          active={sortBy === key}
          direction={sortDir}
          theme="auto"
        />
      </button>
    );
  }

  const filterControls = (block: boolean) => (
    <>
      <Dropdown
        block={block}
        theme="auto"
        options={COMPLAINT_CATEGORY_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
        value={category || ""}
        onChange={(value) => {
          setCategory(isAllFilterValue(value) ? "" : value);
          setPage(1);
        }}
        placeholder="All Categories"
        panelWidth={190}
        renderIcon={(value, size) => complaintCategoryIcon(value, size)}
      />
      <Dropdown
        block={block}
        theme="auto"
        options={casinoOptions}
        value={casinoId || ""}
        onChange={(value) => {
          setCasinoId(isAllFilterValue(value) ? "" : value);
          setPage(1);
        }}
        placeholder="All Casinos"
        searchable
        panelWidth={200}
        renderIcon={(value, size) =>
          isAllFilterValue(value) ? (
            complaintAllCasinosIcon(size)
          ) : (
            <AnalyticsCasinoIcon
              casinoName={casinoById.get(value)?.name ?? ""}
              logoUrl={casinoById.get(value)?.logoUrl ?? undefined}
              size={size}
              theme="auto"
            />
          )
        }
      />
    </>
  );

  return (
    <Card
      variant="panel"
      blur
      contentClassName="flex flex-col gap-4 md:gap-6"
    >
      <div className="flex items-center gap-3">
        <Tabs
          size="sm"
          theme="auto"
          tabs={[
            { id: "all", label: "All Complaints" },
            { id: "mine", label: "My Complaints" },
          ]}
          activeId={section}
          onChange={(id) => setSection(id as "all" | "mine")}
          fill
          className="w-full md:w-auto"
        />
        {section === "all" ? (
          <div className="shrink-0 md:hidden">
            <button
              type="button"
              aria-label="Filters"
              onClick={() => setFiltersOpen(true)}
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full nd-gradient-border-light text-[rgba(42,39,78,0.7)] transition-colors nd-ring-dark-only hover:text-[#2a274e] dark:text-white/70 dark:hover:text-white"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        ) : null}
      </div>

      {section === "mine" ? (
        <MyComplaintsPanel />
      ) : (
        <>
          <StatusBucketTabs
            value={bucket}
            counts={counts}
            onChange={(id) => {
              setBucket(id);
              setPage(1);
            }}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e4e4e7] bg-[#e4e4e7]/30 px-3.5 nd-ring-dark-only dark:border-0 dark:bg-transparent dark:text-white/50 md:w-[320px] md:flex-none">
              <Search size={16} className="shrink-0" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by ID, casino, or title..."
                className="w-full bg-transparent text-[14px] text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.5)] dark:text-white dark:placeholder:text-white/50"
              />
            </div>
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              {filterControls(false)}
            </div>
          </div>

          <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left lg:min-w-[1040px]">
              <thead>
                <tr className="text-[12px] uppercase text-[rgba(42,39,78,0.4)] [&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-[rgba(42,39,78,0.1)] [&>th]:px-2 [&>th]:py-3.5 [&>th]:font-normal [&>th]:lg:px-4 dark:text-white/40 dark:[&>th]:border-white/[0.08]">
                  <th className="w-[96px] lg:w-[9%]">ID</th>
                  <th className="w-[44px] lg:w-[13%]">
                    <span className="hidden lg:inline">Casino</span>
                  </th>
                  <th>
                    <span className="lg:hidden">Case</span>
                    <span className="hidden lg:inline">Category / Title</span>
                  </th>
                  <th className="w-[104px] lg:w-[10%]">
                    {sortHeader("Amount", "amount")}
                  </th>
                  <th className="hidden lg:table-cell lg:w-[13%]">Status</th>
                  <th className="hidden lg:table-cell lg:w-[10%]">
                    {sortHeader("Opened", "opened")}
                  </th>
                  <th className="hidden lg:table-cell lg:w-[12%]">
                    {sortHeader("Last Activity", "activity")}
                  </th>
                  <th className="hidden lg:table-cell lg:w-[13%]">
                    Time Left
                  </th>
                  <th className="hidden lg:table-cell lg:w-[7%]" />
                </tr>
              </thead>
              <tbody className="[&>tr>td]:border-b [&>tr>td]:border-[rgba(42,39,78,0.06)] [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>td]:lg:px-4 [&>tr:hover>td]:bg-[rgba(42,39,78,0.02)] dark:[&>tr>td]:border-white/[0.06] dark:[&>tr:hover>td]:bg-white/[0.02]">
                {loading && rows.length === 0
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`sk-${index}`}>
                        <td colSpan={9} className="px-4 py-3">
                          <div className="h-6 animate-pulse rounded bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.04]" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-[14px] text-[rgba(42,39,78,0.4)] dark:text-white/40"
                    >
                      No complaints match.
                    </td>
                  </tr>
                ) : null}
                {rows.map((row) => {
                  const deadline = activeDeadline(row.status, row);
                  const left = timeLeft(deadline);
                  const remainingMs =
                    deadline && nowMs
                      ? Math.max(0, new Date(deadline).getTime() - nowMs)
                      : 0;
                  const percentRemaining =
                    deadline && nowMs ? (remainingMs / 604_800_000) * 100 : 0;

                  return (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap text-[14px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60">
                        <Link
                          href={`/complaints/${row.id}`}
                          className="hover:underline"
                        >
                          {formatComplaintPublicId(row.id)}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/${row.casinoSlug ?? ""}/complaints`}
                          className="flex min-w-0 items-center justify-center gap-0 hover:opacity-80 lg:justify-start lg:gap-2.5"
                        >
                          <AnalyticsCasinoIcon
                            casinoName={row.casinoName ?? "—"}
                            logoUrl={row.casinoLogoUrl ?? undefined}
                            size={26}
                            theme="auto"
                          />
                          <span
                            className={`hidden min-w-0 truncate text-[14px] font-medium hover:underline lg:block ${ink}`}
                          >
                            {row.casinoName ?? "—"}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/complaints/${row.id}`}
                          className="block max-w-[132px] min-w-0 lg:max-w-[240px]"
                        >
                          <div className={`truncate text-[14px] font-medium ${ink}`}>
                            {complaintCategoryLabel(row.category)}
                          </div>
                          <div className="truncate text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                            {stripHtmlTags(row.title ?? "")}
                          </div>
                        </Link>
                      </td>
                      <td className={`whitespace-nowrap text-[14px] font-medium ${ink}`}>
                        {row.disputedAmount ? (
                          <span className="text-[13px] lg:text-[14px]">
                            ${formatComplaintAmount(row.disputedAmount)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="hidden lg:table-cell">
                        <ComplaintStatusBadge status={row.status} theme="auto" />
                      </td>
                      <td
                        className={`hidden whitespace-nowrap text-[14px] lg:table-cell ${ink}`}
                      >
                        {formatComplaintOpenedDate(row.submittedAt)}
                      </td>
                      <td className="hidden whitespace-nowrap text-[14px] text-[rgba(42,39,78,0.7)] lg:table-cell dark:text-white/70">
                        {formatComplaintRelative(row.updatedAt)}
                      </td>
                      <td className="hidden whitespace-nowrap text-[14px] text-[rgba(42,39,78,0.7)] lg:table-cell dark:text-white/70">
                        {deadline ? (
                          <span className="inline-flex items-center gap-2">
                            <TimeLeftRing
                              tone={left.tone}
                              percentRemaining={percentRemaining}
                              theme="auto"
                            />
                            {left.label}
                          </span>
                        ) : (
                          <span className="text-[rgba(42,39,78,0.4)] dark:text-white/40">
                            —
                          </span>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap text-right lg:table-cell">
                        <Link
                          href={`/complaints/${row.id}`}
                          className="text-[14px] font-medium text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="pt-2"
            theme="auto"
          />

          {isMobile ? (
            <Modal
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              title="Filters"
            >
              <div className="flex flex-col gap-3">{filterControls(true)}</div>
            </Modal>
          ) : null}
        </>
      )}
    </Card>
  );
}
