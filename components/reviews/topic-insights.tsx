"use client";

import { ArrowUpRight } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TopicInsight } from "@/lib/reviews/data";

function TopicCard({ topic }: { topic: TopicInsight }) {
  const tone = topic.positive
    ? "text-[#2e9a98] dark:text-[#5dc9c7]"
    : "text-[#ff6060]";
  const bar = topic.positive
    ? "bg-[#2e9a98] dark:bg-[#5dc9c7]"
    : "bg-[#ff6060]";
  const pct = topic.positive
    ? topic.positivePct
    : (topic.negativePct ?? Math.max(0, 100 - topic.positivePct));

  return (
    <Card
      variant="glass"
      theme="auto"
      padded={false}
      className="px-4 py-3 md:p-4"
      contentClassName="flex flex-col gap-4 md:gap-6"
    >
      <div className="flex flex-col gap-3 md:gap-4">
        <h3 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
          {topic.label}
        </h3>
        <p className="text-[14px] text-[#2a274e]/60 dark:text-white/50">
          Mentioned in{" "}
          <span className="font-semibold">
            {topic.mentions.toLocaleString()}
          </span>{" "}
          reviews
        </p>
      </div>
      <div className="flex flex-col gap-3 md:gap-4">
        <p className={`text-[14px] font-semibold ${tone}`}>
          {pct}% {topic.positive ? "Positive" : "Negative"}
        </p>
        <div className="w-full rounded-[100px] bg-[#2a274e]/10 dark:bg-white/10">
          <div
            className={`h-[6px] rounded-[10px] ${bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {topic.topCasinos.length > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#2a274e]/60 dark:text-white/50">
            Top:
          </span>
          <div className="flex items-center gap-2">
            {topic.topCasinos.map((casino) => (
              <span key={casino.slug || casino.name} className="size-5 shrink-0">
                <AnalyticsCasinoIcon
                  casinoName={casino.name}
                  size={20}
                  theme="auto"
                />
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

type TopicInsightsProps = {
  topics: TopicInsight[];
  onWriteReview: () => void;
};

/** Port of reference What Players Talk About (`Z`). */
export function TopicInsightsSection({
  topics,
  onWriteReview,
}: TopicInsightsProps) {
  const withMentions = topics.filter((t) => t.mentions > 0);
  const visible = [
    ...withMentions.filter((t) => t.positive).slice(0, 4),
    ...withMentions.filter((t) => !t.positive).slice(0, 2),
  ];

  if (visible.length === 0) return null;

  return (
    <Card variant="panel" blur>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
            What Players Talk About
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={onWriteReview}>
              Write a Review
            </Button>
            <Button
              variant="ghost"
              theme="auto"
              size="sm"
              rightIcon={<ArrowUpRight />}
            >
              View All
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-6 lg:grid-cols-3">
          {visible.map((topic) => (
            <TopicCard key={topic.key} topic={topic} />
          ))}
        </div>
      </div>
    </Card>
  );
}
