"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  AffiliateIcon,
  IconTile,
  SectionHeader,
} from "@/components/affiliate/chrome";
import { STATS, STEPS } from "@/lib/affiliate/data";

function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  const run = useCallback(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      setValue(
        Math.round((1 - Math.pow(1 - t, 4)) * target).toLocaleString("en-US"),
      );
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [duration, target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) run();
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [run]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/** Port of reference `HowItWorks`. */
export function HowItWorks() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="How it Works" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-col gap-4 rounded-[20px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-4 py-3 backdrop-blur-[20px] md:gap-6 md:p-4 dark:border-0 dark:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <IconTile>
                <AffiliateIcon iconSrc={step.iconSrc} />
              </IconTile>
              <span className="text-[13px] font-semibold tabular-nums text-[rgba(42,39,78,0.25)] dark:text-white/20">
                0{i + 1}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-[#2a274e] dark:text-white">
                {step.title}
              </h3>
              <p className="text-[12px] leading-relaxed text-[rgba(42,39,78,0.5)] dark:text-white/50">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-stretch justify-center gap-3 rounded-[16px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-4 py-4 backdrop-blur-[35.5px] sm:gap-[52px] dark:border-[0.5px] dark:border-white/20 dark:bg-white/[0.01]">
        {STATS.map((stat, i) => (
          <Fragment key={stat.label}>
            {i > 0 ? (
              <span className="hidden h-9 w-px shrink-0 bg-[rgba(42,39,78,0.15)] sm:block dark:bg-[#344051]" />
            ) : null}
            <div className="flex flex-1 flex-col items-center gap-1 text-center sm:flex-initial sm:flex-row sm:items-center sm:gap-3 sm:text-left">
              <span className="hidden shrink-0 sm:block">
                <AffiliateIcon
                  icon={stat.icon}
                  iconSrc={stat.iconSrc}
                  size={24}
                />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold tabular-nums text-[#2a274e] sm:text-sm dark:text-white">
                  <AnimatedCounter
                    target={stat.target}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </span>
                <span className="text-[10px] leading-tight text-[rgba(42,39,78,0.55)] sm:whitespace-nowrap sm:text-[11px] dark:text-[#97a1af]">
                  {stat.label}
                </span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
