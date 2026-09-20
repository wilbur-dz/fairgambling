"use client";

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

export type ButtonVariant = "ghost" | "primary";
export type ButtonTheme = "dark" | "light" | "auto";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonSizeConfig = {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  iconSize: number;
  radius: number;
};

const SIZE_PRESETS: Record<ButtonSize, ButtonSizeConfig> = {
  sm: {
    fontSize: 14,
    paddingX: 14,
    paddingY: 9,
    gap: 8,
    iconSize: 18,
    radius: 999,
  },
  md: {
    fontSize: 14,
    paddingX: 16,
    paddingY: 12,
    gap: 8,
    iconSize: 20,
    radius: 999,
  },
  lg: {
    fontSize: 16,
    paddingX: 20,
    paddingY: 13,
    gap: 10,
    iconSize: 24,
    radius: 999,
  },
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  theme?: ButtonTheme;
  size?: ButtonSize;
  sizeConfig?: Partial<ButtonSizeConfig>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
};

function variantClass(variant: ButtonVariant, theme: ButtonTheme) {
  if (variant === "primary") return "nd-button--primary";
  if (theme === "light") return "nd-button--ghost-light";
  if (theme === "auto") return "nd-button--ghost-auto";
  return "nd-gradient-border";
}

export function Button({
  variant = "ghost",
  theme = "dark",
  size = "md",
  sizeConfig,
  leftIcon,
  rightIcon,
  className = "",
  children,
  type = "button",
  style,
  ...rest
}: ButtonProps) {
  const resolved = { ...SIZE_PRESETS[size], ...sizeConfig };
  const computedStyle: CSSProperties = {
    paddingInline: `${resolved.paddingX}px`,
    paddingBlock: `${resolved.paddingY}px`,
    fontSize: `${resolved.fontSize}px`,
    gap: `${resolved.gap}px`,
    borderRadius: `${resolved.radius}px`,
    ["--nd-btn-icon" as string]: `${resolved.iconSize}px`,
    ...style,
  };

  return (
    <button
      type={type}
      className={`nd-button ${variantClass(variant, theme)} relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium ${className}`}
      style={computedStyle}
      {...rest}
    >
      <span aria-hidden className="nd-button__pulse" />
      {leftIcon != null ? (
        <span className="relative z-[1] inline-flex shrink-0 [&_svg]:size-[var(--nd-btn-icon)]">
          {leftIcon}
        </span>
      ) : null}
      {children != null && children !== "" ? (
        <span className="relative z-[1]">{children}</span>
      ) : null}
      {rightIcon != null ? (
        <span className="relative z-[1] inline-flex shrink-0 [&_svg]:size-[var(--nd-btn-icon)]">
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}
