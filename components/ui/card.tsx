import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "panel" | "glass";
  theme?: "auto" | "light" | "dark";
  blur?: boolean;
  ring?: boolean;
  padded?: boolean;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
};

export function Card({
  variant = "panel",
  theme = "auto",
  blur = false,
  ring = true,
  padded = true,
  className = "",
  contentClassName = "",
  children,
  ...rest
}: CardProps) {
  if (theme === "auto") {
    const shell =
      variant === "panel"
        ? "light-element dark-element relative rounded-[24px]"
        : `${ring ? "nd-gradient-border-auto " : ""}relative rounded-[20px] bg-white/[0.5] dark:bg-white/[0.01]`;

    return (
      <div
        className={`${shell} relative isolate overflow-hidden ${padded ? "p-4" : ""} ${className}`}
        {...rest}
      >
        {blur ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[90px] dark:block"
            style={{
              background: "rgba(31, 38, 63, 0.8)",
              filter: "blur(50px)",
            }}
          />
        ) : null}
        <div className={`relative z-10 ${contentClassName}`}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] ${padded ? "p-4" : ""} ${className}`}
      {...rest}
    >
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}
