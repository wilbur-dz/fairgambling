"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { TimeLeftRing } from "@/components/complaints/time-left-ring";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Card } from "@/components/ui/card";
import { activeDeadline, timeLeft } from "@/lib/complaints/deadlines";
import {
  complaintCategoryLabel,
  formatComplaintAmount,
  formatComplaintOpenedDate,
  formatComplaintPublicId,
  formatComplaintRelative,
  stripHtmlTags,
} from "@/lib/complaints/display";
import type { PublicComplaintDetail } from "@/lib/complaints/types";

const ink = "text-[#2a274e] dark:text-white";
const muted = "text-[rgba(42,39,78,0.65)] dark:text-white/60";

type ComplaintDetailViewProps = {
  data: PublicComplaintDetail;
};

export function ComplaintDetailView({ data }: ComplaintDetailViewProps) {
  const { complaint, casino, statusEvents } = data;
  const deadline = activeDeadline(complaint.status, complaint);
  const left = timeLeft(deadline);
  const nowMs = Date.now();
  const remainingMs =
    deadline && nowMs
      ? Math.max(0, new Date(deadline).getTime() - nowMs)
      : 0;
  const percentRemaining =
    deadline && nowMs ? (remainingMs / 604_800_000) * 100 : 0;

  const description =
    complaint.description?.trim() ||
    complaint.caseSummary?.trim() ||
    null;

  return (
    <main className="flex flex-col gap-4 px-4 pb-8 pt-6 md:gap-6 md:px-6">
      <Link
        href="/complaints"
        className="inline-flex w-fit items-center gap-2 text-sm text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
      >
        <ArrowLeft size={16} />
        Back to Resolution Hub
      </Link>

      <Card variant="panel" blur contentClassName="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className={`text-sm font-medium ${muted}`}>
              {formatComplaintPublicId(complaint.id)}
            </p>
            <h1 className={`mt-1 text-xl font-semibold md:text-2xl ${ink}`}>
              {stripHtmlTags(complaint.title ?? "Complaint")}
            </h1>
            <p className={`mt-2 text-sm ${muted}`}>
              {complaintCategoryLabel(complaint.category)}
              {complaint.displayHandle
                ? ` · ${complaint.displayHandle}`
                : null}
            </p>
          </div>
          <ComplaintStatusBadge status={complaint.status} theme="auto" />
        </div>

        {casino ? (
          <Link
            href={`/${casino.slug}`}
            className="flex w-fit items-center gap-2.5 rounded-2xl border border-[rgba(42,39,78,0.08)] px-3 py-2 transition-opacity hover:opacity-80 dark:border-white/[0.08]"
          >
            <AnalyticsCasinoIcon
              casinoName={casino.name}
              logoUrl={casino.logoUrl ?? undefined}
              size={32}
              theme="auto"
            />
            <span className={`text-[15px] font-medium ${ink}`}>{casino.name}</span>
          </Link>
        ) : null}

        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <dt className={`text-[11px] uppercase tracking-wide ${muted}`}>
              Amount
            </dt>
            <dd className={`mt-1 text-[15px] font-medium ${ink}`}>
              {complaint.disputedAmount
                ? `$${formatComplaintAmount(complaint.disputedAmount)} ${complaint.disputedCurrency ?? ""}`.trim()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className={`text-[11px] uppercase tracking-wide ${muted}`}>
              Opened
            </dt>
            <dd className={`mt-1 text-[15px] ${ink}`}>
              {formatComplaintOpenedDate(complaint.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className={`text-[11px] uppercase tracking-wide ${muted}`}>
              Last activity
            </dt>
            <dd className={`mt-1 text-[15px] ${ink}`}>
              {formatComplaintRelative(complaint.updatedAt)}
            </dd>
          </div>
          <div>
            <dt className={`text-[11px] uppercase tracking-wide ${muted}`}>
              Time left
            </dt>
            <dd className={`mt-1 flex items-center gap-2 text-[15px] ${ink}`}>
              {deadline ? (
                <>
                  <TimeLeftRing
                    tone={left.tone}
                    percentRemaining={percentRemaining}
                    theme="auto"
                  />
                  {left.label}
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        {description ? (
          <section>
            <h2 className={`mb-2 text-[15px] font-semibold ${ink}`}>Summary</h2>
            <p className={`whitespace-pre-wrap text-[14px] leading-relaxed ${muted}`}>
              {stripHtmlTags(description)}
            </p>
          </section>
        ) : null}

        {complaint.verdict ? (
          <section className="rounded-2xl border border-[rgba(42,39,78,0.08)] bg-white/[0.35] p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <h2 className={`text-[15px] font-semibold ${ink}`}>Verdict</h2>
            <p className={`mt-2 text-[14px] font-medium ${ink}`}>
              {complaint.verdict}
            </p>
            {complaint.verdictReasoning ? (
              <p className={`mt-2 text-[14px] leading-relaxed ${muted}`}>
                {stripHtmlTags(complaint.verdictReasoning)}
              </p>
            ) : null}
          </section>
        ) : null}

        {statusEvents.length > 0 ? (
          <section>
            <h2 className={`mb-3 text-[15px] font-semibold ${ink}`}>Timeline</h2>
            <ol className="flex flex-col gap-3">
              {statusEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex gap-3 border-l-2 border-[rgba(136,116,255,0.35)] pl-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-medium ${ink}`}>
                      {event.fromStatus
                        ? `${event.fromStatus} → ${event.toStatus}`
                        : event.toStatus}
                    </p>
                    {event.reason ? (
                      <p className={`mt-0.5 text-[13px] ${muted}`}>
                        {event.reason}
                      </p>
                    ) : null}
                    <p className={`mt-1 text-[12px] ${muted}`}>
                      {formatComplaintRelative(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <p className={`text-[13px] ${muted}`}>
          Need the full mediation thread?{" "}
          <Link
            href="/complaints/rules"
            className="font-medium text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
          >
            Read how resolution works
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
