"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MOBILE_NAV, isPathActive, type NavLinkItem } from "@/lib/navigation";

function MobilePopup({
  items,
  onClose,
}: {
  items: NavLinkItem[];
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[220px] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#2a274e]/10 bg-white shadow-[0_12px_32px_rgba(42,39,78,0.18)] dark:border-white/[0.08] dark:bg-[#161c32] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
      <ul className="flex max-h-[50vh] flex-col overflow-y-auto py-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2a274e] transition-colors hover:bg-[rgba(142,142,255,0.1)] dark:text-white"
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [trackedPath, setTrackedPath] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);

  if (pathname !== trackedPath) {
    setTrackedPath(pathname);
    setOpenLabel(null);
  }

  useEffect(() => {
    if (!openLabel) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenLabel(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openLabel]);

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2a274e]/10 bg-white shadow-[0_-8px_24px_rgba(42,39,78,0.12)] md:hidden dark:border-white/[0.08] dark:bg-[#111525] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.45)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-[58px] items-stretch px-1.5">
        {MOBILE_NAV.map((item) => {
          const isPopupOpen = openLabel === item.label;
          const isActive = item.href
            ? isPathActive(item.href, pathname)
            : (item.popup?.some((entry) =>
                isPathActive(entry.href, pathname),
              ) ??
                false) ||
              isPopupOpen;

          const content = (
            <>
              <Icon
                name={item.icon}
                size={20}
                className={
                  isActive
                    ? "text-[#4F2DEC] dark:text-[#8E8EFF]"
                    : "text-base-700 dark:text-base-400"
                }
              />
              <span
                className={`text-[10px] leading-[1.2] ${
                  isActive
                    ? "font-medium text-[#4F2DEC] dark:text-[#8E8EFF]"
                    : "text-base-700 dark:text-base-400"
                }`}
              >
                {item.label}
              </span>
            </>
          );

          const className = `flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg px-1 py-1 transition-colors duration-150 ${
            isActive
              ? "bg-[rgba(79,45,236,0.07)]"
              : "hover:bg-base-200 dark:hover:bg-base-700"
          }`;

          return (
            <div
              key={item.label}
              className="relative flex flex-1 items-center justify-center"
            >
              {item.popup ? (
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setOpenLabel(isPopupOpen ? null : item.label);
                  }}
                  className={className}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={item.href ?? "/"}
                  onClick={() => setOpenLabel(null)}
                  className={className}
                >
                  {content}
                </Link>
              )}
              {isPopupOpen && item.popup ? (
                <MobilePopup
                  items={item.popup}
                  onClose={() => setOpenLabel(null)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
