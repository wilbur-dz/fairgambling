"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { Button } from "@/components/ui/button";
import { TOP_TIER_CARDS } from "@/lib/affiliate/data";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

const ARC_SLUGS = TOP_TIER_CARDS.map((c) => c.slug);
const LINKS = Array.from({ length: 11 }, () => ARC_SLUGS).flat();

const DESKTOP_GEO = {
  centerX: 544,
  centerY: -1263.5,
  radius: 1367.4,
  chip: 48,
  iconSize: 26,
  visibleDeg: 24,
  fadeDeg: 7,
};

function chipPose(angle: number, geo: typeof DESKTOP_GEO) {
  const a =
    ((((angle + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
    Math.PI;
  const x = geo.centerX + geo.radius * Math.sin(a) - geo.chip / 2;
  const y = geo.centerY + geo.radius * Math.cos(a) - geo.chip / 2;
  const visible = (geo.visibleDeg * Math.PI) / 180;
  const fade = (geo.fadeDeg * Math.PI) / 180;
  const abs = Math.abs(a);
  return {
    x,
    y,
    opacity: abs < visible ? Math.min(1, (visible - abs) / fade) : 0,
  };
}

function OrbitChipImage({ slug, size }: { slug: string; size: number }) {
  const pair = getCasinoLogoPair(slug);
  if (!pair) {
    return (
      <span className="text-[10px] font-bold text-[#2a274e]/50 dark:text-white/50">
        {slug[0]?.toUpperCase()}
      </span>
    );
  }
  return (
    <>
      <Image
        src={pair.light}
        alt=""
        width={size}
        height={size}
        className="object-contain opacity-80 dark:hidden"
      />
      <Image
        src={pair.dark}
        alt=""
        width={size}
        height={size}
        className="hidden object-contain opacity-80 dark:block"
      />
    </>
  );
}

function OrbitingLogos({
  links,
  geo,
}: {
  links: string[];
  geo: typeof DESKTOP_GEO;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const n = links.length;
  const step = (2 * Math.PI) / n;

  useEffect(() => {
    let angle = 0;
    let raf = 0;
    let animating = false;
    let from = 0;
    let to = 0;
    let started = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;
    let visible = !document.hidden;

    const paint = () => {
      for (let i = 0; i < n; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const { x, y, opacity } = chipPose(i * step + angle, geo);
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.opacity = String(opacity);
        el.style.visibility = opacity <= 0 ? "hidden" : "visible";
      }
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 3600);
      const eased =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      angle = from + (to - from) * eased;
      paint();
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        animating = false;
        schedule();
      }
    };

    const kick = () => {
      if (animating || !alive || !visible) return;
      const hops = 4 + Math.floor(7 * Math.random());
      from = angle;
      to = angle + hops * step;
      started = performance.now();
      animating = true;
      raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(kick, 1000 + 2000 * Math.random());
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      raf = 0;
      timer = null;
      animating = false;
    };

    paint();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    schedule();
    const onVis = () => {
      visible = !document.hidden;
      if (visible && alive) schedule();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [geo, n, step]);

  const chipClass =
    "border border-[rgba(42,39,78,0.12)] bg-white/80 shadow-sm dark:border-white/15 dark:bg-[#171b2c]";

  return (
    <>
      {links.map((slug, i) => (
        <div
          key={`${slug}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-hidden
          className={`absolute left-0 top-0 flex items-center justify-center rounded-[12px] ${chipClass}`}
          style={{ width: geo.chip, height: geo.chip }}
        >
          <OrbitChipImage slug={slug} size={geo.iconSize} />
        </div>
      ))}
    </>
  );
}

function HeroCopy() {
  const text = "text-[#2a274e] dark:text-white";
  return (
    <>
      <p
        role="heading"
        aria-level={1}
        className={`text-[22px] font-bold leading-[28px] sm:text-[28px] sm:leading-[34px] md:text-[32px] md:leading-[40px] ${text}`}
      >
        Why Play Through FairGambling?
      </p>
      <p
        className={`mt-3 text-sm font-normal sm:mt-4 sm:text-base ${text}`}
      >
        Wager share, code drops, leaderboard prizes, and more.
      </p>
    </>
  );
}

function HeroCta() {
  const { openRegisterModal } = useAuthModal();
  return (
    <Button
      theme="auto"
      variant="primary"
      size="md"
      onClick={openRegisterModal}
    >
      Get Started
    </Button>
  );
}

/** Port of reference `Hero`. */
export function AffiliateHero() {
  const chipClass =
    "border border-[rgba(42,39,78,0.12)] bg-white/80 shadow-sm dark:border-white/15 dark:bg-[#171b2c]";

  return (
    <section className="relative h-[268px] w-full overflow-hidden rounded-[24px] border border-[#e4e4e7] bg-[#e4e4e7]/30 md:h-[368px] dark:border-[0.5px] dark:border-white/20 dark:bg-[#0f1424]">
      <div className="hidden md:block">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: 1088, height: 312 }}
        >
          <div
            aria-hidden
            className="absolute bg-[linear-gradient(180deg,rgba(209,213,219,0.8),rgba(107,114,128,0.6))] blur-[90px] dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5),rgba(52,0,107,0.5))]"
            style={{ left: 329, top: -116, width: 450, height: 151 }}
          />
          <OrbitingLogos links={LINKS} geo={DESKTOP_GEO} />
          <div
            aria-hidden
            className="absolute inset-0 [background:radial-gradient(43.17%_93.11%_at_50%_6.89%,rgba(240,240,242,0)_31.14%,#eeeef0_100%)] dark:[background:radial-gradient(43.17%_93.11%_at_50%_6.89%,rgba(15,20,36,0)_31.14%,#0F1424_100%)]"
          />
          <div
            className={`absolute left-1/2 z-[3] flex items-center justify-center rounded-[12px] ${chipClass}`}
            style={{
              top: 150,
              width: 203,
              height: 48,
              marginLeft: -101.5,
            }}
          >
            <span className="text-center text-base font-normal text-[#2a274e] dark:text-white">
              Affiliate Benefits
            </span>
          </div>
        </div>
        <div
          className="absolute inset-x-0 flex flex-col items-center px-4 text-center"
          style={{ top: 212 }}
        >
          <HeroCopy />
          <div className="mt-5">
            <HeroCta />
          </div>
        </div>
      </div>

      <div className="relative h-full overflow-hidden md:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[130px] w-[320px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(209,213,219,0.8),rgba(107,114,128,0.4))] blur-[80px] dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5),rgba(52,0,107,0.3))]"
        />
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: 360, height: 220 }}
        >
          {TOP_TIER_CARDS.slice(0, 7).map(({ slug }, i, arr) => {
            const a =
              ((20 * Math.PI) / 180) *
              (arr.length > 1 ? (i / (arr.length - 1)) * 2 - 1 : 0);
            const x = 180 + 452 * Math.sin(a) - 18;
            const y = -397 + 452 * Math.cos(a) - 18;
            return (
              <div
                key={slug}
                aria-hidden
                className={`absolute left-0 top-0 flex items-center justify-center rounded-[12px] ${chipClass}`}
                style={{
                  width: 36,
                  height: 36,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                <OrbitChipImage slug={slug} size={20} />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center px-4 text-center">
          <HeroCopy />
          <div className="mt-4">
            <HeroCta />
          </div>
        </div>
      </div>
    </section>
  );
}
