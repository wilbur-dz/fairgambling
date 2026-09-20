"use client";

import { useEffect, useRef, useState } from "react";

type HalfCircleProgressBarProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  borderWidth?: number;
  backgroundColor?: string;
  darkBackgroundColor?: string;
  progressColor?: string;
  textClassName?: string;
  animationDuration?: number;
  showPercentage?: boolean;
  className?: string;
  maxValue?: number;
};

function HalfCircleProgressBar({
  value,
  size = 56,
  strokeWidth,
  borderWidth,
  backgroundColor = "#E3E6EB",
  darkBackgroundColor = "#344051",
  progressColor = "#1FC16B",
  textClassName,
  animationDuration = 1500,
  showPercentage = true,
  className = "",
  maxValue = 10,
}: HalfCircleProgressBarProps) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const currentRef = useRef(0);
  const stroke = strokeWidth ?? borderWidth ?? 3;

  useEffect(() => {
    const target = Math.max(0, Math.min(maxValue, value));
    if (animationDuration <= 0) {
      setDisplay(target);
      currentRef.current = target;
      return;
    }

    const from = currentRef.current;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / animationDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        currentRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, animationDuration, maxValue]);

  const half = size / 2;
  const radius = half - stroke / 2;
  const arcLength = Math.PI * radius;
  const progress = ((display / maxValue) * 100) / 100;
  const dash = progress * arcLength;
  const gap = arcLength - dash;
  const path = `M ${stroke / 2} ${half} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${half}`;
  const height = half + stroke / 2;

  return (
    <div
      className={`relative inline-flex items-end justify-center ${className}`}
      style={{ width: size, height }}
    >
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="dark:hidden"
      >
        <path
          d={path}
          stroke={backgroundColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={path}
          stroke={progressColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={0}
        />
      </svg>
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 hidden dark:block"
      >
        <path
          d={path}
          stroke={darkBackgroundColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={path}
          stroke={progressColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={0}
        />
      </svg>
      {showPercentage ? (
        <span
          className={textClassName || "text-[#141C25] dark:text-white"}
          style={{
            position: "absolute",
            bottom: "2px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: maxValue > 10 ? `${Math.max(11, 0.28 * size)}px` : "16px",
            fontWeight: 600,
            lineHeight: "1",
            textAlign: "center",
          }}
        >
          {maxValue > 10 ? display.toFixed(0) : display.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}

type RatingGaugeProps = {
  value: number;
  maxValue?: number;
  color: string;
  size?: number;
  theme?: "auto" | "light" | "dark";
};

/** Only animate on the first RatingGauge mount in the session (reference behavior). */
let hasAnimatedOnce = false;

/** Port of reference `RatingGauge`. */
export function RatingGauge({
  value,
  maxValue = 100,
  color,
  size = 52,
  theme,
}: RatingGaugeProps) {
  const [shouldAnimate] = useState(() => !hasAnimatedOnce);

  useEffect(() => {
    hasAnimatedOnce = true;
  }, []);

  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) {
    return null;
  }

  return (
    <HalfCircleProgressBar
      value={value}
      maxValue={maxValue}
      size={size}
      strokeWidth={3}
      darkBackgroundColor="#344051"
      progressColor={color}
      textClassName={theme === "light" ? "text-[#2a274e]" : undefined}
      animationDuration={shouldAnimate ? 1200 : 0}
    />
  );
}
