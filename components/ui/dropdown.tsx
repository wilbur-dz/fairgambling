"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

type SizeMetrics = {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  iconSize: number;
  radius: number;
};

const SIZE_PRESETS: Record<"sm" | "md" | "lg", SizeMetrics> = {
  sm: {
    fontSize: 12,
    paddingX: 12,
    paddingY: 6,
    gap: 8,
    iconSize: 16,
    radius: 22,
  },
  md: {
    fontSize: 14,
    paddingX: 16,
    paddingY: 12,
    gap: 8,
    iconSize: 16,
    radius: 22,
  },
  lg: {
    fontSize: 14,
    paddingX: 16,
    paddingY: 12,
    gap: 8,
    iconSize: 20,
    radius: 22,
  },
};

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
};

type DropdownBaseProps = {
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  size?: keyof typeof SIZE_PRESETS;
  sizeConfig?: Partial<SizeMetrics>;
  panelWidth?: number;
  align?: "left" | "right";
  renderIcon?: (value: string, size: number) => ReactNode;
  disabled?: boolean;
  block?: boolean;
  theme?: "auto" | "light" | "dark";
  className?: string;
  /** Custom trigger content (replaces default label/icon). */
  trigger?: ReactNode;
};

type SingleDropdownProps = DropdownBaseProps & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiDropdownProps = DropdownBaseProps & {
  multiple: true;
  /** `null` = all selected; `Set` = partial selection. */
  value: Set<string> | null;
  onChange: (value: Set<string> | null) => void;
  allLabel?: string;
  noun?: string;
  /** Show “Select all” row (default true). */
  selectAll?: boolean;
};

export type DropdownProps = SingleDropdownProps | MultiDropdownProps;

type PanelPos = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

