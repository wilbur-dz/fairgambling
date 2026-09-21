"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional header title (string or custom node). Enables title-bar layout. */
  title?: ReactNode;
  /** Accessible name for the dialog. */
  ariaLabel?: string;
  /** Show the close button (default true). */
  closeButton?: boolean;
  /** Apply default inner padding when there is no title (default true). */
  padded?: boolean;
  /** Extra classes on the panel. */
  className?: string;
  /** Overlay z-index (default 100, matches reference). */
  zIndexClassName?: string;
  /** Align panel vertically. */
  align?: "center" | "end";
};

/**
 * Shared dialog shell — port of reference `Modal`
 * (backdrop blur + gradient-border panel + Escape / body lock).
 */
export function Modal({
  open,
  onClose,
  children,
  title,
  ariaLabel,
  closeButton = true,
  padded = true,
  className = "",
  zIndexClassName = "z-[100]",
  align = "center",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const hasTitle = title != null && title !== false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const alignClass =
    align === "end" ? "items-end sm:items-center" : "items-center";

  const closeBtn = closeButton ? (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className={`rounded-lg p-1.5 text-[#2a274e]/50 transition-colors hover:bg-[#2a274e]/[0.06] hover:text-[#2a274e] dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white ${
        hasTitle ? "shrink-0" : "absolute right-4 top-4 z-20"
      }`}
    >
      <X size={18} aria-hidden />
    </button>
  ) : null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClassName} flex justify-center p-4 ${alignClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className="absolute inset-0 bg-[#2a274e]/25 backdrop-blur-sm dark:bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_-12px_rgba(42,39,78,0.25)] nd-gradient-border-auto dark:bg-[#0f1424] dark:shadow-none ${
          className.includes("max-w-") ? "" : "max-w-[560px]"
        } ${hasTitle ? "p-5" : ""} ${className}`}
      >
        {hasTitle ? (
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0 text-base font-semibold text-[#2a274e] dark:text-white">
              {title}
            </div>
            {closeBtn}
          </div>
        ) : (
          closeBtn
        )}
        <div
          className={`scrollbar-hide min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${
            !hasTitle && padded ? "p-5 sm:p-6" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
