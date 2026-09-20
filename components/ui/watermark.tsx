import type { ReactNode } from "react";

type WatermarkProps = {
  children?: ReactNode;
  opacity?: number;
  logoWidth?: number;
  className?: string;
  repeat?: number;
  behind?: boolean;
  theme?: "light" | "dark" | "auto";
};

/** Port of reference `Watermark`. */
export function Watermark({
  children,
  opacity = 0.07,
  logoWidth = 240,
  className = "",
  repeat = 1,
  behind = false,
  theme,
}: WatermarkProps) {
  const count = Math.max(1, Math.floor(repeat));
  const alignClass =
    count === 1
      ? "items-center justify-center"
      : "flex-col items-center justify-around";

  const logos = Array.from({ length: count }, (_, index) => (
    <span key={index} className="inline-flex">
      {theme === "light" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/fairgambling-text.svg"
          alt=""
          draggable={false}
          style={{ width: logoWidth, opacity }}
        />
      ) : theme === "dark" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/icons/fairgambling-text-dark.svg"
          alt=""
          draggable={false}
          style={{ width: logoWidth, opacity: 1.4 * opacity }}
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/fairgambling-text.svg"
            alt=""
            draggable={false}
            className="dark:hidden"
            style={{ width: logoWidth, opacity }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/fairgambling-text-dark.svg"
            alt=""
            draggable={false}
            className="hidden dark:block"
            style={{ width: logoWidth, opacity: 1.4 * opacity }}
          />
        </>
      )}
    </span>
  ));

  return (
    <div className={`relative ${className}`}>
      {behind ? <div className="relative z-[1]">{children}</div> : children}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex select-none ${alignClass}`}
        style={{ zIndex: behind ? 0 : 10 }}
      >
        {logos}
      </div>
    </div>
  );
}
