"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white md:text-[20px]">
      {title}
    </h2>
  );
}

export function Panel({
  children,
  contentClassName = "",
  className = "",
}: {
  children: ReactNode;
  contentClassName?: string;
  className?: string;
}) {
  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </Card>
  );
}

export function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-[12px] border border-[rgba(42,39,78,0.1)] bg-white/60 dark:border-white/10 dark:bg-white/[0.04]">
      {children}
    </span>
  );
}

export function AffiliateIcon({
  icon: Icon,
  iconSrc,
  size = 24,
}: {
  icon?: LucideIcon;
  iconSrc?: string;
  size?: number;
}) {
  if (iconSrc) {
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 bg-[#2a274e] dark:bg-white"
        style={{
          width: size,
          height: size,
          WebkitMaskImage: `url(${iconSrc})`,
          maskImage: `url(${iconSrc})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }
  if (Icon) {
    return <Icon size={size} className="text-[#2a274e] dark:text-white" />;
  }
  return null;
}

export function BreakdownRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-[rgba(42,39,78,0.55)] dark:text-white/50">
        {label}
      </span>
      <span className="text-[13px] font-semibold tabular-nums text-[#2a274e] dark:text-white">
        {value}
      </span>
    </div>
  );
}
