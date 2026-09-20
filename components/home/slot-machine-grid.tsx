"use client";

import { useCallback, useEffect, useRef } from "react";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";

const COLUMN_COUNT = 7;
const PATTERN_LENGTH = 9;
const CELLS_PER_COLUMN = 20;
const CELL_STRIDE = 78; // 60px tile + 18px gap
const LOOP_HEIGHT = 702; // PATTERN_LENGTH * CELL_STRIDE
const SPIN_MS = 6000;
const SPIN_SETTLE_MS = 6050;

const PRIMARY_SLUGS = [
  "stake",
  "roobet",
  "rainbet",
  "shuffle",
  "bcgame",
  "winna",
  "gamdom",
  "duel",
  "thrill",
] as const;

const EXTRA_SLUGS = [
  "duelbits",
  "500casino",
  "rollbit",
  "goated",
  "betfury",
  "yeet",
  "razed",
  "metawin",
  "whaleio",
  "chipsgg",
  "gamba",
  "solcasino",
  "stakeus",
  "shuffleus",
  "blockbet",
  "cloudbet",
  "coincasino",
] as const;

const primaryLogos = PRIMARY_SLUGS.map((slug) =>
  getCasinoLogoUrl(slug, "light"),
).filter((url): url is string => url !== null);

const logoPool = [
  ...primaryLogos,
  ...primaryLogos,
  ...EXTRA_SLUGS.map((slug) => getCasinoLogoUrl(slug, "light")).filter(
    (url): url is string => url !== null,
  ),
];

const logoSizeOverrides: Record<string, { size: number }> = {
  [getCasinoLogoUrl("winna", "light") ?? ""]: { size: 34 },
  [getCasinoLogoUrl("coincasino", "light") ?? ""]: { size: 40 },
  [getCasinoLogoUrl("stakeus", "light") ?? ""]: { size: 40 },
};

/** Deterministic mulberry32 PRNG (seed matches reference SlotMachineGrid). */
function createMulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function buildColumnPatterns(): Array<Array<string | null>> {
  const random = createMulberry32(6240801);
  const columns: Array<Array<string | null>> = Array.from(
    { length: COLUMN_COUNT },
    () => [],
  );

  for (let row = 0; row < PATTERN_LENGTH; row++) {
    const rowLogos: Array<string | null> = [];
    for (let col = 0; col < COLUMN_COUNT; col++) {
      if (random() < 0.8) {
        const blocked = new Set<string>();
        const left = rowLogos[col - 1];
        if (left) blocked.add(left);
        const above = columns[col][row - 1];
        if (above) blocked.add(above);
        const candidates = logoPool.filter((url) => !blocked.has(url));
        const pick = candidates[Math.floor(random() * candidates.length)] ?? null;
        columns[col].push(pick);
        rowLogos.push(pick);
      } else {
        columns[col].push(null);
        rowLogos.push(null);
      }
    }
  }

  // Avoid identical first/last tiles in a column (seamless loop).
  for (let col = 0; col < COLUMN_COUNT; col++) {
    const first = columns[col][0];
    if (first && first === columns[col][PATTERN_LENGTH - 1]) {
      const blocked = new Set(
        [columns[col][PATTERN_LENGTH - 1], columns[col][1], columns[col - 1]?.[0]].filter(
          (url): url is string => Boolean(url),
        ),
      );
      const candidates = logoPool.filter((url) => !blocked.has(url));
      columns[col][0] =
        candidates[Math.floor(random() * candidates.length)] ?? first;
    }
  }

  return columns;
}

const COLUMN_PATTERNS = buildColumnPatterns();

const MASK_IMAGE =
  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.7) 15%, black 25%, black 75%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.3) 92%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 8%, rgba(0,0,0,0.75) 18%, black 30%, black 85%, transparent 100%)";

export type SlotMachineGridProps = {
  variant?: "light" | "glass";
  theme?: "auto" | "light" | "dark";
};

