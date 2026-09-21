"use client";

import type { ReactNode } from "react";
import { ClickNav } from "@/components/ui/click-nav";

type GlowButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  leftIcon?: ReactNode;
};

/** Port of reference `GlowButton` — primary CTA with pulse. */
export function GlowButton({
  href,
  children,
  className = "",
  leftIcon,
}: GlowButtonProps) {
  return (
    <ClickNav
      href={href}
      className={`nd-button nd-button--primary relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium ${className}`}
    >
      <span aria-hidden className="nd-button__pulse" />
      {leftIcon != null ? (
        <span className="relative z-[1] inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      <span className="relative z-[1]">{children}</span>
    </ClickNav>
  );
}
