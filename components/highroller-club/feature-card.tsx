import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  desc?: string;
  step?: number;
  className?: string;
};

/** Port of reference feature / how-it-works card. */
export function FeatureCard({
  icon,
  title,
  desc,
  step,
  className = "",
}: FeatureCardProps) {
  return (
    <Card
      variant="panel"
      blur
      padded={false}
      className={`group h-full overflow-hidden ${className}`}
    >
      <div className="relative flex h-full flex-col gap-4 p-5">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full bg-[#8874ff] opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-25"
        />
        <div className="relative flex items-start justify-between">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-b from-[#9a80f9] to-[#5a3fd6] text-white shadow-[0_4px_16px_rgba(136,116,255,0.35)] ring-1 ring-white/10 [&_svg]:size-5">
            {icon}
          </span>
          {step != null ? (
            <span className="text-[20px] font-semibold leading-none text-[rgba(42,39,78,0.15)] dark:text-white/15">
              {String(step).padStart(2, "0")}
            </span>
          ) : null}
        </div>
        <div className="relative flex flex-col gap-1.5">
          <h3 className="text-[16px] font-semibold leading-snug text-[#2a274e] dark:text-white">
            {title}
          </h3>
          {desc ? (
            <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.55)] dark:text-white/55">
              {desc}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
