"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type TabSizeMetrics = {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  iconSize: number;
  radius: number;
  containerRadius: number;
};

const SIZE_PRESETS: Record<"sm" | "md" | "lg", TabSizeMetrics> = {
  sm: {
    fontSize: 12,
    paddingX: 12,
    paddingY: 6,
    gap: 6,
    iconSize: 16,
    radius: 22,
    containerRadius: 50,
  },
  md: {
    fontSize: 16,
    paddingX: 12,
    paddingY: 12,
    gap: 6,
    iconSize: 20,
    radius: 22,
    containerRadius: 50,
  },
  lg: {
    fontSize: 16,
    paddingX: 16,
    paddingY: 12,
    gap: 8,
    iconSize: 24,
    radius: 28,
    containerRadius: 50,
  },
};

export type TabItem = {
  id: string;
  label?: string;
  disabled?: boolean;
  width?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  hrefFor?: (id: string) => string | undefined;
  variant?: "gradient" | "blur";
  theme?: "auto" | "light" | "dark";
  size?: keyof typeof SIZE_PRESETS;
  sizeConfig?: Partial<TabSizeMetrics>;
  fill?: boolean;
  liquid?: boolean;
  durationMs?: number;
  className?: string;
};

type IndicatorBox = { x: number; y: number; w: number; h: number };

