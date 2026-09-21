import { ChevronRight, DollarSign, Link2, Trophy, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from "@/lib/leaderboard/data";

const STEP_ICONS: Record<HowItWorksStep["icon"], LucideIcon> = {
  "user-plus": UserPlus,
  link: Link2,
  dollar: DollarSign,
  trophy: Trophy,
};

/** Four-step glass cards explaining how the leaderboard works. */
export function HowItWorks() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-[#2a274e] md:text-xl dark:text-white">
        How It Works
      </h2>
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-0">
        {HOW_IT_WORKS_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step.icon];
          return (
            <div key={step.id} className="contents">
              <Card
                variant="glass"
                padded={false}
                className="flex h-full flex-col p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#8874ff]/12">
                    <Icon
                      size={16}
                      className="text-[#6b56e0] dark:text-[#8874ff]"
                    />
                  </span>
                  <h3 className="text-[15px] font-semibold text-[#2a274e] dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.6)] dark:text-white/60">
                  {step.description}
                </p>
              </Card>
              {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                <div className="hidden items-center justify-center px-2 lg:flex">
                  <div className="flex items-center gap-1">
                    <div className="w-6 border-t border-dashed border-[rgba(42,39,78,0.2)] dark:border-white/20" />
                    <ChevronRight
                      size={12}
                      className="shrink-0 text-[rgba(42,39,78,0.3)] dark:text-white/30"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
