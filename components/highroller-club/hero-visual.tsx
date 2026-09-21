"use client";

import { useEffect, useRef, useState } from "react";
import { CasinoLogo } from "@/components/ui/casino-logo";

type LogoSpot = {
  slug: string;
  name: string;
  left: number;
  top: number;
  stakeS?: boolean;
};

const LOGO_SPOTS: LogoSpot[] = [
  { slug: "bcgame", name: "BC.GAME", left: 14, top: -7 },
  { slug: "rainbet", name: "Rainbet", left: 125, top: 18 },
  { slug: "shuffle", name: "Shuffle", left: 230, top: -7 },
  { slug: "roobet", name: "Roobet", left: 337, top: 15 },
  { slug: "duel", name: "Duel", left: 429, top: 13 },
  { slug: "stake", name: "Stake", left: 49, top: 182, stakeS: true },
  { slug: "gamdom", name: "Gamdom", left: 208, top: 165 },
  { slug: "thrill", name: "Thrill", left: 346, top: 175 },
  { slug: "winna", name: "Winna", left: 465, top: 146 },
];

const STEPS = [
  { n: "01", title: "Tell us how you play", sub: "Short private survey" },
  { n: "02", title: "Casinos compete", sub: "Private offers for you" },
  { n: "03", title: "You choose", sub: "Compare & pick the best" },
] as const;

const BASE_W = 528;
const BASE_H = 231;

/** Hero visual — mobile step list + scaled desktop logo constellation. */
export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / BASE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex flex-col gap-2">
          {STEPS.map(({ n, title, sub }) => (
            <div
              key={n}
              className="flex items-center gap-3 rounded-[16px] bg-white/[0.6] px-4 py-3 ring-1 ring-[rgba(42,39,78,0.08)] dark:bg-white/[0.06] dark:ring-white/10"
            >
              <span className="text-[12px] font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30">
                {n}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
                  {title}
                </span>
                <span className="text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80">
                  {sub}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 items-center gap-y-3">
          {LOGO_SPOTS.map(({ slug, name, stakeS }) => (
            <span key={slug} className="flex items-center justify-center">
              <CasinoLogo
                slug={slug}
                name={name}
                size={38}
                analyticsStakeS={stakeS}
                className="object-contain"
              />
            </span>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative ml-auto hidden w-full max-w-[528px] lg:block"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-40px] top-1/2 h-[280px] w-[360px] -translate-y-1/2 bg-[linear-gradient(180deg,rgba(209,213,219,0.45),rgba(156,163,175,0.45))] dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.45),rgba(52,0,107,0.45))]"
          style={{ filter: "blur(80px)" }}
        />
        <div style={{ height: BASE_H * scale }} />
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: BASE_W,
            height: BASE_H,
            transform: `scale(${scale})`,
          }}
        >
          <div className="absolute left-0 top-0 h-[230px] w-[528px]">
            {LOGO_SPOTS.map(({ slug, name, left, top, stakeS }) => (
              <div
                key={slug}
                className="absolute flex w-[70px] items-center justify-center p-[4px]"
                style={{ left, top }}
              >
                <CasinoLogo
                  slug={slug}
                  name={name}
                  size={44}
                  analyticsStakeS={stakeS}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-[12px]">
              {STEPS.map(({ n, title, sub }) => (
                <div
                  key={n}
                  className="flex flex-col items-start gap-[12px] rounded-[16px] bg-gradient-to-b from-white/[0.6] to-white/80 px-[16px] py-[12px] backdrop-blur-[20px] ring-1 ring-[rgba(42,39,78,0.08)] dark:bg-gradient-to-b dark:from-white/[0.12] dark:to-white/20"
                >
                  <p className="w-full text-[12px] font-medium uppercase text-[rgba(42,39,78,0.3)] dark:text-white/30">
                    {n}
                  </p>
                  <div className="flex flex-col items-start whitespace-nowrap text-[#2a274e] dark:text-white">
                    <p className="text-[14px] font-medium">{title}</p>
                    <p className="text-[12px] font-normal text-[rgba(42,39,78,0.8)] dark:text-white/80">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
