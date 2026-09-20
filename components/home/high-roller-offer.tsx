"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { ClickNav } from "@/components/ui/click-nav";

const BLUR_GRADIENT =
  "bg-[linear-gradient(180deg,rgba(209,213,219,0.5)_0%,rgba(156,163,175,0.5)_100%)] dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5)_0%,rgba(52,0,107,0.5)_100%)]";

type LogoSpot = {
  c: string;
  top: number;
  right: number;
  bottom: number;
  scale?: number;
};

const LOGO_SPOTS: LogoSpot[] = [
  { c: "bcgame", top: -1.3, right: 86.55, bottom: 81.82 },
  { c: "stake", top: 80.52, right: 79.92, bottom: 0 },
  { c: "rainbet", top: 9.52, right: 65.53, bottom: 70.99 },
  { c: "shuffle", top: -1.3, right: 45.64, bottom: 81.82 },
  { c: "gamdom", top: 73.16, right: 49.81, bottom: 7.36 },
  { c: "roobet", top: 8.23, right: 25.38, bottom: 72.29 },
  { c: "thrill", top: 75.76, right: 22.92, bottom: 1.3, scale: 0.72 },
  { c: "duel", top: 7.36, right: 7.95, bottom: 73.16 },
  { c: "winna", top: 64.94, right: 1.14, bottom: 15.58, scale: 0.72 },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us how you play",
    sub: "Short private survey",
    w: 163,
  },
  {
    n: "02",
    title: "Casinos compete",
    sub: "Private offers for you",
    w: 146,
  },
  {
    n: "03",
    title: "You choose",
    sub: "Compare & pick the best",
    w: 168,
  },
] as const;

function OfferChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-auto items-center justify-center rounded-full bg-[#8e8eff]/10 px-3.5 text-[13px] font-medium text-[#2a274e] md:h-[42px] md:w-[110px] md:px-0 md:text-[14px] dark:text-white">
      {children}
    </span>
  );
}

function StepCard({
  n,
  title,
  sub,
  width,
}: {
  n: string;
  title: string;
  sub: string;
  width: number;
}) {
  return (
    <div
      className="flex h-[86px] flex-col justify-center gap-3 rounded-[16px] border border-[#2a274e]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.85)_100%)] px-4 backdrop-blur-[20px] dark:border-0 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.2)_100%)]"
      style={{ width }}
    >
      <span className="text-[12px] font-medium uppercase text-[#2a274e] opacity-40 dark:text-white dark:opacity-30">
        {n}
      </span>
      <div className="flex flex-col whitespace-nowrap">
        <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
          {title}
        </span>
        <span className="text-[12px] text-[#2a274e]/70 dark:text-white dark:opacity-80">
          {sub}
        </span>
      </div>
    </div>
  );
}

/** `ee` — High roller offer CTA (static). */
export function HighRollerOffer() {
  return (
    <Card
      variant="glass"
      theme="auto"
      ring={false}
      padded={false}
      className="light-element dark-glass-element relative h-auto w-full overflow-hidden lg:min-h-[231px]"
      contentClassName="flex h-full"
    >
      <div className="contents">
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-16 z-0 md:hidden ${BLUR_GRADIENT}`}
          style={{ filter: "blur(90px)" }}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute right-[-80px] top-1/2 z-0 hidden h-[344px] w-[465px] -translate-y-1/2 md:block ${BLUR_GRADIENT}`}
          style={{ filter: "blur(90px)" }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-4 p-5 md:gap-8 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <h2 className="text-[20px] font-medium leading-snug text-[#2a274e] md:text-[24px] md:leading-normal dark:text-white">
            Find the best offer possible.
          </h2>
          <p className="text-[14px] font-normal leading-snug text-[#2a274e] md:text-[16px] md:leading-normal dark:text-white">
            You stay anonymous. Vetted casinos see your verified play, then
            privately bid for you. Compare every offer and pick the best one.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <ClickNav
            href="/highroller-club/get-offer"
            className="flex h-[38px] w-[130px] items-center justify-center rounded-full text-[13px] font-medium text-white transition-all hover:brightness-110 md:h-[42px] md:w-[140px] md:text-[14px]"
            style={{
              background: "linear-gradient(180deg, #8874ff 0%, #5105a1 100%)",
              boxShadow:
                "0 0 28px rgba(153,51,229,0.3), 0 0 8px rgba(184,71,255,0.5)",
            }}
          >
            Get your offer
          </ClickNav>
          <OfferChip>Anonymous</OfferChip>
          <OfferChip>No account</OfferChip>
          <OfferChip>90 seconds</OfferChip>
        </div>
      </div>

      <div className="relative z-10 hidden h-[231px] w-[528px] shrink-0 self-center lg:block">
        {LOGO_SPOTS.map((spot) => (
          <div
            key={spot.c}
            className="absolute flex items-center justify-center"
            style={{
              top: `${spot.top}%`,
              right: `${spot.right}%`,
              bottom: `${spot.bottom}%`,
              transform: spot.scale ? `scale(${spot.scale})` : undefined,
            }}
          >
            <CasinoLogo
              slug={spot.c}
              name={spot.c}
              size={45}
              className="h-full w-auto object-contain"
            />
          </div>
        ))}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex gap-3">
            {STEPS.map((step) => (
              <StepCard
                key={step.n}
                n={step.n}
                title={step.title}
                sub={step.sub}
                width={step.w}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
