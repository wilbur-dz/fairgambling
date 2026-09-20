"use client";

import { useEffect } from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useSidebar } from "@/components/layout/sidebar-provider";

export function DesktopSidebar() {
  const { open, setOpen, collapsed } = useSidebar();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
    };
  }, [open, setOpen]);

  return (
    <aside
      className={`fixed bottom-6 left-6 top-6 z-50 hidden rounded-[24px] transition-[width] duration-300 md:block ${
        collapsed ? "w-20" : "w-[280px]"
      }`}
    >
      <SidebarNav variant="desktop" />
    </aside>
  );
}
