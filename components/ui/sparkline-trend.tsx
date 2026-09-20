"use client";

import { useEffect, useId, useMemo, useState } from "react";

type SparklineTrendProps = {
  trend: "up" | "down";
  width?: number;
  height?: number;
  className?: string;
  responsive?: boolean;
};

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

/** Decorative animated sparkline used in analytics rows. */
export function SparklineTrend({
  trend,
  width = 200,
  height = 56,
  className = "",
  responsive = false,
}: SparklineTrendProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const points = useMemo(() => {
    let hash = 0;
    const key = `${reactId}-${trend}`;
    for (let i = 0; i < key.length; i++) {
      hash = (31 * hash + key.charCodeAt(i)) | 0;
    }
    const random = createMulberry32(hash);
    const values: number[] = [];
    let value = trend === "up" ? 35 : 65;
    for (let i = 0; i < 30; i++) {
      value = Math.max(
        15,
        Math.min(85, value + (trend === "up" ? 1.2 : -1.2) + (random() - 0.5) * 8),
      );
      values.push(value);
    }
    return values;
  }, [reactId, trend]);

  const padY = 0.15 * height;
  const plotH = height - 2 * padY;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const stepX = (width - 4) / (points.length - 1);
  const coords = points.map((value, index) => ({
    x: 2 + index * stepX,
    y: padY + plotH - ((value - min) / range) * plotH,
  }));

  const buildPath = () => {
    if (coords.length < 2) return "";
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i - 1] || coords[i];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) * 0.3;
      const cp1y = p1.y + (p2.y - p0.y) * 0.3;
      const cp2x = p2.x - (p3.x - p1.x) * 0.3;
      const cp2y = p2.y - (p3.y - p1.y) * 0.3;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = buildPath();
  const areaPath = (() => {
    if (!linePath) return "";
    const last = coords[coords.length - 1];
    const first = coords[0];
    return `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  })();

  const gradientId = `sparkline-gradient-${trend}-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const stroke = trend === "up" ? "#1FC16B" : "#FB3748";
  const fillTop =
    trend === "up" ? "rgba(31, 193, 107, 0.3)" : "rgba(251, 55, 72, 0.3)";

  return (
    <svg
      width={responsive ? "100%" : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={`overflow-visible ${className}`}
      style={{ display: "block", maxWidth: width }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease-out" }}
      />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: visible ? 1 : 0,
          strokeDasharray: 1000,
          strokeDashoffset: visible ? 0 : 1000,
          transition: "stroke-dashoffset 1s ease-out, opacity 0.3s ease-out",
        }}
      />
    </svg>
  );
}
