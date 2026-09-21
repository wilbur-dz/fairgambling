"use client";

import { FileText, Gift, Megaphone, Star } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Tabs } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-is-mobile";

type CasinoTabsProps = {
  ratingScore: number | null;
  reviewAvg: number | null;
  reviewCount: number;
  complaintsCount: number;
  promotionsCount: number;
  ratingContent: ReactNode;
  reviewsContent: ReactNode;
  complaintsContent: ReactNode;
  promotionsContent: ReactNode;
};

/** Mini score ring used in the Rating tab (reference `r`). */
function ScoreRing({ pct }: { pct: number }) {
  const safe = Number.isFinite(pct) ? Math.min(1, Math.max(0, pct)) : 0;
  const circumference = 2 * Math.PI * 9;
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      className="size-4 shrink-0 md:size-[18px]"
      aria-hidden
    >
      <circle
        cx="11"
        cy="11"
        r={9}
        stroke="var(--nd-ring-track)"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="11"
        cy="11"
        r={9}
        stroke="var(--nd-accent-green)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${safe * circumference} ${circumference}`}
        transform="rotate(-90 11 11)"
      />
    </svg>
  );
}

function TabLabel({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5 md:gap-1">
      <span className="text-[10px] md:text-[13px]">{title}</span>
      <span className="flex items-center gap-1 md:gap-2">{children}</span>
    </span>
  );
}

const VALUE_CLASS = "text-[13px] font-bold leading-none md:text-[18px]";
const UNIT_CLASS =
  "text-[10px] opacity-60 md:text-[12px] dark:text-white/50 dark:opacity-100";

type CasinoTabBarProps = {
  active: string;
  onChange: (id: string) => void;
  ratingScore: number | null;
  reviewAvg: number | null;
  reviewCount: number;
  complaintsCount: number;
  promotionsCount: number;
};

/** Port of reference tab bar (`m` inside CasinoTabs module). */
function CasinoTabBar({
  active,
  onChange,
  ratingScore,
  reviewAvg,
  reviewCount,
  complaintsCount,
  promotionsCount,
}: CasinoTabBarProps) {
  const isMobile = useIsMobile();
  const score = ratingScore ?? 0;

  const tabs = [
    {
      id: "rating",
      label: (
        <TabLabel
          title={
            <>
              <span className="md:hidden">Rating</span>
              <span className="hidden md:inline">FairGambling Rating</span>
            </>
          }
        >
          <ScoreRing pct={score / 100} />
          <span className={VALUE_CLASS}>
            {ratingScore != null ? Math.round(score) : "—"}
          </span>
          <span className={UNIT_CLASS}>/ 100</span>
        </TabLabel>
      ),
    },
    {
      id: "reviews",
      label: (
        <TabLabel
          title={
            <>
              <span className="md:hidden">Reviews</span>
              <span className="hidden md:inline">User Reviews</span>
            </>
          }
        >
          <Star className="size-4 shrink-0 fill-[#FFCF2F] text-[#FFCF2F] md:size-[18px]" />
          <span className={VALUE_CLASS}>
            {reviewAvg != null ? reviewAvg.toFixed(1) : "—"}
          </span>
          <span className={UNIT_CLASS}>/ 5</span>
          {reviewCount > 0 ? (
            <span className={`${UNIT_CLASS} hidden md:inline`}>
              ({reviewCount})
            </span>
          ) : null}
        </TabLabel>
      ),
    },
    {
      id: "complaints",
      label: (
        <TabLabel title="Complaints">
          <Megaphone className="size-4 shrink-0 md:size-[18px]" />
          <span className={VALUE_CLASS}>{complaintsCount ?? 0}</span>
          <span className={`${UNIT_CLASS} hidden md:inline`}>Cases</span>
        </TabLabel>
      ),
    },
    {
      id: "promotions",
      label: (
        <TabLabel
          title={
            <>
              <span className="md:hidden">Promos</span>
              <span className="hidden md:inline">Promotions</span>
            </>
          }
        >
          <Gift className="size-4 shrink-0 md:size-[18px]" />
          <span className={VALUE_CLASS}>{promotionsCount}</span>
          <span className={`${UNIT_CLASS} hidden md:inline`}>Live</span>
        </TabLabel>
      ),
    },
  ];

  return (
    <Tabs
      theme="auto"
      size="lg"
      sizeConfig={
        isMobile
          ? { radius: 100, paddingX: 6, paddingY: 8, gap: 2, fontSize: 11 }
          : { radius: 100, paddingY: 9, fontSize: 13 }
      }
      fill
      variant="gradient"
      tabs={tabs}
      activeId={active}
      onChange={onChange}
      className="w-full"
    />
  );
}

/** Port of reference `CasinoTabs` (module `444084`). */
export function CasinoTabs({
  ratingScore,
  reviewAvg,
  reviewCount,
  complaintsCount,
  promotionsCount,
  ratingContent,
  reviewsContent,
  complaintsContent,
  promotionsContent,
}: CasinoTabsProps) {
  const [active, setActive] = useState("rating");

  return (
    <div className="flex flex-col gap-6">
      <CasinoTabBar
        active={active}
        onChange={setActive}
        ratingScore={ratingScore}
        reviewAvg={reviewAvg}
        reviewCount={reviewCount}
        complaintsCount={complaintsCount}
        promotionsCount={promotionsCount}
      />
      <div className={active === "rating" ? "flex flex-col gap-6" : "hidden"}>
        {ratingContent}
      </div>
      <div className={active === "reviews" ? "" : "hidden"}>{reviewsContent}</div>
      <div className={active === "complaints" ? "" : "hidden"}>
        {complaintsContent}
      </div>
      <div className={active === "promotions" ? "" : "hidden"}>
        {promotionsContent}
      </div>
    </div>
  );
}

export function CasinoTabPlaceholder({
  title,
  body,
  href,
  hrefLabel,
}: {
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="light-element dark-element flex flex-col items-start gap-3 rounded-[24px] p-6">
      <div className="flex items-center gap-2 text-[#2a274e] dark:text-white">
        <FileText size={18} className="opacity-60" />
        <h3 className="text-[16px] font-semibold">{title}</h3>
      </div>
      <p className="text-[14px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
        {body}
      </p>
      {href && hrefLabel ? (
        <a
          href={href}
          className="text-[14px] font-medium text-[#6b56e0] hover:underline dark:text-[#8874ff]"
        >
          {hrefLabel}
        </a>
      ) : null}
    </div>
  );
}
