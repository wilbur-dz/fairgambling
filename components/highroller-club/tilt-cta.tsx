"use client";

import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

type TiltCtaProps = {
  children: ReactNode;
  className?: string;
};

/** Port of reference tilt card used for the bottom CTA. */
export function TiltCta({ children, className = "" }: TiltCtaProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, on: false });
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e: MouseEvent) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: -((py - 0.5) * 2 * 3.5),
      ry: (px - 0.5) * 7,
    });
    setGlare({ x: 100 * px, y: 100 * py, on: true });
  }, []);

  const onLeave = useCallback(() => {
    setHovered(false);
    setTilt({ rx: 0, ry: 0 });
    setGlare((g) => ({ ...g, on: false }));
  }, []);

  const cardStyle: CSSProperties = {
    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${hovered ? 0.997 : 1})`,
    transformStyle: "preserve-3d",
    transition: hovered
      ? "transform 100ms ease-out, box-shadow 200ms ease-out"
      : "transform 500ms cubic-bezier(.2,.8,.2,1), box-shadow 400ms ease-out",
    willChange: "transform",
  };

  const shadowClass = hovered
    ? "shadow-[0_20px_44px_-22px_rgba(42,39,78,0.26)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),0_20px_44px_-22px_rgba(0,0,0,0.6)]"
    : "shadow-[0_10px_30px_-14px_rgba(42,39,78,0.18)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_30px_-14px_rgba(0,0,0,0.5)]";

  return (
    <div
      style={{ perspective: "900px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={cardRef}
        className={`light-element dark-element relative isolate overflow-hidden rounded-[24px] ${shadowClass} ${className}`}
        style={cardStyle}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[90px] bg-[rgba(136,116,255,0.14)] blur-[50px] dark:bg-[rgba(31,38,63,0.8)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 [--tilt-glare:rgba(42,39,78,0.07)] dark:[--tilt-glare:rgba(255,255,255,0.09)]"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, var(--tilt-glare), transparent 50%)`,
            opacity: glare.on ? 1 : 0,
          }}
        />
        <div className="relative z-10" style={{ transform: "translateZ(14px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