function DropdownCheckbox({
  checked,
  theme = "dark",
}: {
  checked: boolean;
  theme?: "auto" | "light" | "dark";
}) {
  const isAuto = theme === "auto";
  const unchecked = isAuto
    ? "border border-[#2a274e]/25 bg-white dark:border-white/20 dark:bg-white/[0.03]"
    : theme === "light"
      ? "border border-[#2a274e]/25 bg-white"
      : "border border-white/20 bg-white/[0.03]";

  return (
    <span
      className={`relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-[5px] transition-colors ${
        checked ? "border-[0.5px] border-white/15" : unchecked
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

function PreviewIcons({
  slugs,
  iconSize,
  renderIcon,
}: {
  slugs: string[];
  iconSize: number;
  renderIcon: (value: string, size: number) => ReactNode;
}) {
  return (
    <span className="flex items-center">
      {slugs.map((slug, i) => (
        <span
          key={slug}
          className={`overflow-hidden rounded-full ${
            i < slugs.length - 1 ? "-mr-1" : ""
          }`}
        >
          {renderIcon(slug, iconSize + 4)}
        </span>
      ))}
    </span>
  );
}

/** Port of reference `Dropdown` (single + multi / searchable). */
export function Dropdown(props: DropdownProps) {
  const {
    options,
    placeholder = "Select",
    searchable = false,
    size = "sm",
    sizeConfig,
    panelWidth = 200,
    align = "left",
    renderIcon,
    disabled = false,
    block = false,
    theme = "dark",
    className = "",
    trigger,
  } = props;

  const multiple = props.multiple === true;
  const metrics = { ...SIZE_PRESETS[size], ...sizeConfig };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PanelPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = block ? rect.width : panelWidth;
    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const flip = spaceBelow < 240 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, (flip ? spaceAbove : spaceBelow) - 8);
    setPos({
      left,
      width,
      top: flip ? undefined : rect.bottom + 8,
      bottom: flip ? window.innerHeight - rect.top + 8 : undefined,
      maxHeight,
    });
  }, [align, block, panelWidth]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t))
        return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    let raf = 0;
    const onMove = (e: Event) => {
      if (
        e.type === "scroll" &&
        e.target instanceof Node &&
        panelRef.current?.contains(e.target)
      ) {
        return;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        place();
      });
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [open, close, place]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  const allSelected =
    multiple &&
    (props.value === null ||
      (options.length > 0 && props.value.size >= options.length));

  const isSelected = (optValue: string) => {
    if (!multiple) return props.value === optValue;
    return props.value === null || props.value.has(optValue);
  };

  const label = (() => {
    if (!multiple) {
      return options.find((o) => o.value === props.value)?.label ?? placeholder;
    }
    const v = props.value;
    if (v === null) return props.allLabel ?? placeholder;
    if (v.size === 0) return placeholder;
    if (v.size === 1) {
      return (
        options.find((o) => v.has(o.value))?.label ?? placeholder
      );
    }
    return props.noun ? `${v.size} ${props.noun}s` : `${v.size} selected`;
  })();

  const selectedSingle = !multiple
    ? options.find((o) => o.value === props.value)
    : undefined;

  const multiPreviewSlugs =
    multiple && props.value && renderIcon
      ? Array.from(props.value).slice(0, 3)
      : [];

  const iconFor = (opt: DropdownOption, iconSize: number) =>
    opt.icon ?? renderIcon?.(opt.value, iconSize) ?? null;

  const toggleMulti = (optValue: string) => {
    if (!multiple) return;
    if (options.find((o) => o.value === optValue)?.disabled) return;
    const current =
      props.value === null
        ? new Set(options.map((o) => o.value))
        : new Set(props.value);
    if (current.has(optValue)) current.delete(optValue);
    else current.add(optValue);
    props.onChange(current.size === options.length ? null : current);
  };

  const isAuto = theme === "auto";
  const isLight = theme === "light" || isAuto;

  const triggerClass = block
    ? isAuto
      ? "flex w-full border border-[#2a274e]/10 bg-white dark:border dark:border-white/10 dark:bg-white/[0.02]"
      : theme === "light"
        ? "flex w-full border border-[#2a274e]/10 bg-white"
        : "flex w-full border border-white/10 bg-white/[0.02]"
    : isAuto
      ? "nd-ring-dark-only inline-flex border border-solid border-[#2a274e]/10 bg-white dark:border-0 dark:bg-transparent"
      : theme === "light"
        ? "inline-flex border border-solid border-[#2a274e]/10 bg-white"
        : "nd-gradient-border inline-flex";

  const triggerText = disabled
    ? isLight
      ? "cursor-not-allowed text-[#2a274e]/30 dark:text-white/30"
      : "cursor-not-allowed text-white/30"
    : block
      ? "cursor-pointer text-[#2a274e]/70 hover:text-[#2a274e] dark:text-white/70 dark:hover:text-white"
      : "cursor-pointer text-[#2a274e]/60 hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white/80";

  const mutedText = isAuto
    ? "text-[#2a274e]/50 dark:text-white/50"
    : theme === "light"
      ? "text-[#2a274e]/50"
      : "text-white/50";

  const optionText = (active: boolean) =>
    active && !multiple
      ? "text-[#8874ff]"
      : isAuto
        ? "text-[#2a274e]/60 dark:text-white/50"
        : theme === "light"
          ? "text-[#2a274e]/60"
          : "text-white/50";

  const showSelectAll = multiple && props.selectAll !== false;

  const panel =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className={`fixed z-[110] flex flex-col overflow-hidden rounded-[18px] ${
              isAuto
                ? "border border-solid border-[#2a274e]/10 bg-[#fbfaff] shadow-[0_12px_30px_-12px_rgba(42,39,78,0.12)] dark:border-0 dark:bg-[#0f1424] dark:shadow-none nd-gradient-border-auto"
                : theme === "light"
                  ? "border border-solid border-[#2a274e]/10 bg-[#fbfaff] shadow-[0_12px_30px_-12px_rgba(42,39,78,0.12)]"
                  : "nd-gradient-border bg-[#0f1424]"
            }`}
            style={{
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-[10px] px-[15px] py-[10px]">
              {searchable ? (
                <div
                  className={`flex shrink-0 items-center gap-2 border-b py-2 ${
                    isAuto
                      ? "border-[#2a274e]/10 dark:border-white/10"
                      : theme === "light"
                        ? "border-[#2a274e]/10"
                        : "border-white/10"
                  }`}
                >
                  <Search size={16} className={`shrink-0 ${mutedText}`} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className={`w-full bg-transparent text-[12px] font-medium focus:outline-none ${
                      isAuto
                        ? "text-[#2a274e] placeholder:text-[#2a274e]/50 dark:text-white dark:placeholder:text-white/50"
                        : theme === "light"
                          ? "text-[#2a274e] placeholder:text-[#2a274e]/50"
                          : "text-white placeholder:text-white/50"
                    }`}
                  />
                </div>
              ) : null}

              {showSelectAll ? (
                <button
                  type="button"
                  onClick={() => {
                    props.onChange(allSelected ? new Set() : null);
                  }}
                  className="flex shrink-0 items-center justify-between py-0.5 pr-0.5"
                >
                  <span className={`text-[12px] font-medium ${mutedText}`}>
                    Select all
                  </span>
                  <DropdownCheckbox checked={!!allSelected} theme={theme} />
                </button>
              ) : null}

              <div className="scrollbar-hide flex max-h-[360px] min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto pr-0.5">
                {filtered.length === 0 ? (
                  <div
                    className={`py-2 text-center text-[12px] ${mutedText}`}
                  >
                    Nothing found
                  </div>
                ) : (
                  filtered.map((opt) => {
                    const active = isSelected(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        aria-disabled={opt.disabled || undefined}
                        disabled={opt.disabled}
                        onClick={() => {
                          if (opt.disabled) return;
                          if (multiple) {
                            toggleMulti(opt.value);
                          } else {
                            props.onChange(opt.value);
                            close();
                          }
                        }}
                        className={`flex items-center justify-between gap-2 ${
                          opt.disabled ? "cursor-not-allowed opacity-40" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {iconFor(opt, 20)}
                          <span
                            className={`truncate text-[12px] font-medium ${optionText(active)}`}
                          >
                            {opt.label}
                          </span>
                        </span>
                        {multiple ? (
                          <DropdownCheckbox checked={active} theme={theme} />
                        ) : active ? (
                          <Check
                            size={15}
                            className="shrink-0 text-[#8874ff]"
                          />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`relative ${block ? "block w-full" : "inline-block"} ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (open) close();
          else {
            place();
            setOpen(true);
          }
        }}
        style={{
          paddingInline: `${metrics.paddingX}px`,
          paddingBlock: `${metrics.paddingY}px`,
          fontSize: `${metrics.fontSize}px`,
          gap: `${metrics.gap}px`,
          borderRadius: `${metrics.radius}px`,
          ["--nd-dd-icon" as string]: `${metrics.iconSize}px`,
        }}
        className={`relative items-center font-medium transition-colors ${triggerClass} ${triggerText}`}
      >
        {trigger ?? (
          <>
            {multiPreviewSlugs.length > 0 && renderIcon ? (
              <PreviewIcons
                slugs={multiPreviewSlugs}
                iconSize={metrics.iconSize}
                renderIcon={renderIcon}
              />
            ) : !multiple &&
              selectedSingle &&
              iconFor(selectedSingle, metrics.iconSize) ? (
              <span className="inline-flex shrink-0 [&_svg]:size-[var(--nd-dd-icon)]">
                {iconFor(selectedSingle, metrics.iconSize)}
              </span>
            ) : null}
            <span
              className={`truncate ${block ? "min-w-0 flex-1 text-left" : "max-w-[160px]"}`}
            >
              {label}
            </span>
          </>
        )}
        <ChevronDown
          size={metrics.iconSize}
          className={`ml-auto shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {panel}
    </div>
  );
}
