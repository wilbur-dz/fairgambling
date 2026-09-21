"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { themed } from "@/lib/ui/themed";

type ModalTheme = "auto" | "light" | "dark";
type ScrollMode = "content" | "viewport";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  padded?: boolean;
  closeButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  scrollMode?: ScrollMode;
  ariaLabel?: string;
  keepMounted?: boolean;
  theme?: ModalTheme;
};

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Modal shell aligned with production reference (portal, scroll modes, theme). */
export function Modal({
  open,
  onClose,
  children,
  title,
  className = "",
  padded = true,
  closeButton = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  scrollMode = "content",
  ariaLabel,
  keepMounted = false,
  theme = "dark",
}: ModalProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
    };
  }, [open, closeOnEsc, onClose]);

  if (!mounted || (!open && !keepMounted)) {
    return null;
  }

  const hidden = !open;
  const viewportScroll = scrollMode === "viewport";

  const panelSurface =
    theme === "auto"
      ? "nd-gradient-border-auto bg-white shadow-[0_24px_60px_-12px_rgba(42,39,78,0.25)] dark:bg-[#0f1424] dark:shadow-none"
      : `${themed(
          theme,
          "border border-solid border-[#2a274e]/10 bg-white shadow-[0_24px_60px_-12px_rgba(42,39,78,0.25)]",
          "nd-gradient-border bg-[#0f1424]",
        )}`;

  const closeBtnClass = `rounded-lg p-1.5 transition-colors ${themed(
    theme,
    "text-[#2a274e]/50 hover:bg-[#2a274e]/[0.06] hover:text-[#2a274e]",
    "text-white/50 hover:bg-white/[0.06] hover:text-white",
  )}`;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex justify-center p-4 ${
        viewportScroll ? "items-start overflow-y-auto" : "items-center"
      }${hidden ? " invisible pointer-events-none" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
      onClick={closeOnBackdrop && !hidden ? onClose : undefined}
    >
      <div
        className={`${
          viewportScroll ? "fixed" : "absolute"
        } inset-0 backdrop-blur-sm ${themed(
          theme,
          "bg-[#2a274e]/25",
          "bg-black/50",
        )}`}
        aria-hidden
      />
      <div
        className={`relative z-10 flex w-full max-w-[400px] flex-col rounded-[24px] ${
          viewportScroll
            ? "my-auto overflow-visible"
            : "max-h-[85vh] overflow-hidden"
        } ${panelSurface} ${padded ? "p-5" : ""} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title == null && closeButton ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`absolute right-4 top-4 z-20 ${closeBtnClass}`}
          >
            <X size={18} />
          </button>
        ) : null}
        {title != null ? (
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <span
              className={`text-base font-semibold ${themed(
                theme,
                "text-[#2a274e]",
                "text-white",
              )}`}
            >
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={closeBtnClass}
            >
              <X size={18} />
            </button>
          </div>
        ) : null}
        <div
          className={
            viewportScroll
              ? "min-h-0 flex-1"
              : "scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          }
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
