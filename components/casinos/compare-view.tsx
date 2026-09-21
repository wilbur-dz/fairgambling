"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Check, Plus, Search, Star, X } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { RatingGauge } from "@/components/ui/rating-gauge";
import { Tabs } from "@/components/ui/tabs";
import {
  buildSharedHouseGamesSection,
  buildSharedProvidersSection,
  COMPARE_SECTIONS,
  computeWinnersLosers,
  type CompareField,
  type CompareFieldValue,
  type CompareSection,
} from "@/lib/casinos/compare-sections";
import {
  licenseImageSrc,
  type CasinosBundle,
  type OverviewCasino,
  type RatingsDetailMap,
} from "@/lib/casinos/data";
import { useCasinoOverviewData } from "@/lib/casinos/use-casino-overview-data";

const GRID_COLS = "md:grid-cols-[272px_1fr_1fr_1fr]";

export type CompareViewProps = {
  initialBundle?: CasinosBundle | null;
  initialRatingsMap?: RatingsDetailMap;
};

function TruncateWithTooltip({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!tip) return;
    const clear = () => setTip(null);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, [tip]);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={() => {
          const el = ref.current;
          if (!el || el.scrollWidth <= el.clientWidth + 1) return;
          const rect = el.getBoundingClientRect();
          setTip({
            left: Math.min(rect.left, window.innerWidth - 328),
            top: rect.bottom + 6,
          });
        }}
        onMouseLeave={() => setTip(null)}
        onClick={() => setTip(null)}
        className={`truncate ${className}`}
        style={style}
      >
        {text}
      </span>
      {tip && typeof document !== "undefined"
        ? createPortal(
            <div
              className="nd-ring-dark-only pointer-events-none fixed z-[120] max-w-[320px] rounded-[12px] border border-[#e4e4e7] bg-white px-3 py-2 text-[13px] leading-snug text-[#2a274e] shadow-[0_8px_24px_rgba(42,39,78,0.15)] dark:border-0 dark:bg-[#0f1424] dark:text-white dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              style={{ left: tip.left, top: tip.top }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function CompareValueCell({
  label,
  value,
  isWinner,
  isLoser,
  casino,
}: {
  label: string;
  value: CompareFieldValue;
  isWinner: boolean;
  isLoser: boolean;
  casino: OverviewCasino;
}) {
  if (value == null) {
    return (
      <span className="text-[12px] text-[rgba(42,39,78,0.3)] md:text-[14px] dark:text-white/30">
        —
      </span>
    );
  }

  if (
    (label === "Category Score" || label === "Rating") &&
    typeof value === "string"
  ) {
    const match = value.match(/([\d.]+)\s*\/\s*(\d+)/);
    if (match) {
      return (
        <RatingGauge
          value={parseFloat(match[1])}
          maxValue={parseInt(match[2], 10)}
          color="#3EBC63"
        />
      );
    }
  }

  const color = isWinner
    ? "var(--nd-profit)"
    : isLoser
      ? "var(--nd-loss)"
      : "var(--nd-ink)";

  if (typeof value === "boolean") {
    return (
      <span
        className="flex items-center gap-1.5 text-[12px] font-semibold md:text-[14px]"
        style={{ color }}
      >
        {value ? (
          <Check
            size={14}
            className="text-[#1f9d57] dark:text-[#00FF86]"
          />
        ) : (
          <X size={14} className="text-[#dc2626] dark:text-[#F7575F]" />
        )}
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (label === "License") {
    const iconSrc = licenseImageSrc(casino.license.icon);
    return (
      <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[rgba(42,39,78,0.9)] md:gap-2 md:text-[14px] dark:text-white/90">
        {iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconSrc}
            alt=""
            className="size-5 shrink-0 object-contain"
          />
        ) : null}
        <TruncateWithTooltip text={value} />
      </span>
    );
  }

  if (label === "User Reviews") {
    return (
      <span
        className="flex items-center gap-1.5 text-[12px] font-semibold md:text-[14px]"
        style={{ color }}
      >
        <Star
          size={14}
          className="shrink-0 fill-[#d4a017] text-[#d4a017] dark:fill-[#FFCF2F] dark:text-[#FFCF2F]"
        />
        {value}
      </span>
    );
  }

  return (
    <TruncateWithTooltip
      text={value}
      className="min-w-0 flex-1 text-[12px] font-semibold md:text-[14px]"
      style={{ color }}
    />
  );
}

