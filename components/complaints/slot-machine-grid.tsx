"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { getCasinoLogoUrl } from "@/lib/casinos/logos";

const COLUMN_COUNT = 7;
const PATTERN_ROWS = 9;
const REEL_TILES = 20;
const TILE_STEP_PX = 78;
const REEL_WRAP_PX = 702;
const ANIM_MS = 6000;

const MASK_STYLE: CSSProperties = {
  maskImage:
    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.7) 15%, black 25%, black 75%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.3) 92%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 8%, rgba(0,0,0,0.75) 18%, black 30%, black 85%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.7) 15%, black 25%, black 75%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.3) 92%, transparent 100%), linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 8%, rgba(0,0,0,0.75) 18%, black 30%, black 85%, transparent 100%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "destination-in",
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLogoPool(): string[] {
  const primary = [
    "stake",
    "roobet",
    "rainbet",
    "shuffle",
    "bcgame",
    "winna",
    "gamdom",
    "duel",
    "thrill",
  ]
    .map((slug) => getCasinoLogoUrl(slug, "light"))
    .filter((url): url is string => url != null);

  const extended = [
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
  ]
    .map((slug) => getCasinoLogoUrl(slug, "light"))
    .filter((url): url is string => url != null);

  return [...primary, ...primary, ...extended];
}

function buildColumnPatterns(pool: string[]): (string | null)[][] {
  const rand = mulberry32(6240801);
  const columns: (string | null)[][] = Array.from({ length: COLUMN_COUNT }, () => []);

  for (let row = 0; row < PATTERN_ROWS; row++) {
    const rowLogos: (string | null)[] = [];
    for (let col = 0; col < COLUMN_COUNT; col++) {
      if (rand() > 0.8) {
        columns[col].push(null);
        rowLogos.push(null);
        continue;
      }
      const blocked = new Set<string>();
      const left = rowLogos[col - 1];
      if (left) blocked.add(left);
      const above = columns[col][row - 1];
      if (above) blocked.add(above);
      const choices = pool.filter((url) => !blocked.has(url));
      const pick = choices[Math.floor(rand() * choices.length)] ?? null;
      columns[col].push(pick);
      rowLogos.push(pick);
    }
  }

  for (let col = 0; col < COLUMN_COUNT; col++) {
    const top = columns[col][0];
    if (top && top === columns[col][8]) {
      const blocked = new Set(
        [columns[col][8], columns[col][1], columns[col - 1]?.[0]].filter(
          Boolean,
        ) as string[],
      );
      const choices = pool.filter((url) => !blocked.has(url));
      columns[col][0] = choices[Math.floor(rand() * choices.length)] ?? top;
    }
  }

  return columns;
}

const LOGO_POOL = buildLogoPool();
const COLUMN_PATTERNS = buildColumnPatterns(LOGO_POOL);

function buildLogoSizeByUrl(): Record<string, { size: number }> {
  const map: Record<string, { size: number }> = {};
  const winna = getCasinoLogoUrl("winna", "light");
  const coincasino = getCasinoLogoUrl("coincasino", "light");
  const stakeus = getCasinoLogoUrl("stakeus", "light");
  if (winna) map[winna] = { size: 34 };
  if (coincasino) map[coincasino] = { size: 40 };
  if (stakeus) map[stakeus] = { size: 40 };
  return map;
}

const LOGO_SIZE_BY_URL = buildLogoSizeByUrl();

function toDarkLogoUrl(lightUrl: string): string {
  return lightUrl.replace("/logos/casinos/light/", "/logos/casinos/dark/");
}

type SlotMachineGridProps = {
  variant?: "light" | "glass";
  theme?: "auto" | "light" | "dark";
};

