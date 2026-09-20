"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { themed } from "@/lib/ui/themed";

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
};

type SizeKey = "sm" | "md";

type SizeMetrics = {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  iconSize: number;
  radius: number;
};

const SIZE_PRESETS: Record<SizeKey, SizeMetrics> = {
  sm: {
    fontSize: 12,
    paddingX: 12,
    paddingY: 9,
    gap: 8,
    iconSize: 16,
    radius: 999,
  },
  md: {
    fontSize: 14,
    paddingX: 16,
    paddingY: 11,
    gap: 8,
    iconSize: 18,
    radius: 999,
  },
};

type PanelPos = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

type DropdownBase = {
  options: DropdownOption[];
  placeholder?: string;
  trigger?: ReactNode;
  searchable?: boolean;
  size?: SizeKey;
  sizeConfig?: Partial<SizeMetrics>;
  panelWidth?: number;
  align?: "left" | "right";
  renderIcon?: (value: string, size: number) => ReactNode;
  disabled?: boolean;
  block?: boolean;
  theme?: "auto" | "light" | "dark";
  className?: string;
  selectAll?: boolean;
  allLabel?: string;
  noun?: string;
  allPreviewIcons?: boolean | string[];
};

type SingleDropdownProps = DropdownBase & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiDropdownProps = DropdownBase & {
  multiple: true;
  value: Set<string> | null;
  onChange: (value: Set<string> | null) => void;
};

export type DropdownProps = SingleDropdownProps | MultiDropdownProps;

