"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HeroNewsItem = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  accent: string;
  image?: string | null;
  breaking?: boolean;
};

export function newsCardGradient(accent: string): string {
  return `radial-gradient(120% 90% at 18% 12%, ${accent}3d, transparent 55%), radial-gradient(90% 80% at 90% 100%, ${accent}2b, transparent 50%), linear-gradient(155deg, #161a2b 0%, #0c0f19 70%)`;
}

type NewsHeroTileProps = {
  item: HeroNewsItem;
  featured?: boolean;
  onSelect?: () => void;
  cycleKey?: string;
  slide?: boolean;
  progressActive?: boolean;
  className?: string;
};

export function NewsHeroTile({
  item,
  featured = false,
  onSelect,
  cycleKey,
  slide,
  progressActive,
  className = "",
}: NewsHeroTileProps) {
  const router = useRouter();

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.();
      }}
      style={
        slide
          ? undefined
          : { flexGrow: featured ? 2.6 : 1, flexBasis: 0, zIndex: featured ? 30 : 1 }
      }
      className={`group relative flex h-full min-h-[300px] cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] ring-1 ring-white/[0.08] transition-[flex-grow,box-shadow] duration-[900ms] ease-out hover:ring-white/20 ${className}`}
    >
      {item.image ? (
        <>
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(90% 80% at 85% 15%, ${item.accent}30, transparent 55%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ background: newsCardGradient(item.accent) }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a12] via-[#080a12]/55 to-[#080a12]/10" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${item.accent}88, transparent)`,
        }}
      />
      {item.breaking ? (
        <span className="absolute left-4 top-4 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-red-600/30">
          Breaking
        </span>
      ) : null}
      <div className={`relative flex flex-col ${featured ? "gap-2 p-6" : "gap-1.5 p-4"}`}>
        <span className="mb-1 block h-[3px] w-16 overflow-hidden rounded-full bg-white/15">
          {(progressActive ?? featured) ? (
            <span
              key={cycleKey}
              className="block h-full w-full origin-left rounded-full bg-white/90"
              style={{ animation: "fgNewsFill 7500ms linear forwards" }}
            />
          ) : null}
        </span>
        <h3
          className={`font-semibold leading-tight text-white ${
            featured ? "text-[22px]" : "line-clamp-3 text-[14px]"
          }`}
        >
          {item.title}
        </h3>
        {featured ? (
          <p className="max-w-md text-[13px] leading-relaxed text-white/60">
            {item.excerpt}
          </p>
        ) : null}
        <div
          className={`flex items-center justify-between gap-2 border-t border-white/[0.08] ${
            featured ? "mt-2.5 pt-3" : "mt-1.5 pt-2.5"
          }`}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: item.accent, opacity: 0.85 }}
          >
            {item.category}
          </span>
          {featured ? (
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowUpRight />}
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                router.push(item.href);
              }}
            >
              Read more
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
