"use client";

import { List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CASINO_PAGE_SECTIONS,
  type CasinoPageSection,
} from "@/lib/casinos/casino-page";

type SectionNavProps = {
  sections?: CasinoPageSection[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onNavigate?: (id: string) => void;
  bare?: boolean;
  className?: string;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/** Port of reference `SectionNav` (module `879002`). */
export function SectionNav({
  sections = CASINO_PAGE_SECTIONS,
  activeId,
  onSelect,
  onNavigate,
  bare = false,
  className = "",
}: SectionNavProps) {
  const [internalActive, setInternalActive] = useState(sections[0]?.id);
  const current = activeId ?? internalActive;

  useEffect(() => {
    if (activeId) return;
    const ids = sections.map((s) => s.id);
    let raf = 0;

    const update = () => {
      raf = 0;
      let next: string | undefined;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el || el.offsetParent === null) continue;
        if (el.getBoundingClientRect().top - 120 <= 0) next = id;
      }
      if (next) setInternalActive(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections, activeId]);

  const buttons = sections.map((section) => {
    const active = section.id === current;
    return (
      <button
        key={section.id}
        type="button"
        onClick={() => {
          setInternalActive(section.id);
          onSelect?.(section.id);
          if (onNavigate) onNavigate(section.id);
          else scrollToSection(section.id);
        }}
        className={`flex w-full items-center rounded-md px-3 py-2 text-left text-[14px] font-medium leading-5 transition-colors ${
          active
            ? "bg-[rgba(142,142,255,0.14)] text-[#6b56e0] dark:text-[#8874ff]"
            : "text-[#2a274e] hover:bg-[rgba(142,142,255,0.14)] dark:text-white"
        }`}
      >
        {section.label}
      </button>
    );
  });

  if (bare) {
    return <div className={`flex flex-col gap-1 ${className}`}>{buttons}</div>;
  }

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      contentClassName={`flex flex-col gap-1 ${className}`}
    >
      {buttons}
    </Card>
  );
}

type SectionNavMobileProps = {
  sections?: CasinoPageSection[];
  className?: string;
};

/** Port of reference `SectionNavMobile` (module `879002`). */
export function SectionNavMobile({
  sections = CASINO_PAGE_SECTIONS,
  className = "",
}: SectionNavMobileProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={className}>
      <Button
        theme="auto"
        variant="ghost"
        size="sm"
        leftIcon={<List size={16} />}
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        Sections
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Jump to section"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[20px] bg-white sm:rounded-[20px] dark:bg-[#0f1424]">
            <div className="flex items-center justify-between border-b border-[rgba(42,39,78,0.1)] px-4 py-3 dark:border-white/10">
              <h2 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
                Jump to section
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-[rgba(42,39,78,0.55)] hover:bg-[rgba(42,39,78,0.06)] dark:text-white/50 dark:hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              <SectionNav
                bare
                sections={sections}
                onNavigate={(id) => {
                  setOpen(false);
                  requestAnimationFrame(() => scrollToSection(id));
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
