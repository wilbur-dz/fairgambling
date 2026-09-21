"use client";

import {
  forceCenter,
  forceCollide,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { formatMarketValue } from "@/lib/streamers/data";

export type BubbleDatum = {
  id: string;
  label: string;
  value: number;
  share: number;
  color: string;
};

type SimNode = BubbleDatum &
  SimulationNodeDatum & {
    r: number;
    x: number;
    y: number;
  };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function makeRadiusScale(
  values: number[],
  width: number,
  height: number,
  fill?: number,
) {
  const total = values.reduce((s, v) => s + Math.abs(v), 0);
  const max = Math.max(...values.map(Math.abs), 0);
  if (total <= 0 || max <= 0) return () => 26;
  const areaFactor = fill ?? 0.62;
  let scale = Math.sqrt((width * height * areaFactor) / (Math.PI * total));
  const cap = (Math.min(width, height) / 2) * 0.92;
  if (scale * Math.sqrt(max) > cap) scale = cap / Math.sqrt(max);
  return (v: number) => Math.max(26, scale * Math.sqrt(Math.abs(v)));
}

function hslaFromHex(hex: string, alpha: number): string {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(136,116,255,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function defaultValueFormat(value: number): string {
  const t = Math.abs(value);
  const n =
    t >= 1e9
      ? `$${(t / 1e9).toFixed(2)}B`
      : t >= 1e6
        ? `$${(t / 1e6).toFixed(1)}M`
        : t >= 1e3
          ? `$${(t / 1e3).toFixed(1)}K`
          : `$${t.toFixed(0)}`;
  return value < 0 ? `-${n}` : n;
}

type BubbleViewProps = {
  data: BubbleDatum[];
  isLoading?: boolean;
  groupBy: "casino" | "streamer" | string;
  ariaContext?: string;
  renderIcon?: (id: string, label: string, size: number) => ReactNode;
  valueFormat?: (value: number) => string;
  heightClassName?: string;
};

const BubbleNode = memo(function BubbleNode({
  node,
  active,
  onEnter,
  onLeave,
  renderIcon,
}: {
  node: SimNode;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  renderIcon?: BubbleViewProps["renderIcon"];
}) {
  const size = Math.max(node.r, 22);
  const iconSize = Math.min(44, Math.round(2 * node.r - 8));
  return (
    <div
      className="absolute left-0 top-0 flex items-center justify-center"
      style={{
        width: size * 2,
        height: size * 2,
        transform: `translate(${node.x - size}px, ${node.y - size}px)`,
        zIndex: active ? 20 : 10,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className="pointer-events-none flex items-center justify-center rounded-full transition-transform duration-200"
        style={{
          width: node.r * 2,
          height: node.r * 2,
          transform: active ? "scale(1.05)" : "scale(1)",
          background: `radial-gradient(circle at 50% 50%, ${hslaFromHex(node.color, 0)} 0%, ${hslaFromHex(node.color, active ? 0.1 : 0.06)} 48%, ${hslaFromHex(node.color, active ? 0.34 : 0.26)} 100%)`,
          border: `1px solid ${hslaFromHex(node.color, 0.28)}`,
          boxShadow: `inset 0 0 ${Math.round(0.7 * node.r)}px ${hslaFromHex(node.color, active ? 0.7 : 0.55)}`,
        }}
      >
        {renderIcon?.(node.id, node.label, iconSize)}
      </div>
    </div>
  );
});

export function BubbleView({
  data,
  isLoading = false,
  groupBy,
  ariaContext = "market value",
  renderIcon,
  valueFormat = defaultValueFormat,
  heightClassName = "h-[340px] sm:h-[400px]",
}: BubbleViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(
    null,
  );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setSize({
        width: Math.round(el.clientWidth),
        height: Math.round(el.clientHeight),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const { width, height } = size;
    if (!width || !height || data.length === 0) {
      setNodes([]);
      simRef.current?.stop();
      simRef.current = null;
      return;
    }

    const radius = makeRadiusScale(
      data.map((d) => d.value),
      width,
      height,
    );
    const simNodes: SimNode[] = data.map((d, i) => ({
      ...d,
      r: radius(d.value),
      x: width / 2 + Math.cos(i * 2.4) * 40,
      y: height / 2 + Math.sin(i * 2.4) * 40,
    }));

    simRef.current?.stop();
    const sim = forceSimulation(simNodes)
      .force("x", forceX(width / 2).strength(0.04))
      .force("y", forceY(height / 2).strength(0.04))
      .force(
        "collide",
        forceCollide<SimNode>((d: SimNode) => d.r + 4).strength(0.9),
      )
      .force("center", forceCenter(width / 2, height / 2))
      .alphaTarget(0)
      .on("tick", () => {
        for (const n of simNodes) {
          n.x = clamp(n.x ?? width / 2, n.r, width - n.r);
          n.y = clamp(n.y ?? height / 2, n.r, height - n.r);
        }
        setNodes([...simNodes]);
      });

    sim.alpha(0.8).restart();
    simRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [data, size]);

  const ariaSummary = useMemo(
    () =>
      data
        .map((d) => `${d.label}: ${valueFormat(d.value)} (${d.share.toFixed(1)}%)`)
        .join(", "),
    [data, valueFormat],
  );

  const hover = hoverId ? nodes.find((n) => n.id === hoverId) : null;

  return (
    <div
      ref={containerRef}
      role="img"
      aria-busy={isLoading}
      aria-label={`Bubble chart of ${ariaContext}. ${ariaSummary}`}
      className={`relative mb-5 w-full select-none rounded-2xl border border-[#e4e4e7] bg-[#e4e4e7]/30 dark:rounded-none dark:border-0 dark:bg-transparent ${heightClassName}`}
    >
      {isLoading ? (
        <>
          <div className="absolute left-[12%] top-[18%] size-[42%] animate-pulse rounded-full bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.06]" />
          <div className="absolute right-[14%] top-[10%] size-[30%] animate-pulse rounded-full bg-[rgba(42,39,78,0.05)] dark:bg-white/[0.05]" />
        </>
      ) : data.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-[rgba(42,39,78,0.4)] dark:text-white/40">
            No data available
          </p>
        </div>
      ) : (
        <>
          {nodes.map((node) => (
            <BubbleNode
              key={node.id}
              node={node}
              active={hoverId === node.id}
              renderIcon={renderIcon}
              onEnter={() => setHoverId(node.id)}
              onLeave={() => setHoverId((id) => (id === node.id ? null : id))}
            />
          ))}
          {hover ? (
            <div
              className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-[12px] border border-[rgba(42,39,78,0.1)] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(42,39,78,0.15)] dark:border-white/20 dark:bg-[#0f1424]"
              style={{ left: hover.x, top: hover.y - hover.r - 8 }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                {renderIcon?.(hover.id, hover.label, 16)}
                <span className="text-[13px] font-semibold text-[#2a274e] dark:text-white">
                  {hover.label}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-4 whitespace-nowrap text-[12px]">
                <span className="text-[rgba(42,39,78,0.5)] dark:text-white/50">
                  {valueFormat(hover.value)}
                </span>
                <span className="font-medium text-[rgba(42,39,78,0.9)] dark:text-white/90">
                  {hover.share.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : null}
          <ul className="sr-only">
            {data.map((d) => (
              <li key={d.id}>
                {d.label}: {valueFormat(d.value)} ({d.share.toFixed(1)}%)
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function formatBubbleMarketValue(value: number): string {
  return formatMarketValue(value) ?? "$0";
}
