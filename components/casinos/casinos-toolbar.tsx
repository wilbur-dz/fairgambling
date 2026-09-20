"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Dropdown } from "@/components/ui/dropdown";
import { Tabs } from "@/components/ui/tabs";
import {
  GRID_SORT_TABS,
  TABLE_CATEGORIES,
  type GridSortKey,
  type TableCategoryId,
} from "@/lib/casinos/categories";

export type CasinoViewMode = "grid" | "table";

type CasinosToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  gridSortKey: GridSortKey;
  onGridSortChange: (key: GridSortKey) => void;
  viewMode: CasinoViewMode;
  onViewModeChange: (mode: CasinoViewMode) => void;
  casinoOptions: { value: string; label: string }[];
  selectedCasinos: Set<string> | null;
  onSelectedCasinosChange: (next: Set<string> | null) => void;
  tableTab: TableCategoryId;
  onTableTabChange: (tab: TableCategoryId) => void;
};

const VIEW_MODE_TABS = [
  { id: "grid" as const, leftIcon: <LayoutGrid /> },
  { id: "table" as const, leftIcon: <List /> },
];

/**
 * Port of reference toolbar `N` (`3y3noe8bca745.js` L56–187):
 * search, Rating/Compare, grid sort / table category tabs, view toggle, casino Dropdown.
 */
export function CasinosToolbar({
  searchValue,
  onSearchChange,
  gridSortKey,
  onGridSortChange,
  viewMode,
  onViewModeChange,
  casinoOptions,
  selectedCasinos,
  onSelectedCasinosChange,
  tableTab,
  onTableTabChange,
}: CasinosToolbarProps) {
  const router = useRouter();

  const tableCategoryTabs = useMemo(
    () => TABLE_CATEGORIES.map((item) => ({ id: item.id, label: item.label })),
    [],
  );

  const viewTabs = (
    <Tabs
      tabs={VIEW_MODE_TABS}
      activeId={viewMode}
      onChange={(id) => onViewModeChange(id as CasinoViewMode)}
      theme="auto"
      size="sm"
      sizeConfig={{ paddingX: 9, paddingY: 9, iconSize: 16 }}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="nd-ring-dark-only relative flex h-[42px] w-full items-center gap-2 rounded-[22px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-4 sm:w-[260px] sm:shrink-0 dark:border-0 dark:bg-white/[0.02]">
          <Search
            size={16}
            className="shrink-0 text-[rgba(42,39,78,0.4)] dark:text-white/50"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search casinos…"
            className="w-full bg-transparent text-[14px] font-light text-[#2a274e] placeholder:text-[rgba(42,39,78,0.4)] focus:outline-none dark:text-white dark:placeholder:text-white/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            tabs={[
              { id: "rating", label: "Rating" },
              { id: "compare", label: "Compare" },
            ]}
            activeId="rating"
            onChange={(id) => {
              if (id === "compare") router.push("/casinos/compare");
            }}
            theme="auto"
            size="sm"
            sizeConfig={{ paddingY: 10 }}
            fill
            className="w-full md:w-[208px]"
          />
          <div className="shrink-0 md:hidden">{viewTabs}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {viewMode === "table" ? (
          <div className="scrollbar-hide -mx-4 w-full min-w-0 overflow-x-auto px-4 md:mx-0 md:w-auto md:overflow-visible md:px-0">
            <Tabs
              tabs={tableCategoryTabs}
              activeId={tableTab}
              onChange={(id) => onTableTabChange(id as TableCategoryId)}
              theme="auto"
              size="sm"
              sizeConfig={{ paddingY: 10 }}
            />
          </div>
        ) : (
          <Tabs
            tabs={[...GRID_SORT_TABS]}
            activeId={gridSortKey}
            onChange={(id) => onGridSortChange(id as GridSortKey)}
            theme="auto"
            size="sm"
            sizeConfig={{ paddingY: 10 }}
            fill
            className="w-full md:w-[308px]"
          />
        )}

        <div className="flex items-center gap-4">
          {viewMode === "table" ? (
            <Dropdown
              multiple
              value={selectedCasinos}
              onChange={onSelectedCasinosChange}
              options={casinoOptions}
              theme="auto"
              allLabel="All Casinos"
              noun="Casino"
              allPreviewIcons
              searchable
              renderIcon={(name, iconSize) => (
                <AnalyticsCasinoIcon casinoName={name} size={iconSize} />
              )}
              align="right"
              panelWidth={240}
            />
          ) : null}
          <div className="hidden md:block">{viewTabs}</div>
        </div>
      </div>
    </div>
  );
}
