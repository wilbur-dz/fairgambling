"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { isComplaintsEnabled } from "@/lib/navigation";

export function NotificationBell({
  theme = "auto",
}: {
  theme?: "auto" | "light" | "dark";
}) {
  const { isAuthenticated } = useAuth();
  const enabled = isComplaintsEnabled();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (!isAuthenticated || !enabled) return null;

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="ghost"
        theme={theme === "light" ? "light" : "auto"}
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        sizeConfig={{
          paddingX: 11,
          paddingY: 11,
          gap: 0,
          iconSize: 20,
          radius: 999,
        }}
        className="relative h-[42px] w-[42px] shrink-0 justify-center"
        leftIcon={
          <svg
            className="text-[#8874ff] dark:text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        }
      />
      {open ? (
        <div className="absolute right-0 z-50 mt-2 max-h-[480px] w-[360px] overflow-hidden rounded-lg border border-base-200 bg-white text-base-900 shadow-xl dark:border-white/[0.08] dark:bg-dark-bg dark:text-white">
          <div className="flex items-center justify-between border-b border-base-200 px-4 py-3 dark:border-white/[0.08]">
            <p className="text-sm font-semibold">Notifications</p>
          </div>
          <p className="px-4 py-6 text-center text-xs text-base-500">
            No notifications yet.
          </p>
        </div>
      ) : null}
    </div>
  );
}