function CasinoPicker({
  selected,
  onSelect,
  onClear,
  excludeSlugs,
  casinos,
}: {
  selected: OverviewCasino | null;
  onSelect: (slug: string) => void;
  onClear: () => void;
  excludeSlugs: string[];
  casinos: OverviewCasino[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const options = useMemo(
    () =>
      casinos.filter(
        (c) =>
          !excludeSlugs.includes(c.slug) &&
          (!query || c.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [casinos, excludeSlugs, query],
  );

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ left: rect.left, top: rect.bottom + 8, width: rect.width });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    const onScroll = () => updatePos();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, close, updatePos]);

  const panel =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            className="nd-ring-dark-only fixed z-[110] overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white shadow-[0_12px_32px_rgba(42,39,78,0.12)] dark:border-0 dark:bg-[#0f1424]"
            style={{ left: pos.left, top: pos.top, width: pos.width }}
          >
            <div className="flex items-center gap-2 border-b border-[rgba(42,39,78,0.08)] px-3 py-2.5 dark:border-white/10">
              <Search
                size={16}
                className="shrink-0 text-[rgba(42,39,78,0.5)] dark:text-white/50"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search casinos…"
                className="w-full bg-transparent text-[14px] text-[#2a274e] placeholder:text-[rgba(42,39,78,0.4)] focus:outline-none dark:text-white dark:placeholder:text-white/40"
              />
            </div>
            <div className="max-h-[260px] overflow-y-auto py-1">
              {options.length === 0 ? (
                <div className="px-3 py-4 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
                  No casinos found
                </div>
              ) : (
                options.map((casino) => (
                  <button
                    key={casino.slug}
                    type="button"
                    onClick={() => {
                      onSelect(casino.slug);
                      close();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 hover:bg-[rgba(42,39,78,0.04)] dark:hover:bg-white/[0.04]"
                  >
                    <span className="size-7 shrink-0">
                      <AnalyticsCasinoIcon
                        casinoName={casino.name}
                        size={28}
                        theme="auto"
                        logoUrl={casino.logoUrl}
                      />
                    </span>
                    <TruncateWithTooltip
                      text={casino.name}
                      className="text-[14px] font-medium text-[#2a274e] dark:text-white"
                    />
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) close();
          else {
            updatePos();
            setOpen(true);
          }
        }}
        className={`flex h-[42px] w-full items-center gap-1.5 rounded-[22px] border px-1.5 transition-colors md:gap-2 md:px-2 bg-white dark:bg-white/[0.02] ${
          open
            ? "border-[#2a274e]/20 dark:border-white/20 dark:bg-white/[0.04]"
            : "border-[#2a274e]/10 hover:border-[#2a274e]/20 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
        }`}
      >
        {selected ? (
          <>
            <span className="size-[22px] shrink-0 md:size-[26px]">
              <AnalyticsCasinoIcon
                casinoName={selected.name}
                size={26}
                theme="auto"
                logoUrl={selected.logoUrl}
              />
            </span>
            <TruncateWithTooltip
              text={selected.name}
              className="flex-1 text-left text-[13px] font-medium text-[#2a274e] md:text-[14px] dark:text-white"
            />
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="flex size-5 shrink-0 items-center justify-center rounded-full text-[rgba(42,39,78,0.5)] hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
            >
              <X size={14} />
            </span>
          </>
        ) : (
          <>
            <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[rgba(42,39,78,0.06)] text-[rgba(42,39,78,0.45)] md:size-[26px] dark:bg-white/5 dark:text-white/40">
              <Plus size={16} />
            </span>
            <span className="text-[13px] text-[rgba(42,39,78,0.45)] md:text-[14px] dark:text-white/40">
              <span className="md:hidden">Select</span>
              <span className="hidden md:inline">Select Casino</span>
            </span>
          </>
        )}
      </button>
      {panel}
    </>
  );
}

function FieldRow({
  field,
  casinos,
}: {
  field: CompareField;
  casinos: Array<OverviewCasino | null>;
}) {
  const values = casinos.map((c) => (c ? field.getValue(c) : null));
  const { winners, losers } = field.compare
    ? computeWinnersLosers(values, field.compare)
    : { winners: new Set<number>(), losers: new Set<number>() };

  const labelNode: ReactNode = (
    <>
      {field.labelImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={field.labelImage}
          alt=""
          loading="lazy"
          className="size-8 shrink-0 rounded-[8px] object-cover"
        />
      ) : null}
      <span className="min-w-0">{field.label}</span>
    </>
  );

  const cells = casinos.map((casino, index) => (
    <div
      key={index}
      className="flex min-w-0 items-center md:min-h-[54px] md:px-4 md:py-3.5"
    >
      {casino ? (
        <CompareValueCell
          label={field.label}
          value={values[index]}
          isWinner={winners.has(index)}
          isLoser={losers.has(index)}
          casino={casino}
        />
      ) : (
        <span className="text-[13px] text-[rgba(42,39,78,0.3)] md:text-[14px] dark:text-white/30">
          —
        </span>
      )}
    </div>
  ));

  return (
    <>
      <div
        className={`hidden border-b md:grid ${GRID_COLS}`}
        style={{ borderColor: "var(--nd-hairline)" }}
      >
        <div className="flex min-h-[54px] items-center gap-2.5 px-4 py-3.5 text-[14px] font-semibold text-[#2a274e] dark:text-white">
          {labelNode}
        </div>
        {cells}
      </div>
      <div
        className="border-b py-3 md:hidden"
        style={{ borderColor: "var(--nd-hairline)" }}
      >
        <div className="flex items-center gap-2 pb-2 text-[12px] font-semibold text-[#2a274e] dark:text-white">
          {labelNode}
        </div>
        <div className="grid grid-cols-3 gap-2 text-[13px]">{cells}</div>
      </div>
    </>
  );
}

function SectionBlock({
  section,
  casinos,
}: {
  section: CompareSection;
  casinos: Array<OverviewCasino | null>;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={`border-b md:grid ${GRID_COLS}`}
        style={{ borderColor: "var(--nd-hairline)" }}
      >
        <div className="flex h-[44px] items-center text-[12px] font-medium uppercase tracking-wider text-[rgba(42,39,78,0.4)] md:px-4 dark:text-white/30">
          {section.title}
        </div>
      </div>
      {section.fields.map((field) => (
        <FieldRow key={field.label} field={field} casinos={casinos} />
      ))}
    </div>
  );
}

/** Port of reference `CompareView`. */
export function CompareView({
  initialBundle = null,
  initialRatingsMap = {},
}: CompareViewProps) {
  const router = useRouter();
  const { casinos } = useCasinoOverviewData({
    defaultSortKey: "depositVolume30d",
    defaultSortDirection: "desc",
    initialBundle,
    initialRatingsMap,
  });

  const [slots, setSlots] = useState<[string | null, string | null, string | null]>([
    null,
    null,
    null,
  ]);
  const [search, setSearch] = useState("");

  const excludeSlugs = useMemo(
    () => slots.filter((s): s is string => s != null),
    [slots],
  );

  const filteredCasinos = useMemo(
    () =>
      search
        ? casinos.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()),
          )
        : casinos,
    [casinos, search],
  );

  const selectedCasinos = useMemo(
    () => slots.map((slug) => casinos.find((c) => c.slug === slug) ?? null),
    [slots, casinos],
  );

  const sections = useMemo(() => {
    const next = [...COMPARE_SECTIONS];
    const house = buildSharedHouseGamesSection(selectedCasinos);
    if (house) next.push(house);
    const providers = buildSharedProvidersSection(selectedCasinos);
    if (providers) next.push(providers);
    return next;
  }, [selectedCasinos]);

  const handleSelect = useCallback((index: number, slug: string) => {
    setSlots((prev) => {
      const copy = [...prev] as [string | null, string | null, string | null];
      copy[index] = slug;
      return copy;
    });
  }, []);

  const handleClear = useCallback((index: number) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = null;
      const filled = copy.filter((s): s is string => s != null);
      return [filled[0] ?? null, filled[1] ?? null, filled[2] ?? null];
    });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="nd-ring-dark-only relative flex h-[42px] w-full items-center gap-2 rounded-[22px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-4 sm:w-[260px] sm:shrink-0 dark:border-0 dark:bg-white/[0.02]">
          <Search
            size={16}
            className="shrink-0 text-[rgba(42,39,78,0.5)] dark:text-white/50"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search casinos…"
            className="w-full bg-transparent text-[14px] font-light text-[#2a274e] placeholder:text-[rgba(42,39,78,0.5)] focus:outline-none dark:text-white dark:placeholder:text-white/50"
          />
        </div>
        <Tabs
          theme="auto"
          tabs={[
            { id: "rating", label: "Rating" },
            { id: "compare", label: "Compare" },
          ]}
          activeId="compare"
          onChange={(id) => {
            if (id === "rating") router.push("/casinos");
          }}
          size="sm"
          sizeConfig={{ paddingY: 10 }}
          fill
          className="w-full md:w-[208px]"
        />
      </div>

      <div className="scrollbar-hide md:overflow-x-auto">
        <div className="md:min-w-[1000px]">
          <div
            className={`sticky top-0 z-20 grid grid-cols-3 gap-2 bg-[#f4f4f4] pb-3 md:gap-0 dark:bg-dark-bg ${GRID_COLS}`}
          >
            <div className="hidden md:block" />
            {[0, 1, 2].map((index) => (
              <div key={index} className="min-w-0 md:px-2">
                <CasinoPicker
                  selected={selectedCasinos[index]}
                  onSelect={(slug) => handleSelect(index, slug)}
                  onClear={() => handleClear(index)}
                  excludeSlugs={excludeSlugs}
                  casinos={filteredCasinos}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {sections.map((section) => (
              <SectionBlock
                key={section.title}
                section={section}
                casinos={selectedCasinos}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
