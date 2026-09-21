"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  formatWagerDisplay,
  sanitizeDecimalInput,
} from "@/lib/bonus-calculator/calc";

type NumberStepperProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  step?: number;
  className?: string;
};

/** Decimal input with increment/decrement chevrons. */
export function NumberStepper({
  value,
  onChange,
  placeholder,
  ariaLabel,
  step = 1,
  className = "",
}: NumberStepperProps) {
  const [focused, setFocused] = useState(false);
  const bump = (dir: number) =>
    onChange(String(Math.max(0, (parseFloat(value) || 0) + dir * step)));

  return (
    <div
      className={`flex h-[42px] items-center gap-2 rounded-[22px] border border-[rgba(42,39,78,0.15)] bg-white px-4 dark:border-white/10 dark:bg-white/[0.02] ${className}`}
    >
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={formatWagerDisplay(value, focused)}
        onChange={(e) => onChange(sanitizeDecimalInput(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] font-light text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.5)] dark:text-white dark:placeholder:text-white/50"
      />
      <div className="flex shrink-0 flex-col text-[rgba(42,39,78,0.5)] dark:text-white/50">
        <button
          type="button"
          aria-label={`Increase ${ariaLabel}`}
          onClick={() => bump(1)}
          className="flex h-[9px] items-center transition-colors hover:text-[#2a274e] dark:hover:text-white"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          aria-label={`Decrease ${ariaLabel}`}
          onClick={() => bump(-1)}
          className="flex h-[9px] items-center transition-colors hover:text-[#2a274e] dark:hover:text-white"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}

export function FieldLabel({
  label,
  labelSize = 14,
  children,
}: {
  label: string;
  labelSize?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <span
        className="font-medium leading-none text-[#2a274e] dark:text-white"
        style={{ fontSize: labelSize }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