/** Port of reference `Dropdown` (portal panel, multi-select, search). */
export function Dropdown(props: DropdownProps) {
  const {
    options,
    placeholder = "Select",
    trigger,
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
  } = props;

  const metrics = { ...SIZE_PRESETS[size], ...sizeConfig };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<PanelPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePanel = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = block ? rect.width : panelWidth;
    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, vw - width - 8));
    const spaceBelow = vh - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 240 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, (openUp ? spaceAbove : spaceBelow) - 8);
    setPanel({
      left,
      width,
      top: openUp ? undefined : rect.bottom + 8,
      bottom: openUp ? vh - rect.top + 8 : undefined,
      maxHeight,
    });
  }, [align, panelWidth, block]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    let raf: number | null = null;
    const onReposition = (event: Event) => {
      const target = event.target;
      if (
        event.type === "scroll" &&
        target instanceof Node &&
        panelRef.current?.contains(target)
      ) {
        return;
      }
      if (raf == null) {
        raf = requestAnimationFrame(() => {
          raf = null;
          updatePanel();
        });
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [open, close, updatePanel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((opt) => opt.label.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  const resolveIcon = (opt: DropdownOption, iconSize: number) =>
    opt.icon ?? renderIcon?.(opt.value, iconSize) ?? null;

  const isMultiple = props.multiple === true;
  const allSelected =
    isMultiple &&
    (props.value === null ||
      (options.length > 0 && props.value.size >= options.length));

  const isSelected = (value: string) => {
    if (isMultiple) {
      return props.value === null || props.value.has(value);
    }
    return props.value === value;
  };

  const triggerLabel = (() => {
    if (isMultiple) {
      const selected = props.value;
      if (selected === null) return props.allLabel ?? placeholder;
      if (selected.size === 0) return placeholder;
      if (selected.size === 1) {
        return (
          options.find((opt) => selected.has(opt.value))?.label ?? placeholder
        );
      }
      return props.noun
        ? `${selected.size} ${props.noun}s`
        : `${selected.size} selected`;
    }
    return (
      options.find((opt) => opt.value === props.value)?.label ?? placeholder
    );
  })();

  const singleSelected = !isMultiple
    ? options.find((opt) => opt.value === props.value)
    : undefined;

  const selectedPreviewValues =
    isMultiple && props.value && renderIcon
      ? Array.from(props.value).slice(0, 3)
      : [];

  const showingAll =
    isMultiple ? props.value === null : props.value === "all";

  const allPreviewValues =
    props.allPreviewIcons && showingAll && renderIcon
      ? Array.isArray(props.allPreviewIcons)
        ? props.allPreviewIcons.slice(0, 3)
        : options
            .filter((opt) => opt.value !== "all")
            .slice(0, 3)
            .map((opt) => opt.value)
      : [];

  const previewStack = (values: string[]) => (
    <span className="flex items-center">
      {values.map((value, index) => (
        <span
          key={value}
          className={`overflow-hidden rounded-full ${
            index < values.length - 1 ? "-mr-1" : ""
          }`}
        >
          {renderIcon?.(value, metrics.iconSize + 4)}
        </span>
      ))}
    </span>
  );

  const triggerStyle: CSSProperties = {
    paddingInline: `${metrics.paddingX}px`,
    paddingBlock: `${metrics.paddingY}px`,
    fontSize: `${metrics.fontSize}px`,
    gap: `${metrics.gap}px`,
    borderRadius: `${metrics.radius}px`,
    ["--nd-dd-icon" as string]: `${metrics.iconSize}px`,
  };

  const toggleValue = (value: string) => {
    const opt = options.find((item) => item.value === value);
    if (opt?.disabled) return;
    if (isMultiple) {
      const next = new Set(
        props.value === null ? options.map((item) => item.value) : props.value,
      );
      if (next.has(value)) next.delete(value);
      else next.add(value);
      props.onChange(next.size === options.length ? null : next);
      return;
    }
    props.onChange(value);
    close();
  };

  const panelNode =
    open && panel && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            className={`fixed z-[110] flex flex-col overflow-hidden rounded-[18px] ${
              theme === "auto"
                ? "nd-gradient-border-auto "
                : theme === "dark"
                  ? "nd-gradient-border "
                  : ""
            }${themed(
              theme,
              "border border-solid border-[#2a274e]/10 bg-[#fbfaff] shadow-[0_12px_30px_-12px_rgba(42,39,78,0.12)]",
              "dark:border-0 dark:bg-[#0f1424]",
            )}`}
            style={{
              left: panel.left,
              top: panel.top,
              bottom: panel.bottom,
              width: panel.width,
              maxHeight: panel.maxHeight,
            }}
            role="listbox"
            aria-multiselectable={isMultiple || undefined}
          >
            <div className="flex min-h-0 flex-1 flex-col gap-[10px] px-[15px] py-[10px]">
              {searchable ? (
                <div
                  className={`flex shrink-0 items-center gap-2 border-b py-2 ${themed(
                    theme,
                    "border-[#2a274e]/10",
                    "dark:border-white/10",
                  )}`}
                >
                  <Search
                    size={16}
                    className={`shrink-0 ${themed(
                      theme,
                      "text-[#2a274e]/50",
                      "dark:text-white/50",
                    )}`}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search..."
                    className={`w-full bg-transparent text-[12px] font-medium focus:outline-none ${themed(
                      theme,
                      "text-[#2a274e] placeholder:text-[#2a274e]/50",
                      "dark:text-white dark:placeholder:text-white/50",
                    )}`}
                  />
                </div>
              ) : null}

              {isMultiple && props.selectAll !== false ? (
                <button
                  type="button"
                  onClick={() => {
                    props.onChange(allSelected ? new Set() : null);
                  }}
                  className="flex shrink-0 items-center justify-between py-0.5 pr-0.5"
                >
                  <span
                    className={`text-[12px] font-medium ${themed(
                      theme,
                      "text-[#2a274e]/50",
                      "dark:text-white/50",
                    )}`}
                  >
                    Select all
                  </span>
                  <Checkbox checked={Boolean(allSelected)} theme={theme} />
                </button>
              ) : null}

              <div className="scrollbar-hide flex max-h-[360px] min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto pr-0.5">
                {filtered.length === 0 ? (
                  <div
                    className={`py-2 text-center text-[12px] ${themed(
                      theme,
                      "text-[#2a274e]/50",
                      "dark:text-white/50",
                    )}`}
                  >
                    Nothing found
                  </div>
                ) : (
                  filtered.map((opt) => {
                    const selected = isSelected(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        aria-disabled={opt.disabled || undefined}
                        disabled={opt.disabled}
                        onClick={() => toggleValue(opt.value)}
                        className={`flex items-center justify-between gap-2 ${
                          opt.disabled ? "cursor-not-allowed opacity-40" : ""
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {resolveIcon(opt, 20)}
                          <span
                            className={`truncate text-[12px] font-medium ${
                              selected && !isMultiple
                                ? "text-[#8874ff]"
                                : themed(
                                    theme,
                                    "text-[#2a274e]/60",
                                    "dark:text-white/50",
                                  )
                            }`}
                          >
                            {opt.label}
                          </span>
                        </span>
                        {isMultiple ? (
                          <Checkbox checked={selected} theme={theme} />
                        ) : selected ? (
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

  const triggerClass = [
    "relative items-center font-medium transition-colors",
    block
      ? themed(
          theme,
          "flex w-full border border-[#2a274e]/10 bg-white",
          "dark:flex dark:w-full dark:border dark:border-white/10 dark:bg-white/[0.02]",
        )
      : theme === "auto"
        ? "nd-ring-dark-only inline-flex border border-solid border-[#2a274e]/10 bg-white dark:border-0 dark:bg-transparent"
        : themed(
            theme,
            "inline-flex border border-solid border-[#2a274e]/10 bg-white",
            "dark:inline-flex",
          ) + (theme === "dark" ? " nd-gradient-border" : ""),
    disabled
      ? themed(
          theme,
          "cursor-not-allowed text-[#2a274e]/30",
          "dark:cursor-not-allowed dark:text-white/30",
        )
      : block
        ? themed(
            theme,
            "cursor-pointer text-[#2a274e]/70 hover:text-[#2a274e]",
            "dark:cursor-pointer dark:text-white/70 dark:hover:text-white",
          )
        : themed(
            theme,
            "cursor-pointer text-[#2a274e]/60 hover:text-[#2a274e]",
            "dark:cursor-pointer dark:text-white/50 dark:hover:text-white/80",
          ),
  ].join(" ");

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
          if (open) {
            close();
            return;
          }
          updatePanel();
          setOpen(true);
        }}
        style={triggerStyle}
        className={triggerClass}
      >
        {trigger ?? (
          <>
            {selectedPreviewValues.length > 0
              ? previewStack(selectedPreviewValues)
              : !isMultiple &&
                  singleSelected &&
                  resolveIcon(singleSelected, metrics.iconSize) ? (
                  <span className="inline-flex shrink-0 [&_svg]:size-[var(--nd-dd-icon)]">
                    {resolveIcon(singleSelected, metrics.iconSize)}
                  </span>
                ) : null}
            <span
              className={`truncate ${block ? "min-w-0 flex-1 text-left" : "max-w-[160px]"}`}
            >
              {triggerLabel}
            </span>
            {allPreviewValues.length > 0
              ? previewStack(allPreviewValues)
              : null}
          </>
        )}
        <ChevronDown
          size={metrics.iconSize}
          className={`ml-auto shrink-0 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {panelNode}
    </div>
  );
}
