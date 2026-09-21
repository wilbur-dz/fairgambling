"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CodesTable } from "@/components/livecodes/codes-table";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { LiveBadge } from "@/components/ui/live-badge";
import { fetchExclusiveCodesClient } from "@/lib/livecodes/api";
import {
  HIGH_ROLLER_WAGER_MIN,
  LIVECODES_DISPLAY_LIMIT,
  type CodeCasino,
  type CodesStatsPayload,
  type LiveCode,
} from "@/lib/livecodes/data";
import { buildCasinoFilterOptions } from "@/lib/livecodes/normalize";

type FeedTab = "all" | "exclusive";

type CodesFeedCardProps = {
  codes: LiveCode[];
  casinos: CodeCasino[];
  stats: CodesStatsPayload | null;
  isLoading?: boolean;
  search?: string;
  live?: boolean;
};

/** `null` = all casinos; `Set` = subset; empty Set = none. */
type CasinoFilter = Set<string> | null;

function applyListFilters(
  rows: LiveCode[],
  {
    search,
    casinoFilter,
    highRoller,
  }: {
    search: string;
    casinoFilter: CasinoFilter;
    highRoller: boolean;
  },
): LiveCode[] {
  const q = search.trim().toLowerCase();
  let next = rows;

  if (casinoFilter !== null) {
    if (casinoFilter.size === 0) {
      next = [];
    } else {
      next = next.filter(
        (row) => row.casinoSlug && casinoFilter.has(row.casinoSlug),
      );
    }
  }
  if (q) {
    next = next.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        row.casinoName.toLowerCase().includes(q) ||
        row.casinoSlug.toLowerCase().includes(q),
    );
  }
  if (highRoller) {
    next = next.filter((row) => row.wagerRequirement >= HIGH_ROLLER_WAGER_MIN);
  }

  return next.slice(0, LIVECODES_DISPLAY_LIMIT);
}

function SoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={enabled ? "Disable sound" : "Enable sound"}
      aria-label={enabled ? "Disable sound" : "Enable sound"}
      className="relative flex items-center justify-center rounded-[52px] border-[0.5px] border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.04)] p-[10px] transition-colors hover:bg-[rgba(142,142,255,0.08)] dark:border-white/20"
    >
      <Image
        src="/icons/sound-on.svg"
        alt=""
        width={16}
        height={16}
        className={`size-4 invert dark:invert-0 ${enabled ? "" : "opacity-40"}`}
      />
      {!enabled ? (
        <span
          aria-hidden
          className="pointer-events-none absolute h-[1.5px] w-5 -rotate-45 rounded-full bg-[rgba(42,39,78,0.8)] dark:bg-white/80"
        />
      ) : null}
    </button>
  );
}

