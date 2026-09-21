"use client";

import type { Action } from "@/lib/blackjack/types";

const ACTIONS: {
  action: Action;
  label: string;
  shortcut: string;
  gradient: string;
  hoverGradient: string;
  iconPath: string;
}[] = [
  {
    action: "H",
    label: "Hit",
    shortcut: "H",
    gradient: "from-green-600 to-green-700",
    hoverGradient: "hover:from-green-500 hover:to-green-600",
    iconPath: "M12 5v14M5 12h14",
  },
  {
    action: "S",
    label: "Stand",
    shortcut: "S",
    gradient: "from-red-600 to-red-700",
    hoverGradient: "hover:from-red-500 hover:to-red-600",
    iconPath: "M5 12h14",
  },
  {
    action: "P",
    label: "Split",
    shortcut: "P",
    gradient: "from-amber-500 to-amber-600",
    hoverGradient: "hover:from-amber-400 hover:to-amber-500",
    iconPath: "M16 3h5v5M8 3H3v5M16 21h5v-5M8 21H3v-5",
  },
  {
    action: "D",
    label: "Double",
    shortcut: "D",
    gradient: "from-amber-500 to-amber-600",
    hoverGradient: "hover:from-amber-400 hover:to-amber-500",
    iconPath:
      "M2 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM9 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2",
  },
];

type ActionButtonsProps = {
  availableActions: Set<Action>;
  onAction: (action: Action) => void;
  disabled?: boolean;
};

/** 2×2 Hit / Stand / Split / Double grid. */
export function ActionButtons({
  availableActions,
  onAction,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-2.5">
      {ACTIONS.map(({ action, label, shortcut, gradient, hoverGradient, iconPath }) => {
        const enabled = availableActions.has(action) && !disabled;
        return (
          <button
            key={action}
            type="button"
            onClick={() => enabled && onAction(action)}
            disabled={!enabled}
            aria-label={`${label} (${shortcut})`}
            className={`group relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border py-2 font-semibold transition-all duration-200 sm:py-2.5 ${
              enabled
                ? `cursor-pointer border-white/15 bg-gradient-to-b ${gradient} ${hoverGradient} text-white shadow-lg shadow-black/20 active:scale-[0.97]`
                : "cursor-not-allowed border-[rgba(42,39,78,0.12)] bg-white text-[rgba(42,39,78,0.35)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/20"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-[22px] w-[22px] max-sm:h-[18px] max-sm:w-[18px] ${enabled ? "opacity-80" : "opacity-60 dark:opacity-30"}`}
            >
              <path d={iconPath} />
            </svg>
            <span className="text-xs tracking-wide sm:text-sm">{label}</span>
            {enabled ? (
              <span className="absolute top-1.5 right-2 hidden text-[10px] font-medium text-white/40 sm:top-2 sm:right-2.5 sm:block">
                {shortcut}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
