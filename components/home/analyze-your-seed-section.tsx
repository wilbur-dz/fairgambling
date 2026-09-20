"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { CarouselNav } from "@/components/ui/carousel-nav";

type SeedGame = {
  id: number;
  name: string;
  gameIcon: string;
};

const SEED_GAMES: SeedGame[] = [
  { id: 1, name: "DICE", gameIcon: "dice" },
  { id: 2, name: "MINES", gameIcon: "mines" },
  { id: 3, name: "PLINKO", gameIcon: "plinko" },
  { id: 4, name: "KENO", gameIcon: "keno" },
  { id: 5, name: "BLACKJACK", gameIcon: "blackjack" },
  { id: 6, name: "LIMBO", gameIcon: "limbo" },
  { id: 7, name: "HILO", gameIcon: "hilo" },
  { id: 8, name: "TOWER", gameIcon: "tower" },
  { id: 9, name: "ROULETTE", gameIcon: "roulette" },
  { id: 10, name: "COINFLIP", gameIcon: "flip" },
  { id: 11, name: "WHEEL", gameIcon: "wheel" },
  { id: 12, name: "CRASH", gameIcon: "crash" },
];

/** Route slug overrides for certain game icons (reference `ex`). */
const GAME_ROUTE_SLUG: Record<string, string> = {
  flip: "coinflip",
  tower: "tower",
};

const SCROLL_STEP = 193;

/** `em` — Analyze Your Seed horizontal game carousel. */
export function AnalyzeYourSeedSection() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: number) => {
    scrollerRef.current?.scrollBy({
      left: SCROLL_STEP * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/provably-fair" className="group flex items-center gap-2">
          <h2 className="text-[18px] font-medium leading-tight text-[#2a274e] dark:text-white">
            <span className="md:hidden">Analyze Your Seed</span>
            <span className="hidden md:inline">
              Analyze Your Seed — Simulate &amp; Verify Fairness
            </span>
          </h2>
          <ArrowRight
            size={16}
            className="shrink-0 text-[#2a274e]/40 transition-transform group-hover:translate-x-0.5 dark:text-white/40"
          />
        </Link>
        <CarouselNav
          onPrev={() => scrollByCards(-1)}
          onNext={() => scrollByCards(1)}
          theme="auto"
        />
      </div>
      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        <Link
          href="/provably-fair/stake-engine"
          className="relative block h-[221px] w-[169px] shrink-0 overflow-hidden rounded-[16px] transition hover:brightness-110"
        >
          <Image
            src="/games/stake-engine.png"
            alt="Stake Engine — provably fair verifier"
            fill
            sizes="169px"
            className="object-cover"
          />
          <span
            className="pointer-events-none absolute z-10 inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
            style={{
              background: "linear-gradient(135deg, #6F3FFA 0%, #9B6BFF 100%)",
              top: "10px",
              left: "-6px",
              transform: "rotate(-22deg)",
              boxShadow:
                "0 4px 14px rgba(124,95,243,0.55), 0 0 18px rgba(155,107,255,0.35)",
            }}
          >
            New
          </span>
        </Link>
        {SEED_GAMES.map((game) => {
          const slug = GAME_ROUTE_SLUG[game.gameIcon] || game.gameIcon;
          return (
            <Link
              key={game.id}
              href={`/provably-fair/stake/${slug}`}
              className="block h-[221px] w-[169px] shrink-0 overflow-hidden rounded-[16px] transition hover:brightness-110"
            >
              <Image
                src={`/casino-games/${game.gameIcon}.svg`}
                alt={game.name}
                width={169}
                height={221}
                className="size-full object-cover"
                unoptimized
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
