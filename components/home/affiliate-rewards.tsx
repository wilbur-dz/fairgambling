"use client";

import { ArrowUpRight, ChevronRight, DollarSign, Trophy, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { ClickNav } from "@/components/ui/click-nav";

const AFFILIATE_HREF = "/affiliate";

type RewardStep = {
  n: string;
  icon: ReactNode;
  title: string;
  desc: string;
};

const REWARD_STEPS: RewardStep[] = [
  {
    n: "#1",
    icon: <UserPlus size={16} />,
    title: "Create your account with our code",
    desc: "Sign up at any supported casino with our referral code",
  },
  {
    n: "#2",
    icon: <DollarSign size={16} />,
    title: "Earn up to 30% Wager Share",
    desc: "Get a share of every wager you place, win or lose",
  },
  {
    n: "#3",
    icon: <Trophy size={16} />,
    title: "Unlock bonus codes, leaderboard prizes & more",
    desc: "Access exclusive code drops, weekly prizes, and community rewards",
  },
];

const WAGER_SHARE_ROWS: { c: string; pct: string }[][] = [
  [
    { c: "duel", pct: "30%" },
    { c: "stake", pct: "25%" },
    { c: "stakeus", pct: "25%" },
    { c: "thrill", pct: "25%" },
    { c: "bcgame", pct: "25%" },
    { c: "winna", pct: "25%" },
    { c: "rainbet", pct: "20%" },
  ],
  [
    { c: "gamba", pct: "20%" },
    { c: "degen", pct: "20%" },
    { c: "gamdom", pct: "20%" },
    { c: "goated", pct: "20%" },
    { c: "1win", pct: "20%" },
    { c: "shuffle", pct: "10%" },
    { c: "yeet", pct: "10%" },
  ],
];

/** `ez` — Affiliate / earn rewards steps (static). */
export function AffiliateRewards() {
  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="h-auto w-full md:h-[444px]"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex h-9 items-center justify-between gap-3">
        <h2 className="whitespace-nowrap text-[14px] font-medium text-[#2a274e] md:text-[18px] dark:text-white">
          Start earning extra rewards!
        </h2>
        <ClickNav href={AFFILIATE_HREF}>
          <Button
            variant="ghost"
            theme="auto"
            size="sm"
            rightIcon={<ArrowUpRight />}
          >
            View All
          </Button>
        </ClickNav>
      </div>

      <div className="flex flex-col md:h-[192px]">
        {REWARD_STEPS.map((step) => (
          <div
            key={step.n}
            className="flex flex-1 items-center gap-3 border-b border-[#2a274e]/10 pr-4 last:border-0 dark:border-[#eaecf0]/10"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[#8e8eff]/10 text-[12px] font-medium text-[#637083] dark:text-[#97a1af]">
              {step.n}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-1.5">
                <span className="shrink-0 text-[#2a274e]/80 dark:text-white/80">
                  {step.icon}
                </span>
                <span className="text-[14px] font-semibold text-[#2a274e] dark:text-white">
                  {step.title}
                </span>
              </span>
              <span className="hidden text-[12px] font-medium text-[#2a274e] opacity-50 md:block dark:text-white dark:opacity-30">
                {step.desc}
              </span>
            </div>
            <ClickNav
              href={AFFILIATE_HREF}
              className="-mr-2 shrink-0 p-2 text-[#8874ff]"
            >
              <ChevronRight size={16} />
            </ClickNav>
          </div>
        ))}
      </div>

      <div className="flex h-[130px] flex-col justify-between">
        {WAGER_SHARE_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center justify-between"
          >
            {row.map((casino) => (
              <div
                key={casino.c}
                className="flex w-10 flex-col items-center gap-1"
              >
                <span className="flex size-10 items-center justify-center overflow-hidden rounded-[10px] border border-[#2a274e]/10 bg-white dark:hidden">
                  <CasinoLogo
                    slug={casino.c}
                    name={casino.c}
                    size={36}
                    withBg
                    className="object-contain"
                  />
                </span>
                <span className="hidden h-10 items-center justify-center dark:flex [&_img]:size-auto [&_img]:max-h-10 [&_img]:max-w-10">
                  <CasinoLogo
                    slug={casino.c}
                    name={casino.c}
                    size={40}
                  />
                </span>
                <span className="text-[11px] text-[#2a274e]/40 dark:text-white/40">
                  {casino.pct}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