/** Port of reference `SlotMachineGrid` (236532). */
export function SlotMachineGrid({
  variant = "light",
  theme = "dark",
}: SlotMachineGridProps) {
  const isGlass = variant === "glass";
  const isAutoTheme = theme === "auto";
  const isGlassLight = isGlass && theme === "light";

  const offsetsRef = useRef<number[]>(Array(COLUMN_COUNT).fill(0));
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spinningRef = useRef(new Set<number>());
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const pickColumns = useCallback(() => {
    const count = Math.random() > 0.5 ? 3 : 2;
    const picked: number[] = [];
    const indices = Array.from({ length: COLUMN_COUNT }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (const index of indices) {
      if (picked.length >= count) break;
      if (spinningRef.current.has(index)) continue;
      if (picked.some((other) => Math.abs(other - index) === 1)) continue;
      picked.push(index);
    }
    if (picked.length < 2) {
      for (const index of indices) {
        if (picked.length >= 2) break;
        if (picked.includes(index) || spinningRef.current.has(index)) continue;
        picked.push(index);
      }
    }
    return picked;
  }, []);

  const spinColumn = useCallback((col: number, spins: number) => {
    const el = columnRefs.current[col];
    if (!el || spinningRef.current.has(col)) return;

    spinningRef.current.add(col);
    const next = offsetsRef.current[col] + TILE_STEP_PX * spins;
    offsetsRef.current[col] = next;
    el.style.transition =
      "transform 6000ms cubic-bezier(0.25, 0.1, 0.15, 1)";
    el.style.transform = `translate3d(0, -${next}px, 0)`;

    window.setTimeout(() => {
      if (offsetsRef.current[col] >= REEL_WRAP_PX) {
        requestAnimationFrame(() => {
          el.style.transition = "none";
          const wrapped = offsetsRef.current[col] % REEL_WRAP_PX;
          offsetsRef.current[col] = wrapped;
          el.style.transform = `translate3d(0, -${wrapped}px, 0)`;
          requestAnimationFrame(() => {
            spinningRef.current.delete(col);
          });
        });
      } else {
        spinningRef.current.delete(col);
      }
    }, ANIM_MS + 50);
  }, []);

  const runLoop = useCallback(() => {
    const cols = pickColumns();
    if (cols.length === 0) {
      loopTimerRef.current = setTimeout(runLoop, 300);
      return;
    }
    for (const col of cols) {
      spinColumn(col, Math.floor(Math.random() * 3) + 3);
    }
    loopTimerRef.current = setTimeout(
      runLoop,
      ANIM_MS + Math.floor(Math.random() * 500) + 300,
    );
  }, [pickColumns, spinColumn]);

  useEffect(() => {
    const root = rootRef.current;
    let visible = true;
    let docVisible = !document.hidden;
    let firstRun = true;

    const stop = () => {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      spinningRef.current.clear();
    };

    const schedule = () => {
      if (visible && docVisible) {
        if (loopTimerRef.current) return;
        const delay = firstRun ? 2000 : 500;
        firstRun = false;
        loopTimerRef.current = setTimeout(runLoop, delay);
      } else {
        stop();
      }
    };

    const onVisibility = () => {
      docVisible = !document.hidden;
      schedule();
    };

    document.addEventListener("visibilitychange", onVisibility);

    let observer: IntersectionObserver | null = null;
    if (root && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? false;
          schedule();
        },
        { rootMargin: "200px" },
      );
      observer.observe(root);
    }

    schedule();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
      stop();
    };
  }, [runLoop]);

  return (
    <div
      ref={rootRef}
      className="absolute right-0 top-1/2 opacity-40 sm:right-[-20px] md:right-[34px] md:opacity-100"
      style={{
        transform: "translateY(-147px)",
        overflow: "hidden",
        height: 294,
        contentVisibility: "auto",
        containIntrinsicSize: "528px 294px",
        ...MASK_STYLE,
      }}
      aria-hidden
    >
      <div className="flex gap-[18px]">
        {Array.from({ length: COLUMN_COUNT }, (_, col) => (
          <div
            key={col}
            ref={(node) => {
              columnRefs.current[col] = node;
            }}
            className={`${col < 4 ? "hidden md:flex" : "flex"} flex-col gap-[18px]`}
            style={{
              transform: "translate3d(0, 0, 0)",
              willChange: "transform",
            }}
          >
            {Array.from({ length: REEL_TILES }, (_, tile) => {
              const logoUrl = COLUMN_PATTERNS[col][tile % PATTERN_ROWS];
              const size = logoUrl
                ? (LOGO_SIZE_BY_URL[logoUrl]?.size ?? 52)
                : 52;

              const glassAutoShadow =
                isGlass && isAutoTheme
                  ? "shadow-[1px_1px_1px_0_rgba(255,255,255,0.9)_inset,-1px_-1px_3px_0_rgba(255,255,255,0.9)_inset] dark:shadow-[3px_3px_4px_0_rgba(255,255,255,0.2)_inset,-3px_-3px_4px_0_rgba(255,255,255,0.2)_inset]"
                  : "";

              let tileStyle: CSSProperties;
              if (isGlass) {
                tileStyle = {
                  width: 60,
                  height: 60,
                  background: "rgba(0, 0, 0, 0.01)",
                  ...(isAutoTheme
                    ? {}
                    : {
                        boxShadow: isGlassLight
                          ? "1px 1px 1px 0 rgba(255, 255, 255, 0.9) inset, -1px -1px 3px 0 rgba(255, 255, 255, 0.9) inset"
                          : "3px 3px 4px 0 rgba(255, 255, 255, 0.2) inset, -3px -3px 4px 0 rgba(255, 255, 255, 0.2) inset",
                      }),
                };
              } else if (logoUrl) {
                tileStyle = {
                  width: 60,
                  height: 60,
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.88) 100%)",
                  border: "1px solid #FFF",
                  boxShadow:
                    "3px 3px 10px 0 rgba(88, 71, 206, 0.06), -3px -3px 4px 0 rgba(255, 255, 255, 0.40) inset",
                };
              } else {
                tileStyle = {
                  width: 60,
                  height: 60,
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.35) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                };
              }

              const imgStyle: CSSProperties = {
                width: size,
                height: size,
                objectFit: "contain",
              };

              return (
                <div
                  key={`${col}-${tile}`}
                  className={`flex size-[60px] shrink-0 items-center justify-center rounded-[16px] ${glassAutoShadow}`}
                  style={tileStyle}
                >
                  {logoUrl && isGlass && isAutoTheme ? (
                    <>
                      <Image
                        src={logoUrl}
                        alt=""
                        width={size}
                        height={size}
                        className="dark:hidden"
                        style={imgStyle}
                        unoptimized
                      />
                      <Image
                        src={toDarkLogoUrl(logoUrl)}
                        alt=""
                        width={size}
                        height={size}
                        className="hidden dark:block"
                        style={imgStyle}
                        unoptimized
                      />
                    </>
                  ) : logoUrl ? (
                    <Image
                      src={
                        isGlass && !isGlassLight
                          ? toDarkLogoUrl(logoUrl)
                          : logoUrl
                      }
                      alt=""
                      width={size}
                      height={size}
                      style={imgStyle}
                      unoptimized
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
