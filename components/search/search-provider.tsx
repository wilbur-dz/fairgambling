"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/navigation";

type SearchContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  const results = APP_ROUTES.filter((route) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      route.label.toLowerCase().includes(q) ||
      route.href.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-base-200 bg-white shadow-xl dark:border-white/[0.08] dark:bg-[#161c32]"
      >
        <div className="border-b border-base-200 px-4 py-3 dark:border-white/[0.08]">
          <h2 id={titleId} className="sr-only">
            Search
          </h2>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages…"
            className="h-11 w-full bg-transparent text-[15px] text-base-900 outline-none placeholder:text-base-400 dark:text-white"
          />
        </div>
        <ul className="max-h-[360px] overflow-y-auto py-2">
          {results.map((route) => (
            <li key={route.href}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-base-100 dark:hover:bg-white/[0.04]"
                onClick={() => {
                  onClose();
                  router.push(route.href);
                }}
              >
                <span className="font-medium text-base-900 dark:text-white">
                  {route.label}
                </span>
                <span className="text-xs text-base-400">{route.href}</span>
              </button>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-base-500">
              No matches
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openSearch, closeSearch }),
    [open, openSearch, closeSearch],
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchModal open={open} onClose={closeSearch} />
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
