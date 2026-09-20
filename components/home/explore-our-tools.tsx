"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type TransitionEvent,
} from "react";
import { CarouselNav } from "@/components/ui/carousel-nav";
import { ClickNav } from "@/components/ui/click-nav";
import { HOME_TOOLS, type HomeTool } from "@/lib/home/data";

type ToolCardProps = {
  tool: HomeTool;
  isActive: boolean;
  animate: boolean;
};

function ToolCard({ tool, isActive, animate }: ToolCardProps) {
  const media = (
    <div
      className={`relative aspect-[542/300] w-full overflow-hidden rounded-2xl ${
        animate ? "transition-[opacity] duration-500" : ""
      }`}
      style={{ opacity: isActive ? 1 : 0.4 }}
    >
      <Image
        src={tool.image}
        alt={tool.title}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <div
      className={`${animate ? "transition-transform duration-500 ease-out" : ""} ${
        isActive ? "scale-[1.03]" : "scale-[0.96]"
      }`}
    >
      {isActive ? (
        tool.jsNav ? (
          <span className="block" onClick={(event) => event.stopPropagation()}>
            <ClickNav href={tool.href} className="block">
              {media}
            </ClickNav>
          </span>
        ) : (
          <Link
            href={tool.href}
            className="block"
            onClick={(event) => event.stopPropagation()}
          >
            {media}
          </Link>
        )
      ) : (
        media
      )}
    </div>
  );
}

type LayoutMetrics = {
  step: number;
  offset: number;
  cardWidth: number;
};

/** `D` — Explore Our Tools infinite carousel. */
export function ExploreOurTools({
  tools = HOME_TOOLS,
}: {
  tools?: HomeTool[];
}) {
  const catalog = Array.isArray(tools) && tools.length > 0 ? tools : HOME_TOOLS;
  const count = catalog.length;
  const track = useMemo(
    () => Array.from({ length: 5 }, () => catalog).flat(),
    [catalog],
  );

  const [index, setIndex] = useState(2 * count + 2);
  const [animate, setAnimate] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const [layout, setLayout] = useState<LayoutMetrics>({
    step: 0,
    offset: 0,
    cardWidth: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const padding = desktop ? 48 : 16;
      const gap = desktop ? 20 : 16;
      const available = viewport.clientWidth - 2 * padding;
      const cardWidth = desktop ? (available - 2 * gap) / 3 : available;
      const step = cardWidth + gap;
      const offset = desktop ? step : 0;
      setLayout({ step, offset, cardWidth });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const onTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const mid = 2 * count;
      if (index < mid || index >= 3 * count) {
        setAnimate(false);
        setIndex(mid + (((index % count) + count) % count));
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }
    },
    [count, index],
  );

  const goPrev = useCallback(() => setIndex((value) => value - 1), []);
  const goNext = useCallback(() => setIndex((value) => value + 1), []);

  const onPointerDown = useCallback((clientX: number) => {
    dragStartX.current = clientX;
    dragging.current = true;
    didDrag.current = false;
  }, []);

  const onPointerMove = useCallback((clientX: number) => {
    if (!dragging.current) return;
    if (Math.abs(clientX - dragStartX.current) > 10) {
      didDrag.current = true;
    }
  }, []);

  const onPointerUp = useCallback(
    (clientX: number) => {
      if (!dragging.current) return;
      dragging.current = false;
      const delta = dragStartX.current - clientX;
      if (Math.abs(delta) > 50) {
        if (delta > 0) goNext();
        else goPrev();
      }
    },
    [goNext, goPrev],
  );

  const onTouchStart = useCallback(
    (event: ReactTouchEvent) => onPointerDown(event.touches[0].clientX),
    [onPointerDown],
  );
  const onTouchMove = useCallback(
    (event: ReactTouchEvent) => onPointerMove(event.touches[0].clientX),
    [onPointerMove],
  );
  const onTouchEnd = useCallback(
    (event: ReactTouchEvent) =>
      onPointerUp(event.changedTouches[0].clientX),
    [onPointerUp],
  );

  const onMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      event.preventDefault();
      onPointerDown(event.clientX);
    },
    [onPointerDown],
  );
  const onMouseMove = useCallback(
    (event: ReactMouseEvent) => onPointerMove(event.clientX),
    [onPointerMove],
  );
  const onMouseUp = useCallback(
    (event: ReactMouseEvent) => onPointerUp(event.clientX),
    [onPointerUp],
  );
  const onMouseLeave = useCallback(
    (event: ReactMouseEvent) => {
      if (dragging.current) onPointerUp(event.clientX);
    },
    [onPointerUp],
  );

  const translateX = layout.step > 0 ? -index * layout.step + layout.offset : 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          Explore Our Tools
        </h2>
        <CarouselNav onPrev={goPrev} onNext={goNext} theme="auto" />
      </div>
      <div
        ref={viewportRef}
        className="cursor-grab select-none overflow-hidden px-4 py-4 active:cursor-grabbing md:px-12"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`flex gap-4 md:gap-5 ${
            animate ? "transition-transform duration-500 ease-out" : ""
          }`}
          style={{
            transform: `translateX(${translateX}px)`,
            willChange: "transform",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {track.map((tool, trackIndex) => (
            <div
              key={`${tool.id}-${trackIndex}`}
              className="shrink-0"
              style={{
                width: layout.cardWidth > 0 ? `${layout.cardWidth}px` : "100%",
              }}
              onClick={() => {
                if (!didDrag.current) setIndex(trackIndex);
              }}
            >
              <ToolCard
                tool={tool}
                isActive={trackIndex === index}
                animate={animate}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
