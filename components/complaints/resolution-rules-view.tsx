import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { Card } from "@/components/ui/card";
import { ND_COLORS } from "@/lib/complaints/resolution-workflow";
import {
  RESOLUTION_CATEGORY_RULES,
  RESOLUTION_OUTCOMES,
  RESOLUTION_RULES_CLOSING,
  RESOLUTION_RULES_INTRO,
  RESOLUTION_RULES_META,
  RESOLUTION_RULES_STEPS,
} from "@/lib/complaints/rules-content";

const ink = "text-[#2a274e] dark:text-white";
const muted = "text-[rgba(42,39,78,0.65)] dark:text-white/60";

export function ResolutionRulesView() {
  return (
    <main className="flex flex-col gap-4 px-4 pb-8 pt-6 md:gap-6 md:px-6">
      <Link
        href="/complaints"
        className="inline-flex w-fit items-center gap-2 text-sm text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
      >
        <ArrowLeft size={16} />
        Back to Resolution Hub
      </Link>

      <Card variant="panel" blur contentClassName="flex flex-col gap-6 md:gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.55px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
            {RESOLUTION_RULES_META.subtitle}
          </p>
          <h1 className={`text-2xl font-semibold md:text-3xl ${ink}`}>
            {RESOLUTION_RULES_META.title}
          </h1>
          <p className={`text-sm ${muted}`}>
            Last updated: {RESOLUTION_RULES_META.lastUpdated}
          </p>
        </header>

        <div className={`flex flex-col gap-3 text-[15px] leading-relaxed ${muted}`}>
          {RESOLUTION_RULES_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <section>
          <h2 className={`mb-4 text-lg font-semibold ${ink}`}>How It Works</h2>
          <ol className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5">
            {RESOLUTION_RULES_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="nd-ring-dark-only rounded-[20px] border border-[rgba(42,39,78,0.08)] bg-white/[0.5] p-4 dark:border-0 dark:bg-white/[0.01]"
              >
                <span
                  className="mb-2 inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{
                    background: `linear-gradient(180deg, ${ND_COLORS.accent}, ${ND_COLORS.accentDeep})`,
                  }}
                >
                  {index + 1}
                </span>
                <p className={`text-[14px] font-semibold ${ink}`}>{step.title}</p>
                <p className={`mt-1 text-[13px] leading-snug ${muted}`}>
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={`mb-4 text-lg font-semibold ${ink}`}>Outcomes</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {RESOLUTION_OUTCOMES.map((outcome) => (
              <div
                key={outcome.label}
                className="nd-ring-dark-only rounded-[16px] border border-[rgba(42,39,78,0.08)] bg-white/[0.4] p-4 dark:border-0 dark:bg-white/[0.02]"
              >
                <ComplaintStatusBadge
                  status={
                    outcome.label === "Resolved"
                      ? "resolved"
                      : outcome.label === "Unresolved"
                        ? "unresolved"
                        : "rejected"
                  }
                  theme="auto"
                />
                <p className={`mt-3 text-[14px] leading-relaxed ${muted}`}>
                  {outcome.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {RESOLUTION_CATEGORY_RULES.map((section) => (
            <article key={section.title}>
              <h3 className={`mb-2 text-[16px] font-semibold ${ink}`}>
                {section.title}
              </h3>
              <div className={`flex flex-col gap-2 text-[14px] leading-relaxed ${muted}`}>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
                {section.bullets ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className={`flex flex-col gap-2 border-t border-[rgba(42,39,78,0.08)] pt-6 dark:border-white/[0.08] ${muted}`}>
          <h2 className={`text-lg font-semibold ${ink}`}>
            {RESOLUTION_RULES_CLOSING.publishHeading}
          </h2>
          <p className="text-[15px] leading-relaxed">
            {RESOLUTION_RULES_CLOSING.publishBody}
          </p>
          <h2 className={`mt-4 text-lg font-semibold ${ink}`}>
            {RESOLUTION_RULES_CLOSING.contactHeading}
          </h2>
          <p className="text-[15px] leading-relaxed">
            {RESOLUTION_RULES_CLOSING.contactBody}
          </p>
        </section>
      </Card>
    </main>
  );
}