export function SlotMachineGrid({
  variant = "light",
  theme = "dark",
}: SlotMachineGridProps = {}) {
  const isGlass = variant === "glass";
  const isAutoTheme = theme === "auto";
  const isGlassLight = isGlass && theme === "light";

  const offsetsRef = useRef(Array(COLUMN_COUNT).fill(0));
  const columnElsRef = useRef<Array<HTMLDivElement | null>>([]);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef = useRef(new Set<number>());
  const rootRef = useRef<HTMLDivElement | null>(null);

  const pickColumns = useCallback(() => {
    const count = Math.random() > 0.5 ? 3 : 2;
    const chosen: number[] = [];
    const order = Array.from({ length: COLUMN_COUNT }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const col of order) {
      if (chosen.length >= count) break;
      if (spinningRef.current.has(col)) continue;
      if (chosen.some((picked) => Math.abs(picked - col) === 1)) continue;
      chosen.push(col);
    }
    if (chosen.length < 2) {
      for (const col of order) {
        if (chosen.length >= 2) break;
        if (chosen.includes(col) || spinningRef.current.has(col)) continue;
        chosen.push(col);
      }
    }
    return chosen;
  }, []);

  const spinColumn = useCallback((col: number, steps: number) => {
    const el = columnElsRef.current[col];
    if (!el || spinningRef.current.has(col)) return;
    spinningRef.current.add(col);
    const next = offsetsRef.current[col] + CELL_STRIDE * steps;
    offsetsRef.current[col] = next;
    el.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.25, 0.1, 0.15, 1)`;
    el.style.transform = `translate3d(0, -${next}px, 0)`;
    setTimeout(() => {
      if (offsetsRef.current[col] >= LOOP_HEIGHT) {
        requestAnimationFrame(() => {
          el.style.transition = "none";
          const wrapped = offsetsRef.current[col] % LOOP_HEIGHT;
          offsetsRef.current[col] = wrapped;
          el.style.transform = `translate3d(0, -${wrapped}px, 0)`;
          requestAnimationFrame(() => {
            spinningRef.current.delete(col);
          });
        });
      } else {
        spinningRef.current.delete(col);
      }
    }, SPIN_SETTLE_MS);
  }, []);

  const runCycle = useCallback(() => {
    const columns = pickColumns();
    if (columns.length === 0) {
      scheduleRef.current = setTimeout(runCycle, 300);
      return;
    }
    columns.forEach((col) => {
      spinColumn(col, Math.floor(3 * Math.random()) + 3);
    });
    scheduleRef.current = setTimeout(
      runCycle,
      SPIN_MS + (Math.floor(500 * Math.random()) + 300),
    );
  }, [pickColumns, spinColumn]);

  useEffect(() => {
    const root = rootRef.current;
    let inView = true;
    let pageVisible = !document.hidden;
    let isFirstSchedule = true;

    const clearSchedule = () => {
      if (scheduleRef.current) {
        clearTimeout(scheduleRef.current);
        scheduleRef.current = null;
      }
      spinningRef.current.clear();
    };

    const maybeStart = () => {
      if (inView && pageVisible) {
        if (scheduleRef.current) return;
        const delay = isFirstSchedule ? 2000 : 500;
        isFirstSchedule = false;
        scheduleRef.current = setTimeout(runCycle, delay);
      } else {
        clearSchedule();
      }
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      maybeStart();
    };

    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | null = null;
    if (root && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[0]?.isIntersecting ?? false;
          maybeStart();
        },
        { rootMargin: "200px" },
      );
      observer.observe(root);
    }

    maybeStart();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
      clearSchedule();
    };
  }, [runCycle]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="absolute right-0 top-1/2 opacity-[0.4] sm:right-[-20px] md:right-[34px] md:opacity-100"
      style={{
        transform: `translateY(-${147}px)`,
        overflow: "hidden",
        height: "294px",
        contentVisibility: "auto",
        containIntrinsicSize: "528px 294px",
        maskImage: MASK_IMAGE,
        WebkitMaskImage: MASK_IMAGE,
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
      }}
    >
      <div className="flex" style={{ gap: "18px" }}>
        {Array.from({ length: COLUMN_COUNT }, (_, col) => (
          <div
            key={col}
            ref={(el) => {
              columnElsRef.current[col] = el;
            }}
            className={`${col < 4 ? "hidden md:flex" : "flex"} flex-col`}
            style={{
              gap: "18px",
              transform: "translate3d(0, 0, 0)",
              willChange: "transform",
            }}
          >
            {Array.from({ length: CELLS_PER_COLUMN }, (_, cell) => {
              const logo = COLUMN_PATTERNS[col][cell % PATTERN_LENGTH];
              const size = (logo ? logoSizeOverrides[logo]?.size : undefined) ?? 52;
              const themedSrc =
                isGlass && !isGlassLight && logo
                  ? logo.replace("/casinos/light/", "/casinos/dark/")
                  : logo;

              return (
                <div
                  key={`${col}-${cell}`}
                  className={`flex shrink-0 items-center justify-center rounded-[16px]${
                    isGlass && isAutoTheme
                      ? " shadow-[1px_1px_1px_0_rgba(255,255,255,0.9)_inset,-1px_-1px_3px_0_rgba(255,255,255,0.9)_inset] dark:shadow-[3px_3px_4px_0_rgba(255,255,255,0.2)_inset,-3px_-3px_4px_0_rgba(255,255,255,0.2)_inset]"
                      : ""
                  }`}
                  style={
                    isGlass
                      ? {
                          width: "60px",
                          height: "60px",
                          background: "rgba(0, 0, 0, 0.01)",
                          ...(isAutoTheme
                            ? {}
                            : {
                                boxShadow: isGlassLight
                                  ? "1px 1px 1px 0 rgba(255, 255, 255, 0.9) inset, -1px -1px 3px 0 rgba(255, 255, 255, 0.9) inset"
                                  : "3px 3px 4px 0 rgba(255, 255, 255, 0.2) inset, -3px -3px 4px 0 rgba(255, 255, 255, 0.2) inset",
                              }),
                        }
                      : logo
                        ? {
                            width: "60px",
                            height: "60px",
                            background:
                              "linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.88) 100%)",
                            border: "1px solid #FFF",
                            boxShadow:
                              "3px 3px 10px 0 rgba(88, 71, 206, 0.06), -3px -3px 4px 0 rgba(255, 255, 255, 0.40) inset",
                          }
                        : {
                            width: "60px",
                            height: "60px",
                            background:
                              "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.35) 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                          }
                  }
                >
                  {isGlass && isAutoTheme && logo ? (
                    <>
                      <img
                        src={logo}
                        alt=""
                        width={size}
                        height={size}
                        className="dark:hidden"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          objectFit: "contain",
                        }}
                      />
                      <img
                        src={logo.replace("/casinos/light/", "/casinos/dark/")}
                        alt=""
                        width={size}
                        height={size}
                        className="hidden dark:block"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          objectFit: "contain",
                        }}
                      />
                    </>
                  ) : themedSrc ? (
                    <img
                      src={themedSrc}
                      alt=""
                      width={size}
                      height={size}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        objectFit: "contain",
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
