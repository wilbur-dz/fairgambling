"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clientFetchCasinoRatingsMap,
  clientGetCasinosBundle,
  clientGetCasinosList,
  clientGetMarketBreakdown,
} from "@/lib/casinos/client-api";
import {
  DEFAULT_OVERVIEW_FILTERS,
  buildOverviewCasino,
  filterOverviewCasinos,
  hasCasinoRatingEntry,
  indexBreakdown,
  sortOverviewCasinos,
  type CasinosBundle,
  type OverviewCasino,
  type OverviewFilters,
  type RatingsDetailMap,
} from "@/lib/casinos/data";

type UseCasinoOverviewDataArgs = {
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  initialBundle?: CasinosBundle | null;
  initialRatingsMap?: RatingsDetailMap;
};

/**
 * Port of reference `useCasinoOverviewData`.
 * Prefers SSR bundle; otherwise fetches casinos-bundle with fallbacks.
 */
export function useCasinoOverviewData({
  defaultSortKey = "fgRating",
  defaultSortDirection = "desc",
  initialBundle = null,
  initialRatingsMap = {},
}: UseCasinoOverviewDataArgs = {}) {
  const hasInitial = Boolean(
    initialBundle && initialBundle.breakdown30d.length > 0,
  );

  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSortDirection,
  );
  const [filters, setFilters] = useState<OverviewFilters>(
    DEFAULT_OVERVIEW_FILTERS,
  );
  const [breakdown30d, setBreakdown30d] = useState(
    initialBundle?.breakdown30d ?? [],
  );
  const [breakdown7d, setBreakdown7d] = useState(
    initialBundle?.breakdown7d ?? [],
  );
  const [breakdown90d, setBreakdown90d] = useState(
    initialBundle?.breakdown90d ?? [],
  );
  const [breakdown365d, setBreakdown365d] = useState(
    initialBundle?.breakdown365d ?? [],
  );
  const [rawCasinos, setRawCasinos] = useState(initialBundle?.casinos ?? []);
  const [ratingsMap, setRatingsMap] =
    useState<RatingsDetailMap>(initialRatingsMap);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return;
    let cancelled = false;

    (async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        const bundle = await clientGetCasinosBundle(controller.signal);
        clearTimeout(timer);
        if (cancelled) return;

        if (bundle && bundle.breakdown30d.length > 0) {
          setBreakdown30d(bundle.breakdown30d);
          setBreakdown7d(bundle.breakdown7d);
          setBreakdown90d(bundle.breakdown90d);
          setBreakdown365d(bundle.breakdown365d);
          if (bundle.casinos.length > 0) {
            setRawCasinos(bundle.casinos);
            return;
          }
          try {
            const list = await clientGetCasinosList(100);
            if (!cancelled) setRawCasinos(list);
          } catch {
            /* ignore */
          }
          return;
        }
      } catch {
        /* fall through */
      }

      if (cancelled) return;
      try {
        const [market30, list] = await Promise.all([
          clientGetMarketBreakdown("30D"),
          clientGetCasinosList(100),
        ]);
        if (cancelled) return;
        setBreakdown30d(market30);
        setRawCasinos(list);
      } catch (err) {
        console.error("Failed to fetch casinos data:", err);
      }

      if (!cancelled) {
        void Promise.all([
          clientGetMarketBreakdown("7D")
            .then((rows) => {
              if (!cancelled) setBreakdown7d(rows);
            })
            .catch(() => {}),
          clientGetMarketBreakdown("90D")
            .then((rows) => {
              if (!cancelled) setBreakdown90d(rows);
            })
            .catch(() => {}),
          clientGetMarketBreakdown("365D")
            .then((rows) => {
              if (!cancelled) setBreakdown365d(rows);
            })
            .catch(() => {}),
        ]);
      }
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [hasInitial]);

  useEffect(() => {
    if (rawCasinos.length === 0 || hasInitial) return;
    const slugs = rawCasinos.map((c) => c.slug);
    let cancelled = false;
    void clientFetchCasinoRatingsMap(slugs, initialRatingsMap).then((map) => {
      if (!cancelled && Object.keys(map).length > 0) {
        setRatingsMap((prev) => ({ ...prev, ...map }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [rawCasinos, initialRatingsMap, hasInitial]);

  useEffect(() => {
    if (Object.keys(initialRatingsMap).length > 0) {
      setRatingsMap((prev) => ({ ...initialRatingsMap, ...prev }));
    }
  }, [initialRatingsMap]);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("desc");
      }
    },
    [sortKey],
  );

  const maps = useMemo(
    () => ({
      d30: indexBreakdown(breakdown30d),
      d7: indexBreakdown(breakdown7d),
      d90: indexBreakdown(breakdown90d),
      d365: indexBreakdown(breakdown365d),
    }),
    [breakdown30d, breakdown7d, breakdown90d, breakdown365d],
  );

  const prepared = useMemo(() => {
    const rows = rawCasinos
      .filter(
        (c) =>
          (c.meta && Object.keys(c.meta).length > 0) ||
          hasCasinoRatingEntry(c.slug, ratingsMap),
      )
      .map((c) => buildOverviewCasino(c, ratingsMap, maps));

    const filtered = filterOverviewCasinos(rows, filters);
    return sortOverviewCasinos(filtered, sortKey, sortDirection);
  }, [rawCasinos, ratingsMap, maps, filters, sortKey, sortDirection]);

  const casinos = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return prepared;
    return prepared.filter((c) => c.name.toLowerCase().includes(q));
  }, [prepared, searchValue]);

  const allCasinos = useMemo(
    () =>
      rawCasinos.filter(
        (c) =>
          (c.meta && Object.keys(c.meta).length > 0) ||
          hasCasinoRatingEntry(c.slug, ratingsMap),
      ),
    [rawCasinos, ratingsMap],
  );

  return {
    casinos: casinos as OverviewCasino[],
    allCasinos,
    loading,
    searchValue,
    setSearchValue,
    sortKey,
    sortDirection,
    handleSort,
    setSortKey,
    setSortDirection,
    filters,
    setFilters,
  };
}
