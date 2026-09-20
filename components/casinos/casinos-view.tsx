"use client";

import { useMemo, useState } from "react";
import { CasinosCompareTable } from "@/components/casinos/casinos-compare-table";
import { CasinosGrid } from "@/components/casinos/casinos-grid";
import {
  CasinosToolbar,
  type CasinoViewMode,
} from "@/components/casinos/casinos-toolbar";
import type { GridSortKey, TableCategoryId } from "@/lib/casinos/categories";
import type { CasinosBundle, RatingsDetailMap } from "@/lib/casinos/data";
import { useCasinoOverviewData } from "@/lib/casinos/use-casino-overview-data";

export type CasinosViewProps = {
  initialBundle?: CasinosBundle | null;
  initialRatingsMap?: RatingsDetailMap;
};

/** Port of reference `CasinosView`. */
export function CasinosView({
  initialBundle = null,
  initialRatingsMap = {},
}: CasinosViewProps) {
  const [viewMode, setViewMode] = useState<CasinoViewMode>("grid");
  const [gridSortKey, setGridSortKey] = useState<GridSortKey>("fgRating");
  const [tableTab, setTableTab] = useState<TableCategoryId>("basicInfo");
  const [selectedCasinos, setSelectedCasinos] = useState<Set<string> | null>(
    null,
  );

  const data = useCasinoOverviewData({
    defaultSortKey: "fgRating",
    defaultSortDirection: "desc",
    initialBundle,
    initialRatingsMap,
  });

  const visibleCasinos = useMemo(() => {
    if (!selectedCasinos) return data.casinos;
    return data.casinos.filter((c) => selectedCasinos.has(c.name));
  }, [data.casinos, selectedCasinos]);

  const casinoOptions = useMemo(
    () =>
      [...data.casinos]
        .sort((a, b) => b.fgRating - a.fgRating)
        .map((c) => ({ value: c.name, label: c.name })),
    [data.casinos],
  );

  console.log(tableTab, 'tableTab')

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <CasinosToolbar
        searchValue={data.searchValue}
        onSearchChange={data.setSearchValue}
        gridSortKey={gridSortKey}
        onGridSortChange={(key) => {
          setGridSortKey(key);
          data.setSortKey(key);
          data.setSortDirection("desc");
        }}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          data.setSortKey(mode === "grid" ? gridSortKey : "fgRating");
          data.setSortDirection("desc");
        }}
        casinoOptions={casinoOptions}
        selectedCasinos={selectedCasinos}
        onSelectedCasinosChange={setSelectedCasinos}
        tableTab={tableTab}
        onTableTabChange={setTableTab}
      />

      {viewMode === "grid" ? (
        <CasinosGrid casinos={visibleCasinos} loading={data.loading} />
      ) : (
        <CasinosCompareTable
          casinos={visibleCasinos}
          loading={data.loading}
          sortKey={data.sortKey}
          sortDirection={data.sortDirection}
          onSort={data.handleSort}
          tableTab={tableTab}
          onTableTabChange={setTableTab}
        />
      )}
    </main>
  );
}