/** Glass feed card — tabs, High Roller, multi casino filter, codes table. */
export function CodesFeedCard({
  codes,
  casinos,
  stats,
  isLoading = false,
  search = "",
  live = true,
}: CodesFeedCardProps) {
  const [tab, setTab] = useState<FeedTab>("all");
  const [highRoller, setHighRoller] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [casinoFilter, setCasinoFilter] = useState<CasinoFilter>(null);

  const [exclusiveCodes, setExclusiveCodes] = useState<LiveCode[]>([]);
  const [exclusiveLoading, setExclusiveLoading] = useState(false);
  const [exclusiveError, setExclusiveError] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "exclusive") return;

    let cancelled = false;
    setExclusiveLoading(true);
    setExclusiveError(null);

    void fetchExclusiveCodesClient()
      .then((payload) => {
        if (cancelled) return;
        setExclusiveCodes(payload.codes);
      })
      .catch((err) => {
        if (cancelled) return;
        setExclusiveCodes([]);
        setExclusiveError(
          err instanceof Error
            ? err.message
            : "Could not load exclusive codes.",
        );
      })
      .finally(() => {
        if (!cancelled) setExclusiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const sourceCodes = tab === "exclusive" ? exclusiveCodes : codes;

  const casinoOptions = useMemo(
    () => buildCasinoFilterOptions(casinos, codes, stats),
    [casinos, codes, stats],
  );

  const dropdownOptions = useMemo(
    () => casinoOptions.map((c) => ({ value: c.slug, label: c.name })),
    [casinoOptions],
  );

  const nameBySlug = useMemo(
    () => Object.fromEntries(casinoOptions.map((c) => [c.slug, c.name])),
    [casinoOptions],
  );

  const slugSet = useMemo(
    () => new Set(casinoOptions.map((c) => c.slug)),
    [casinoOptions],
  );

  const preferredPreview = ["stake", "shuffle", "roobet"].filter((s) =>
    slugSet.has(s),
  );

  const previewSlugs =
    casinoFilter !== null
      ? Array.from(casinoFilter).slice(0, 3)
      : preferredPreview.length > 0
        ? preferredPreview
        : casinoOptions.slice(0, 3).map((c) => c.slug);

  const filterLabel =
    casinoFilter === null
      ? "All Casinos"
      : casinoFilter.size === 0
        ? "No Casinos"
        : casinoFilter.size === 1
          ? (nameBySlug[Array.from(casinoFilter)[0]!] ?? "1 Casino")
          : `${casinoFilter.size} Casinos`;

  const filtered = useMemo(
    () =>
      applyListFilters(sourceCodes, {
        search,
        casinoFilter,
        highRoller: highRoller && tab === "all",
      }),
    [sourceCodes, search, casinoFilter, highRoller, tab],
  );

  const tableLoading =
    tab === "exclusive" ? exclusiveLoading : isLoading;

  const hasCasinoFilter =
    casinoFilter !== null && casinoFilter.size !== casinoOptions.length;

  const emptyMessage =
    tab === "exclusive"
      ? exclusiveError
        ? exclusiveError
        : search || hasCasinoFilter
          ? "No exclusive codes match your search."
          : "No exclusive codes right now — check back soon."
      : search || hasCasinoFilter || highRoller
        ? "No codes match your filters."
        : "No codes available";

  const renderCasinoIcon = (slug: string, size: number) => (
    <AnalyticsCasinoIcon
      casinoName={nameBySlug[slug] ?? slug}
      size={size}
    />
  );

  return (
    <Card
      variant="glass"
      theme="auto"
      padded={false}
      className="light-element dark-glass-element p-4 sm:p-5"
      contentClassName="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full items-center justify-between gap-2 md:w-auto">
          <div className="flex flex-wrap items-center gap-2.5">
            <LiveBadge active={live} theme="auto" />
            <span className="hidden text-[18px] font-medium text-[#2a274e] sm:inline dark:text-white">
              Code drop feed by
            </span>
            <span className="inline-flex items-center">
              <Image
                src="/icons/fairgambling-text.svg"
                alt="FairGambling"
                width={110}
                height={15}
                className="h-[15px] w-auto dark:hidden"
              />
              <Image
                src="/icons/fairgambling-text-dark.svg"
                alt=""
                width={110}
                height={15}
                className="hidden h-[15px] w-auto dark:block"
              />
            </span>
          </div>
        </div>

        {tab === "all" ? (
          <div className="flex w-full items-center gap-3 md:w-auto md:gap-4">
            <button
              type="button"
              onClick={() => setHighRoller((v) => !v)}
              aria-pressed={highRoller}
              className={`whitespace-nowrap rounded-full border-[0.5px] px-3.5 py-[7px] text-[12px] font-medium transition-colors ${
                highRoller
                  ? "border-[#8874ff]/40 bg-[rgba(142,142,255,0.12)] text-[#6b56e0] dark:text-[#9A80F9]"
                  : "border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.04)] text-[rgba(42,39,78,0.6)] hover:text-[#2a274e] dark:border-white/20 dark:text-white/60 dark:hover:text-white"
              }`}
            >
              High Roller
            </button>

            <Dropdown
              theme="auto"
              multiple
              options={dropdownOptions}
              value={casinoFilter}
              onChange={setCasinoFilter}
              allLabel="All Casinos"
              noun="Casino"
              searchable
              align="right"
              panelWidth={240}
              size="sm"
              sizeConfig={{
                paddingX: 14,
                paddingY: 7,
                radius: 999,
                iconSize: 16,
              }}
              renderIcon={renderCasinoIcon}
              className="flex-1 [&>button]:w-full [&>button]:justify-between md:flex-none md:[&>button]:w-auto md:[&>button]:justify-start"
              trigger={
                <span className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-[12px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60">
                    {filterLabel}
                  </span>
                  {previewSlugs.length > 0 ? (
                    <span className="flex items-center">
                      {previewSlugs.map((slug, i) => (
                        <span
                          key={slug}
                          className={
                            i < previewSlugs.length - 1 ? "-mr-1.5" : ""
                          }
                        >
                          {renderCasinoIcon(slug, 20)}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              }
            />

            <span className="hidden h-[25px] w-px bg-[rgba(42,39,78,0.1)] md:block dark:bg-white/10" />

            <SoundToggle
              enabled={soundOn}
              onToggle={() => setSoundOn((v) => !v)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1 border-b border-[rgba(42,39,78,0.1)] dark:border-white/[0.08]">
        {(
          [
            { id: "all", label: "All" },
            { id: "exclusive", label: "Exclusive code" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${
              tab === item.id
                ? "text-[#6b56e0] dark:text-[#9A80F9]"
                : "text-[rgba(42,39,78,0.5)] hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
            }`}
          >
            {item.label}
            {tab === item.id ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#8874ff]" />
            ) : null}
          </button>
        ))}
      </div>

      {tab === "exclusive" && exclusiveLoading && filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(42,39,78,0.15)] border-t-[#8874ff] dark:border-white/20" />
        </div>
      ) : (
        <CodesTable
          data={filtered}
          isLoading={tableLoading && filtered.length > 0}
          onCasinoClick={(slug) => setCasinoFilter(new Set([slug]))}
          claimsColumnLabel={
            tab === "exclusive" ? "Max claims" : "Total Claims"
          }
          emptyMessage={emptyMessage}
        />
      )}
    </Card>
  );
}
