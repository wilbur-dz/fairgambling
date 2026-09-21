"use client";

import { ChevronDown } from "lucide-react";

type ExpandGamesButtonProps = {
  expanded: boolean;
  label: string;
  onClick: () => void;
};

/** Port of reference expand control `x` (2-7hhq-z71oqb.js). */
export function ExpandGamesButton({
  expanded,
  label,
  onClick,
}: ExpandGamesButtonProps) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-[7px] rounded-[52px] bg-[rgba(142,142,255,0.04)] px-4 py-3 text-[14px] font-medium text-[#6b56e0] transition-colors hover:bg-[rgba(142,142,255,0.1)] dark:text-[#8874ff]"
      >
        {expanded ? "Show Less" : label}
        <ChevronDown
          size={20}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
