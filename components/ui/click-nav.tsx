"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

type ClickNavProps = {
  href: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Port of reference `ClickNav` — router.push without a real <a> (avoids drag conflicts). */
export function ClickNav({ href, className, style, children }: ClickNavProps) {
  const router = useRouter();

  if (!href) return null;

  const navigate = () => {
    router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate();
    }
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={onKeyDown}
      className={className ? `cursor-pointer ${className}` : "cursor-pointer"}
      style={style}
    >
      {children}
    </span>
  );
}
