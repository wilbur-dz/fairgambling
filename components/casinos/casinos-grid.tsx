"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  DollarSign,
  Star,
  Ticket,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RatingGauge } from "@/components/ui/rating-gauge";
import { badgeLabel, CATEGORY_LABELS } from "@/lib/casinos/categories";
import {
  categoryBarsForCasino,
  licenseImageSrc,
  type OverviewCasino,
} from "@/lib/casinos/data";
import {
  getCategoryScoreColor,
  getTotalScoreColor,
} from "@/lib/casinos/score-color";

const KYC_COLORS: Record<string, string> = {
  "No KYC": "#FB3748",
  "Light KYC": "#F6B51E",
  "Full KYC": "#1FC16B",
};

const PF_COLORS: Record<string, string> = {
  "Provably Fair": "#1FC16B",
  "Semi-Fair": "#F6B51E",
  "Not Fair": "#FB3748",
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[rgba(42,39,78,0.06)] px-2 py-1 text-[10px] font-medium leading-[15px] dark:bg-white/10"
      style={{ color: "var(--nd-tag-text, rgba(42,39,78,0.75))" }}
    >
      {children}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-[rgba(42,39,78,0.05)] px-2.5 py-1 dark:bg-white/10">
      <span
        className="shrink-0 text-[11px] font-medium"
        style={{ color: "var(--nd-dim, rgba(42,39,78,0.5))" }}
      >
        {label}
      </span>
      <span className="truncate text-[13px] font-semibold text-[#2a274e] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function StatRow({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="flex items-center gap-[23px]">
      <span
        className="w-[160px] shrink-0 text-[12px] font-medium leading-[16.5px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        {label}
      </span>
      <div
        className="hidden h-7 w-px shrink-0 md:block"
        style={{ backgroundColor: "var(--nd-divider, rgba(42,39,78,0.12))" }}
      />
      <div className="flex flex-1 gap-2">
        {items.map((item) => (
          <StatPill key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  const color = getCategoryScoreColor(score);
  return (
    <div className="flex items-center gap-3 md:gap-[23px]">
      <span
        className="w-[120px] shrink-0 truncate text-[12px] font-medium leading-[16.5px] md:w-[160px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        {label}
      </span>
      <div
        className="hidden h-4 w-px shrink-0 md:block"
        style={{ backgroundColor: "var(--nd-divider, rgba(42,39,78,0.12))" }}
      />
      <div className="flex flex-1 items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(42,39,78,0.08)] dark:bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(score / 10) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span
          className="w-8 shrink-0 text-right text-[12px] font-semibold tabular-nums"
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
        <span
          className="w-7 shrink-0 text-right text-[10px]"
          style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
        >
          {weight}
        </span>
      </div>
    </div>
  );
}

function CasinoGridCardExpanded({ casino }: { casino: OverviewCasino }) {
  const router = useRouter();
  const bars = categoryBarsForCasino(casino).map((bar) => ({
    ...bar,
    label: CATEGORY_LABELS[bar.key] ?? bar.label,
  }));
  const depositItems = [
    { label: "7D", value: casino.depositVolume7d },
    { label: "90D", value: casino.depositVolume90d },
    { label: "30D", value: casino.depositVolume30d },
    { label: "365D", value: casino.depositVolume365d },
  ];
  const hasSports =
    casino.sportsbook.name !== "None" && casino.sportsbook.name !== "No";
  const gameItems = [
    { label: "Originals", value: String(casino.numOriginals) },
    {
      label: "House Edge",
      value:
        casino.avgHouseEdge != null ? `${casino.avgHouseEdge}%` : "—",
    },
    { label: "Providers", value: `${casino.totalProviders}+` },
    {
      label: "Sports Edge",
      value:
        hasSports && casino.avgVigSports != null
          ? `${casino.avgVigSports}%`
          : "—",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-[16.5px] pb-4 pt-1">
      <div className="hidden flex-col gap-4 md:flex">
        <StatRow label="Deposit Volume" items={depositItems} />
        <StatRow label="Games" items={gameItems} />
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {bars.map((bar) => (
          <CategoryBar
            key={bar.key}
            label={bar.label}
            score={bar.score}
            weight={bar.weight}
          />
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <Button
          variant="ghost"
          theme="auto"
          rightIcon={<ArrowUpRight />}
          onClick={() => router.push(`/${casino.slug}`)}
        >
          Read Full Review
        </Button>
      </div>
    </div>
  );
}

function CasinoGridCard({
  casino,
  rank,
}: {
  casino: OverviewCasino;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = "text-[#2a274e] dark:text-white";
  const scoreColor = getTotalScoreColor(casino.fgRating);
  const hasReviews =
    (casino.reviewCount ?? 0) > 0 && casino.userReviews > 0;
  const licenseSrc = licenseImageSrc(casino.license.icon);

  const rankBadge = (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border text-[12px] font-medium"
      style={{
        borderColor: "rgba(142,142,255,0.1)",
        color: "var(--nd-muted, rgba(42,39,78,0.55))",
      }}
    >
      #{rank}
    </div>
  );

  const identity = (
    <div className="flex w-[160px] shrink-0 items-center gap-3">
      {rankBadge}
      <div className="size-9 shrink-0">
        <AnalyticsCasinoIcon
          casinoName={casino.name}
          size={36}
          theme="auto"
          logoUrl={casino.logoUrl}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <span className={`truncate text-[14px] font-semibold ${text}`}>
          {casino.name}
        </span>
        <span
          className="text-[11px] font-normal leading-[16.5px]"
          style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
        >
          Est. {casino.founded ?? "—"}
        </span>
      </div>
    </div>
  );

  const ratingBlock = (
    <div className="flex shrink-0 items-center gap-1.5">
      <span
        className="text-[12px] font-medium leading-[16.5px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        Rating
      </span>
      {casino.fgPending ? (
        <span className="rounded-full border border-[rgba(42,39,78,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.5)] dark:border-white/15 dark:text-white/50">
          Soon
        </span>
      ) : (
        <RatingGauge
          value={casino.fgRating}
          maxValue={100}
          color={scoreColor}
        />
      )}
    </div>
  );

  const reviewsBlock = (
    <div className="flex w-[130px] shrink-0 items-center gap-1">
      <span
        className="text-[12px] font-medium leading-[16.5px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        Reviews
      </span>
      {hasReviews ? (
        <>
          <Star size={14} className="text-[#FFCF2F]" fill="currentColor" />
          <span className={`text-[14px] font-medium ${text}`}>
            {casino.userReviews.toFixed(1)}
          </span>
          <span
            className="text-[12px] font-medium leading-[16.5px]"
            style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
          >
            ({casino.reviewCount})
          </span>
        </>
      ) : (
        <span
          className="text-[12px]"
          style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
        >
          —
        </span>
      )}
    </div>
  );

  const volBlock = (
    <div className="flex w-[120px] shrink-0 items-center gap-1.5">
      <span
        className="whitespace-nowrap text-[12px] font-medium leading-[16.5px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        Vol 30D
      </span>
      <span className={`text-[14px] font-medium ${text}`}>
        {casino.depositVolume30d}
      </span>
    </div>
  );

  const tags = (
    <>
      <span
        className="shrink-0 text-[12px] font-medium leading-[16.5px]"
        style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
      >
        Bonus
      </span>
      {casino.bonusRating > 0 ? (
        <span className="inline-flex shrink-0 items-center rounded-[6px] bg-[#1f9d57]/10 px-2 py-1 text-[12px] font-medium leading-none text-[#1f9d57] dark:bg-[rgba(0,255,134,0.1)] dark:text-[#00ff86]">
          {casino.bonusRating.toFixed(1)}
        </span>
      ) : (
        <span
          className="shrink-0 text-[12px] font-medium leading-none"
          style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
        >
          —
        </span>
      )}
      <Tag>
        {licenseSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={licenseSrc}
            alt={casino.license.name}
            className="size-3 object-contain"
          />
        ) : null}
        <span className="hidden md:inline">{casino.license.name}</span>
      </Tag>
      <Tag>
        <Dot color={KYC_COLORS[casino.kyc] ?? "var(--nd-muted, #888)"} />
        {badgeLabel(casino.kyc)}
      </Tag>
      <Tag>
        <Dot
          color={PF_COLORS[casino.provablyFair] ?? "var(--nd-muted, #888)"}
        />
        {badgeLabel(casino.provablyFair)}
      </Tag>
      <Tag>
        {casino.avgHouseEdge != null
          ? `${casino.avgHouseEdge}% Edge`
          : "—"}
      </Tag>
    </>
  );

  const expandBtn = (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-label={expanded ? "Collapse" : "Expand"}
      className="flex size-8 shrink-0 items-center justify-center rounded-[28px] bg-[rgba(142,142,255,0.1)] text-[rgba(42,39,78,0.6)] transition-colors hover:text-[#2a274e] dark:text-white/70 dark:hover:text-white"
    >
      <ChevronDown
        size={16}
        className={`transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <Card
      variant="glass"
      theme="auto"
      padded={false}
      className="rounded-[16px]"
    >
      <div className="hidden items-center gap-[23px] p-[16.5px] md:flex">
        <Link href={`/${casino.slug}`} prefetch={false} className="shrink-0">
          {identity}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="flex min-w-0 flex-1 items-center gap-[23px] p-0 text-left"
        >
          <div
            className="h-9 w-px shrink-0"
            style={{
              backgroundColor: "var(--nd-divider, rgba(42,39,78,0.12))",
            }}
          />
          {ratingBlock}
          {reviewsBlock}
          {volBlock}
          <div className="flex min-w-[388px] flex-1 items-center gap-1.5">
            {tags}
          </div>
        </button>
        {expandBtn}
      </div>

      <div className="flex flex-col gap-3 p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/${casino.slug}`}
            prefetch={false}
            className="flex min-w-0 items-center gap-3"
          >
            {rankBadge}
            <div className="size-9 shrink-0">
              <AnalyticsCasinoIcon
                casinoName={casino.name}
                size={36}
                theme="auto"
                logoUrl={casino.logoUrl}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className={`truncate text-[14px] font-semibold ${text}`}>
                {casino.name}
              </span>
              <span
                className="text-[11px] leading-[16.5px]"
                style={{ color: "var(--nd-muted, rgba(42,39,78,0.55))" }}
              >
                Est. {casino.founded ?? "—"}
              </span>
            </div>
          </Link>
          {expandBtn}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-col gap-3 p-0 text-left"
        >
          <div className="flex w-full items-center justify-between gap-2">
            {ratingBlock}
            {hasReviews ? (
              <span
                className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-medium ${text}`}
              >
                <Star size={13} className="text-[#FFCF2F]" fill="currentColor" />
                {casino.userReviews.toFixed(1)}
                <span style={{ color: "var(--nd-muted)" }}>
                  ({casino.reviewCount})
                </span>
              </span>
            ) : null}
            <span
              className={`shrink-0 whitespace-nowrap text-[13px] font-medium ${text}`}
            >
              <span style={{ color: "var(--nd-muted)" }}>Vol 30D </span>
              {casino.depositVolume30d}
            </span>
          </div>
          <div className="scrollbar-hide -mx-4 flex w-[calc(100%+2rem)] items-center gap-1.5 overflow-x-auto px-4">
            {tags}
          </div>
        </button>
      </div>

      {expanded ? <CasinoGridCardExpanded casino={casino} /> : null}
    </Card>
  );
}

const AFFILIATE_PERKS = [
  { icon: DollarSign, label: "Up to 30% Wager Share" },
  { icon: Trophy, label: "Weekly Leaderboard" },
  { icon: Ticket, label: "Exclusive Bonus Codes" },
  { icon: TrendingUp, label: "Wager Tracking" },
];

function CasinosAffiliateBanner() {
  const router = useRouter();
  return (
    <Card
      variant="glass"
      theme="auto"
      padded={false}
      className="rounded-[16px] p-4"
    >
      <div className="relative flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[265px] -left-[61.5px] h-[344px] w-[422px] bg-[linear-gradient(180deg,rgba(136,116,255,0.55),rgba(136,116,255,0.35))] blur-[90px] dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5),rgba(52,0,107,0.5))]"
        />
        <div className="relative z-10 flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[16px] font-semibold leading-tight text-[#2a274e] dark:text-white">
              Earn Wager Share on Every Bet
            </h3>
            <p className="text-[13px] font-normal leading-snug text-[rgba(42,39,78,0.7)] dark:text-white/70">
              Play with our code at any supported casino and start earning
              automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {AFFILIATE_PERKS.map(({ icon: IconCmp, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-[rgba(42,39,78,0.08)] bg-[rgba(42,39,78,0.04)] px-2.5 py-1 text-[11px] font-medium leading-none text-[rgba(42,39,78,0.8)] dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/80"
              >
                <IconCmp
                  size={11}
                  className="text-[rgba(42,39,78,0.7)] dark:text-white/80"
                />
                {label}
              </span>
            ))}
          </div>
        </div>
        <Button
          variant="primary"
          className="relative z-10 shrink-0"
          sizeConfig={{
            paddingX: 20,
            paddingY: 9,
            gap: 6,
            iconSize: 14,
            fontSize: 13,
          }}
          rightIcon={<ArrowUpRight />}
          onClick={() => router.push("/affiliate")}
        >
          Earn Wager Share
        </Button>
      </div>
    </Card>
  );
}

function GridSkeleton() {
  return (
    <div className="relative h-[69px] animate-pulse rounded-[16px] border border-[#e4e4e7] bg-[#e4e4e7]/30 backdrop-blur-[35.5px] dark:border-0 dark:bg-white/[0.02]" />
  );
}

/** Reference `H` — ranked casino cards with affiliate insert. */
export function CasinosGrid({
  casinos,
  loading,
}: {
  casinos: OverviewCasino[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 10 }, (_, i) => (
          <GridSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {casinos.map((casino, index) => (
        <div key={casino.id} className="contents">
          <CasinoGridCard casino={casino} rank={casino.rank} />
          {index === 7 ? <CasinosAffiliateBanner /> : null}
        </div>
      ))}
    </div>
  );
}
