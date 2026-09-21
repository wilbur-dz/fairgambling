"use client";

import Link from "next/link";
import {
  ClipboardCheck,
  FileUp,
  Handshake,
  HelpCircle,
  Megaphone,
  MessageSquareReply,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getResolutionHowItWorksClient } from "@/lib/complaints/api";
import {
  DEFAULT_RESOLUTION_HOW_IT_WORKS,
  ND_COLORS,
  type ResolutionHowItWorksContent,
  type ResolutionWorkflowIconKey,
  type ResolutionWorkflowStep,
} from "@/lib/complaints/resolution-workflow";

const ICONS: Record<ResolutionWorkflowIconKey, LucideIcon> = {
  "file-up": FileUp,
  "clipboard-check": ClipboardCheck,
  "message-square-reply": MessageSquareReply,
  handshake: Handshake,
  megaphone: Megaphone,
};

function StepCard({
  step,
  index,
}: {
  step: ResolutionWorkflowStep;
  index: number;
}) {
  const Icon = ICONS[step.icon];

  return (
    <li>
      <div className="nd-ring-dark-only relative h-full rounded-[20px] border border-[rgba(42,39,78,0.08)] bg-white/[0.5] dark:border-0 dark:bg-white/[0.01]">
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white"
              style={{
                background: `linear-gradient(180deg, ${ND_COLORS.accent}, ${ND_COLORS.accentDeep})`,
              }}
            >
              <Icon size={14} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/30">
              Step {index + 1}
            </span>
          </div>
          <span className="text-[14px] font-semibold text-[#2a274e] dark:text-white">
            {step.title}
          </span>
          <span className="text-[12px] leading-snug text-[rgba(42,39,78,0.6)] dark:text-white/55">
            {step.description}
          </span>
          {step.liveStat ? (
            <span className="text-[11px] font-medium tabular-nums text-[#6b56e0] dark:text-[#8E8EFF]">
              {step.liveStat}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function StepsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index}>
          <div className="h-[132px] animate-pulse rounded-[20px] bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.04]" />
        </li>
      ))}
    </>
  );
}

/** Port of reference complaints `HowItWorks` (114224) with live API stats. */
export function ResolutionHowItWorks() {
  const [content, setContent] = useState<ResolutionHowItWorksContent>(
    DEFAULT_RESOLUTION_HOW_IT_WORKS,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getResolutionHowItWorksClient()
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        if (!cancelled) setContent(DEFAULT_RESOLUTION_HOW_IT_WORKS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card
      variant="panel"
      blur
      contentClassName="flex flex-col gap-4 md:gap-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 text-[16px] font-medium text-[#2a274e] md:text-[18px] dark:text-white">
          {content.heading}
        </h2>
        <Link
          href={content.judgeHref}
          className="relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-[#6b56e0] transition-colors nd-gradient-border-light nd-ring-dark-only hover:text-[#2a274e] md:gap-2 md:px-4 md:py-2.5 md:text-[14px] dark:text-[#8E8EFF] dark:hover:text-white"
        >
          <HelpCircle size={16} />
          {content.judgeLabel}
        </Link>
      </div>

      <ol className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5">
        {loading
          ? StepsSkeleton()
          : content.steps.map((step, index) => (
              <StepCard key={`${step.title}-${index}`} step={step} index={index} />
            ))}
      </ol>
    </Card>
  );
}
