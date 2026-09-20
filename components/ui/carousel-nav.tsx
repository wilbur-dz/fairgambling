"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CarouselNavProps = {
  onPrev: () => void;
  onNext: () => void;
  theme?: "auto" | "light" | "dark";
};

/** Shared prev/next controls used by home carousels. */
export function CarouselNav({
  onPrev,
  onNext,
  theme = "auto",
}: CarouselNavProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="ghost"
        theme={theme}
        sizeConfig={{ radius: 999, paddingX: 0, paddingY: 0 }}
        className="size-9 shrink-0"
        onClick={onPrev}
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </Button>
      <Button
        variant="ghost"
        theme={theme}
        sizeConfig={{ radius: 999, paddingX: 0, paddingY: 0 }}
        className="size-9 shrink-0"
        onClick={onNext}
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
