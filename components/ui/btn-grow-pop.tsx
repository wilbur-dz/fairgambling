"use client";

import { useEffect } from "react";

const POP_CLASS = "btn-grow-pop";

/** Mirrors reference BtnGrowPop — scale feedback on .btn-grow press. */
export function BtnGrowPop() {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      const button = target?.closest(".btn-grow");
      if (
        !button ||
        button.matches(":disabled, [aria-disabled='true']")
      ) {
        return;
      }
      button.classList.remove(POP_CLASS);
      void (button as HTMLElement).offsetWidth;
      button.classList.add(POP_CLASS);
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName !== "btn-grow-pop") return;
      const target = event.target as Element | null;
      target?.closest(".btn-grow")?.classList.remove(POP_CLASS);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("animationend", onAnimationEnd, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("animationend", onAnimationEnd, true);
    };
  }, []);

  return null;
}
