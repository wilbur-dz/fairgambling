"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

type WinMarqueeProps = {
  title: string;
  items: ReactNode[];
};

/** Auto-scrolling horizontal marquee for win feature cards. */
export function WinMarquee({ title, items }: WinMarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const segmentRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

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

  const reducedMotionRef = useRef(false);

  const start = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || frameRef.current || reducedMotionRef.current) return;
    let last = 0;
    const tick = (now: number) => {
      const active = document.activeElement;
      const hoverOrFocus =
        pausedRef.current ||
        el.matches(":hover") ||
        (active != null && active !== document.body && el.contains(active));

      if (hoverOrFocus) {
        last = 0;
      } else {
        if (last) {
          const delta = Math.min(now - last, 50);
          offsetRef.current += (delta / 16.667) * 0.5;
        }
        last = now;
        el.scrollLeft = offsetRef.current;
        syncLoop();
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [syncLoop]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotionRef.current) return;
    segmentRef.current = el.scrollWidth / 3;
    el.scrollLeft = segmentRef.current;
    offsetRef.current = el.scrollLeft;
    const onResize = () => {
      segmentRef.current = el.scrollWidth / 3;
      syncLoop();
      offsetRef.current = el.scrollLeft;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [items.length, syncLoop]);

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

    const scheduleResume = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        if (scrollerRef.current) {
          offsetRef.current = scrollerRef.current.scrollLeft;
        }
        pausedRef.current = false;
      }, 1500);
    };

    const onScroll = () => {
      if (pausedRef.current) syncLoop();
    };
    const onWheel = () => {
      pausedRef.current = true;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (scrollerRef.current) {
          offsetRef.current = scrollerRef.current.scrollLeft;
        }
        pausedRef.current = false;
      }, 1500);
    };
    const onTouchStart = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const onTouchEnd = () => scheduleResume();
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      draggingRef.current = true;
      pausedRef.current = true;
      dragStartX.current = e.clientX;
      dragStartScroll.current = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      el.scrollLeft =
        dragStartScroll.current - (e.clientX - dragStartX.current);
    };
    const onPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      el.style.cursor = "";
      scheduleResume();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [syncLoop]);

  const looped = [...items, ...items, ...items];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
        {title}
      </h2>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={title}
        tabIndex={0}
        className="scrollbar-hide -mx-4 cursor-grab overflow-x-auto px-4 outline-none focus-visible:ring-2 focus-visible:ring-[#8874ff]/40 sm:mx-0 sm:px-0"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
      >
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {looped.map((item, index) => (
            <div
              key={index}
              className="w-[260px] shrink-0 select-none sm:w-[300px]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