/** Port of reference `Tabs` (liquid indicator + auto theme). */
export function Tabs({
  tabs,
  activeId,
  onChange,
  hrefFor,
  variant = "gradient",
  theme = "dark",
  size = "sm",
  sizeConfig,
  fill = false,
  liquid = true,
  durationMs = 420,
  className = "",
}: TabsProps) {
  const metrics = { ...SIZE_PRESETS[size], ...sizeConfig };
  const listRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [box, setBox] = useState<IndicatorBox | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeId];
      if (!el) return;
      setBox({
        x: el.offsetLeft,
        y: el.offsetTop,
        w: el.offsetWidth,
        h: el.offsetHeight,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [
    activeId,
    tabs,
    fill,
    metrics.paddingX,
    metrics.paddingY,
    metrics.fontSize,
    metrics.gap,
    metrics.iconSize,
  ]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!Array.isArray(tabs) || tabs.length === 0) return null;

  const itemStyle: CSSProperties = {
    paddingInline: `${metrics.paddingX}px`,
    paddingBlock: `${metrics.paddingY}px`,
    gap: `${metrics.gap}px`,
    fontSize: `${metrics.fontSize}px`,
    borderRadius: `${metrics.radius}px`,
    ["--nd-tab-icon" as string]: `${metrics.iconSize}px`,
  };

  const shellClass =
    theme === "dark"
      ? "nd-gradient-border "
      : theme === "auto"
        ? "nd-ring-dark-only "
        : "";

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`${shellClass}relative isolate inline-flex items-center gap-1 bg-white/[0.01] p-[4px] ${className}`}
      style={{ borderRadius: `${metrics.containerRadius}px` }}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${
          theme === "dark"
            ? "backdrop-blur-[35.5px]"
            : theme === "auto"
              ? "md:backdrop-blur-[35.5px] dark:backdrop-blur-[35.5px]"
              : "md:backdrop-blur-[35.5px]"
        }`}
        style={{ borderRadius: "inherit", zIndex: -1 }}
      />
      {theme === "light" || theme === "auto" ? (
        <span
          aria-hidden
          className={theme === "auto" ? "contents dark:hidden" : "contents"}
        >
          <span
            className="pointer-events-none absolute inset-0 md:hidden"
            style={{
              borderRadius: `${metrics.containerRadius}px`,
              zIndex: -2,
              background: "rgba(106,89,201,0.06)",
            }}
          />
          <span
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              borderRadius: `${metrics.containerRadius}px`,
              zIndex: -2,
              background:
                "linear-gradient(90deg, rgba(133,111,252,0.02) 0%, rgba(106,89,201,0.20) 50%, rgba(133,111,252,0.02) 100%)",
            }}
          />
        </span>
      ) : null}
      {box ? (
        <span
          aria-hidden
          className="nd-tab-indicator pointer-events-none absolute left-0 top-0"
          style={{
            transform: `translate(${box.x}px, ${box.y}px)`,
            width: box.w,
            height: box.h,
            transition: ready
              ? `transform ${durationMs}ms cubic-bezier(0.4,0,0.2,1), width ${durationMs}ms cubic-bezier(0.4,0,0.2,1)`
              : "none",
          }}
        >
          <span
            key={liquid ? activeId : undefined}
            className={`relative block h-full w-full overflow-hidden ${
              theme === "dark"
                ? "nd-gradient-border"
                : theme === "auto"
                  ? "nd-ring-dark-only border-[0.5px] border-solid border-white/20 dark:border-0"
                  : "border-[0.5px] border-solid border-white/20"
            } ${liquid ? "nd-tab-liquid" : ""} ${
              variant === "gradient" && theme === "dark"
                ? "bg-gradient-to-l from-[#2a274e] via-[#454181] to-[#2a274e]"
                : variant === "gradient" && theme === "auto"
                  ? "bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e]"
                  : ""
            }`}
            style={{
              borderRadius: `${metrics.radius}px`,
              ...(variant === "gradient" && theme === "light"
                ? {
                    backgroundImage:
                      "linear-gradient(270deg, #573bd7 0%, #8065ec 24.522%, #9a80f9 50%, #775ce7 75.485%, #573bd7 100%)",
                  }
                : {}),
            }}
          >
            {variant === "blur" ? (
              <span className="absolute inset-[6px] rounded-full bg-[#9a80f9] blur-[8px]" />
            ) : null}
          </span>
        </span>
      ) : null}
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const href = tab.disabled ? undefined : hrefFor?.(tab.id);
        const style = tab.width
          ? { ...itemStyle, width: `${tab.width}px` }
          : itemStyle;
        const classNameTab = `relative z-10 inline-flex items-center justify-center whitespace-nowrap font-normal transition-colors duration-300 ease-out ${
          fill ? "flex-1" : ""
        } ${
          tab.disabled
            ? theme === "dark"
              ? "nd-gradient-border nd-tab-item cursor-not-allowed text-white/25"
              : theme === "auto"
                ? "nd-ring-dark-only nd-tab-item cursor-not-allowed text-[#2a274e]/25 dark:text-white/25"
                : "cursor-not-allowed text-[#2a274e]/25"
            : active
              ? "text-white"
              : theme === "dark"
                ? "nd-gradient-border nd-tab-item text-white/50 hover:bg-white/[0.01] hover:text-white"
                : theme === "auto"
                  ? "nd-ring-dark-only nd-tab-item text-[#2a274e]/50 hover:text-[#2a274e] dark:text-white/50 dark:hover:bg-white/[0.01] dark:hover:text-white"
                  : "text-[#2a274e]/50 hover:text-[#2a274e]"
        }`;
        const content = (
          <>
            {tab.leftIcon != null ? (
              <span className="inline-flex shrink-0 [&_svg]:size-[var(--nd-tab-icon)]">
                {tab.leftIcon}
              </span>
            ) : null}
            {tab.label}
            {tab.rightIcon != null ? (
              <span className="inline-flex shrink-0 [&_svg]:size-[var(--nd-tab-icon)]">
                {tab.rightIcon}
              </span>
            ) : null}
          </>
        );

        if (href) {
          return (
            <Link
              key={tab.id}
              href={href}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              aria-selected={active}
              onClick={(event) => {
                event.preventDefault();
                onChange(tab.id);
              }}
              style={style}
              className={classNameTab}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) onChange(tab.id);
            }}
            style={style}
            className={classNameTab}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
