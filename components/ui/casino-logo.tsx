"use client";

import Image from "next/image";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

type CasinoLogoProps = {
  slug: string;
  name: string;
  size?: number;
  className?: string;
  withBg?: boolean;
  analyticsStakeS?: boolean;
  theme?: "light" | "dark" | "auto";
  logoUrl?: string | null;
};

/** Port of reference `CasinoLogo`. */
export function CasinoLogo({
  slug,
  name,
  size = 34,
  className = "",
  withBg = false,
  analyticsStakeS = false,
  theme,
  logoUrl,
}: CasinoLogoProps) {
  if (!slug && !logoUrl) return null;

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized
        className={className}
      />
    );
  }

  const pair = getCasinoLogoPair(slug, { withBg, analyticsStakeS });
  if (!pair) {
    return (
      <span className="text-xs font-bold text-[#9ca3af]">
        {(name || slug).charAt(0).toUpperCase()}
      </span>
    );
  }

  if (theme === "light") {
    return (
      <Image
        src={pair.light}
        alt={name}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  if (theme === "dark") {
    return (
      <Image
        src={pair.dark}
        alt={name}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <>
      <Image
        src={pair.light}
        alt={name}
        width={size}
        height={size}
        className={`${className} dark:hidden`}
      />
      <Image
        src={pair.dark}
        alt={name}
        width={size}
        height={size}
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
