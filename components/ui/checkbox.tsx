"use client";

import { themed } from "@/lib/ui/themed";

type CheckboxProps = {
  checked: boolean;
  theme?: "auto" | "light" | "dark";
};

/** Port of reference `Checkbox` used by Dropdown. */
export function Checkbox({ checked, theme = "dark" }: CheckboxProps) {
  return (
    <span
      className={`relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-[5px] transition-colors ${
        checked
          ? "border-[0.5px] border-white/15"
          : themed(
              theme,
              "border border-[#2a274e]/25 bg-white",
              "dark:border-white/20 dark:bg-white/[0.03]",
            )
      }`}
      style={
        checked
          ? { background: "linear-gradient(180deg, #9483ff 0%, #7059e8 100%)" }
          : undefined
      }
    >
      {checked ? (
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          aria-hidden
          className="relative"
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
