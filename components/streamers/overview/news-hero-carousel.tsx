"use client";

import { useEffect, useRef, useState } from "react";
import { clientGetStreamerNews } from "@/lib/streamers/client-api";
import { CATEGORY_ACCENT } from "@/lib/streamers/news";
import { pickWideCoverArticles } from "@/lib/streamers/news-covers";
import { NewsHeroTile, type HeroNewsItem } from "./news-hero-tile";

export function NewsHeroCarousel() {
  const [items, setItems] = useState<HeroNewsItem[] | null>(null);
  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    clientGetStreamerNews()
      .then(async (articles) => {
        const sorted = [...articles].sort(
          (a, b) => Number(b.breaking) - Number(a.breaking),
        );
        const picked = await pickWideCoverArticles(sorted, 4);
        if (!alive) return;
        setItems(
          picked.map((article) => ({
            id: article.slug,
            category: article.category ?? "General",
            title: article.title,
            excerpt: article.excerpt ?? "",
            href: `/streamers/news/${article.slug}`,
            accent: CATEGORY_ACCENT[article.category ?? "General"] ?? "#8874ff",
            image: article.coverImageUrl,
            breaking: article.breaking,
          })),
        );
        setActive(0);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % items.length),
      7500,
    );
    return () => clearInterval(timer);
  }, [items, cycleKey]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = active * (el.clientWidth + 12);
    if (Math.abs(el.scrollLeft - target) > 4) {
      el.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [active]);

  const select = (index: number) => {
    setActive(index);
    setCycleKey((k) => k + 1);
  };

  const cycle = `${active}-${cycleKey}`;

  if (items === null) {
    return (
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-3 sm:h-[300px] sm:flex-row sm:items-stretch">
          {[2.6, 1, 1, 1].map((grow, i) => (
            <div
              key={i}
              style={{ flexGrow: grow, flexBasis: 0 }}
              className={`min-h-[300px] animate-pulse rounded-[20px] bg-[rgba(42,39,78,0.04)] ring-1 ring-white/[0.06] dark:bg-white/[0.04] ${
                i > 0 ? "hidden sm:block" : ""
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <style>{`@keyframes fgNewsFill { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
      <div
        ref={scrollerRef}
        onScroll={() => {
          const el = scrollerRef.current;
          if (!el || !items.length) return;
          const index = Math.round(el.scrollLeft / (el.clientWidth + 12));
          if (index !== active && index >= 0 && index < items.length) {
            setActive(index);
            setCycleKey((k) => k + 1);
          }
        }}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto sm:hidden"
      >
        {items.map((item, i) => (
          <div key={item.id} className="w-full shrink-0 snap-center">
            <NewsHeroTile
              item={item}
              featured
              slide
              progressActive={i === active}
              cycleKey={cycle}
            />
          </div>
        ))}
      </div>
      <div className="hidden h-[300px] gap-3 [contain:layout] sm:flex sm:items-stretch">
        {items.map((item, i) => (
          <NewsHeroTile
            key={item.id}
            item={item}
            featured={i === active}
            onSelect={() => select(i)}
            cycleKey={cycle}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => select(i)}
            aria-label={`News ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
              i === active
                ? "w-8 bg-gradient-to-r from-[#8874ff] to-[#6366f1] shadow-[0_0_10px_rgba(136,116,255,0.35)]"
                : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
