"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { SUPPORTED_CODE_CASINOS } from "@/lib/livecodes/data";

/** Auto-scrolling supported casinos marquee. */
export function SupportedCasinos() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const segmentRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = [
    ...SUPPORTED_CODE_CASINOS,
    ...SUPPORTED_CODE_CASINOS,
    ...SUPPORTED_CODE_CASINOS,
  ];

  const syncLoop = useCallback(() => {
    const el = scrollerRef.current;
    const segment = segmentRef.current;
    if (!el || !segment) return;
    if (el.scrollLeft >= 2 * segment) {
      el.scrollLeft -= segment;
      offsetRef.current -= segment;
    } else if (el.scrollLeft < segment) {
      el.scrollLeft += segment;
      offsetRef.current += segment;
    }
  }, []);

  const start = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || frameRef.current) return;
    let last = 0;
    const tick = (now: number) => {
      if (!pausedRef.current) {
        if (last) {
          const delta = Math.min(now - last, 50);
          offsetRef.current += (delta / 16.667) * 0.4;
        }
        last = now;
        el.scrollLeft = offsetRef.current;
        syncLoop();
      } else {
        last = 0;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [syncLoop]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    segmentRef.current = el.scrollWidth / 3;
    el.scrollLeft = segmentRef.current;
    offsetRef.current = el.scrollLeft;
  }, []);

  useEffect(() => {
    start();
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        if (scrollerRef.current) {
          offsetRef.current = scrollerRef.current.scrollLeft;
        }
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [start, stop]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let wheelTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (pausedRef.current) syncLoop();
    };
    const pauseBriefly = () => {
      pausedRef.current = true;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (scrollerRef.current) {
          offsetRef.current = scrollerRef.current.scrollLeft;
        }
        pausedRef.current = false;
      }, 3000);
    };
    const onTouchStart = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const onTouchEnd = () => {
      resumeTimerRef.current = setTimeout(() => {
        if (scrollerRef.current) {
          offsetRef.current = scrollerRef.current.scrollLeft;
        }
        pausedRef.current = false;
      }, 3000);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", pauseBriefly, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", pauseBriefly);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [syncLoop]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
        Supported Casinos
      </h2>
      <div className="relative">
        <div ref={scrollerRef} className="scrollbar-hide overflow-x-auto">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {items.map((casino, index) => (
              <Link
                key={`${casino.slug}-${index}`}
                href={`/${casino.slug}`}
                className="group flex shrink-0 flex-col items-center gap-2"
              >
                <div className="relative h-[80px] w-[247px] overflow-hidden rounded-[12px]">
                  <Image
                    src={casino.banner}
                    alt={casino.name}
                    fill
                    sizes="247px"
                    unoptimized={casino.banner.endsWith(".svg")}
                    className="pointer-events-none object-cover"
                  />
                </div>
                <span className="text-[13px] font-medium text-[rgba(42,39,78,0.55)] transition-colors group-hover:text-[#2a274e] dark:text-[#97A1AF] dark:group-hover:text-white">
                  {casino.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[45px] bg-gradient-to-r from-[#f4f4f4] to-transparent dark:from-[#0b0e1a]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[45px] bg-gradient-to-l from-[#f4f4f4] to-transparent dark:from-[#0b0e1a]" />
      </div>
    </section>
  );
}
