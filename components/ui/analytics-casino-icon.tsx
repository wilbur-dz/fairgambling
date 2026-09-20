"use client";

import Image from "next/image";
import {
  casinoNameToSlug,
  getCasinoLogoPair,
  surfaceTile,
  tileNeedsDarkPlate,
} from "@/lib/casinos/logos";

type AnalyticsCasinoIconProps = {
  casinoName: string;
  size?: number;
  className?: string;
  theme?: "auto" | "light" | "dark";
  label?: string;
  ring?: string;
  logoUrl?: string | null;
};

/** Port of reference `AnalyticsCasinoIcon` (local logos + letter fallback). */
export function AnalyticsCasinoIcon({
  casinoName,
  size = 26,
  className = "",
  theme = "auto",
  label,
  ring,
  logoUrl,
}: AnalyticsCasinoIconProps) {
  if (!casinoName && !logoUrl) return null;

  const isLight = theme === "light";
  const isAuto = theme === "auto";
  const slug = casinoNameToSlug(casinoName || "");
  const alt = label ?? casinoName;
  const ringStyle = ring ? { boxShadow: `0 0 0 1.5px ${ring}` } : undefined;
  const pair = getCasinoLogoPair(slug || casinoName, {
    withBg: true,
    analyticsStakeS: true,
  });

  if (!pair && logoUrl) {
    return (
      <div
        className="shrink-0 overflow-hidden rounded-full bg-[#2a274e]/[0.08] dark:bg-[#1a1f2e]"
        style={{ width: size, height: size, ...ringStyle }}
      >
        <Image
          src={logoUrl}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          className={`h-full w-full object-cover ${className}`}
        />
      </div>
    );
  }

  if (!pair) {
    const initial = (casinoName || "?").charAt(0);
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full ${
          isAuto
            ? "bg-[#2a274e]/[0.08] dark:bg-[#1a1f2e]"
            : isLight
              ? "bg-[rgba(42,39,78,0.08)]"
              : "bg-[#1a1f2e]"
        }`}
        style={{ width: size, height: size, ...ringStyle }}
      >
        <span
          className={`text-[10px] ${
            isAuto
              ? "text-[#2a274e]/60 dark:text-white/50"
              : isLight
                ? "text-[rgba(42,39,78,0.6)]"
                : "text-white/50"
          }`}
        >
          {initial}
        </span>
      </div>
    );
  }

  const plate = tileNeedsDarkPlate(slug)
    ? "bg-[#1c1d2a]"
    : "bg-[rgba(42,39,78,0.05)]";

  if (isLight) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${plate} ${className}`}
        style={{ width: size, height: size, ...ringStyle }}
      >
        <Image
          src={surfaceTile(pair, slug, true)}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          className="size-full object-contain"
        />
      </span>
    );
  }

  if (isAuto) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${plate} dark:bg-white/[0.06] ${className}`}
        style={{ width: size, height: size, ...ringStyle }}
      >
        <Image
          src={surfaceTile(pair, slug, true)}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          className="size-full object-contain dark:hidden"
        />
        <Image
          src={pair.dark}
          alt=""
          width={size}
          height={size}
          unoptimized
          className="hidden size-full object-contain dark:block"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ${className}`}
      style={{ width: size, height: size, ...ringStyle }}
    >
      <Image
        src={pair.light}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        className="size-full object-contain dark:hidden"
      />
      <Image
        src={pair.dark}
        alt={alt}
        width={size}
        height={size}
        unoptimized
        className="hidden size-full object-contain dark:block"
      />
    </span>
  );
}
