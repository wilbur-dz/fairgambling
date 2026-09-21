"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StreamerAvatar } from "@/components/streamers/shared";
import { Dropdown } from "@/components/ui/dropdown";
import { clientGetStreamerNews } from "@/lib/streamers/client-api";
import { CATEGORY_ACCENT } from "@/lib/streamers/news";
import { mvOf } from "@/lib/streamers/data";
import type { StreamerNewsArticle, StreamerRecord } from "@/lib/streamers/types";
import { newsCardGradient } from "../overview/news-hero-tile";

type StreamersNewsTabProps = {
  initial: StreamerNewsArticle[] | null | undefined;
  streamers: StreamerRecord[];
};

export function StreamersNewsTab({ initial, streamers }: StreamersNewsTabProps) {
  const [articles, setArticles] = useState<StreamerNewsArticle[] | null>(
    initial ?? null,
  );
  const [categories, setCategories] = useState<Set<string> | null>(null);
  const [streamerFilter, setStreamerFilter] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    clientGetStreamerNews()
      .then((rows) => {
        if (alive) setArticles(rows);
      })
      .catch(() => {
        if (alive) setArticles([]);
      });
    return () => {
      alive = false;
    };
  }, [initial]);

  const categoryOptions = useMemo(
    () => [...new Set((articles ?? []).map((a) => a.category ?? "General"))],
    [articles],
  );

  const streamerOptions = useMemo(() => {
    const mvByUser = new Map(
      streamers.map((s) => [s.username.trim().toLowerCase(), mvOf(s) ?? 0]),
    );
    const names = [
      ...new Set(
        (articles ?? []).flatMap((a) => a.streamers?.map((s) => s.username) ?? []),
      ),
    ];
    return names.sort(
      (a, b) =>
        (mvByUser.get(b.trim().toLowerCase()) ?? 0) -
          (mvByUser.get(a.trim().toLowerCase()) ?? 0) || a.localeCompare(b),
    );
  }, [articles, streamers]);

  const filtered = useMemo(
    () =>
      (articles ?? []).filter((article) => {
        const cat = article.category ?? "General";
        if (categories && !categories.has(cat)) return false;
        if (
          streamerFilter &&
          !article.streamers?.some((s) => streamerFilter.has(s.username))
        ) {
          return false;
        }
        return true;
      }),
    [articles, categories, streamerFilter],
  );

  if (articles === null) {
    return (
      <div className="py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
        Loading news…
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(42,39,78,0.1)] py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:border-white/10 dark:text-white/40">
        No streamer news yet — check back soon.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Dropdown
          theme="auto"
          multiple
          size="sm"
          align="right"
          options={categoryOptions.map((c) => ({ value: c, label: c }))}
          value={categories}
          onChange={setCategories}
          allLabel="All Categories"
          noun="Category"
        />
        {streamerOptions.length > 0 ? (
          <Dropdown
            theme="auto"
            multiple
            searchable
            size="sm"
            align="right"
            className="min-w-0 flex-1 [&>button]:w-full [&>button]:justify-between sm:flex-none sm:[&>button]:w-auto sm:[&>button]:justify-start"
            options={streamerOptions.map((name) => ({ value: name, label: name }))}
            renderIcon={(name, size) => <StreamerAvatar name={name} size={size} />}
            value={streamerFilter}
            onChange={setStreamerFilter}
            allLabel="All Streamers"
            noun="Streamer"
          />
        ) : null}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(42,39,78,0.1)] py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:border-white/10 dark:text-white/40">
          No articles match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => {
            const category = article.category ?? "General";
            const accent = CATEGORY_ACCENT[category] ?? "#8874ff";
            return (
              <Link
                key={article.slug}
                href={`/streamers/news/${article.slug}`}
                className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[20px] ring-1 ring-white/[0.08] transition-all hover:ring-white/20"
              >
                {article.coverImageUrl ? (
                  <>
                    <img
                      src={article.coverImageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(90% 80% at 85% 15%, ${accent}30, transparent 55%)`,
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{ background: newsCardGradient(accent) }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a12] via-[#080a12]/55 to-[#080a12]/10" />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accent}88, transparent)`,
                  }}
                />
                {article.breaking ? (
                  <span className="absolute left-4 top-4 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-red-600/30">
                    Breaking
                  </span>
                ) : null}
                <div className="relative flex flex-col gap-1.5 p-4">
                  <h2 className="line-clamp-2 text-[15px] font-semibold leading-tight text-white">
                    {article.title}
                  </h2>
                  {article.excerpt ? (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-white/60">
                      {article.excerpt}
                    </p>
                  ) : null}
                  <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-2.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: accent, opacity: 0.85 }}
                    >
                      {category}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
