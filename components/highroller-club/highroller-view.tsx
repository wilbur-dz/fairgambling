"use client";

import {
  ClipboardList,
  Gavel,
  Gift,
  RotateCcw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { FeatureCard } from "@/components/highroller-club/feature-card";
import { GlowButton } from "@/components/highroller-club/glow-button";
import { HeroVisual } from "@/components/highroller-club/hero-visual";
import { TiltCta } from "@/components/highroller-club/tilt-cta";
import { WinMarquee } from "@/components/highroller-club/win-marquee";
import { Card } from "@/components/ui/card";

const TRUST_CHIPS = ["Anonymous", "No account", "90 seconds"] as const;

const HOW_STEPS = [
  {
    Icon: ClipboardList,
    title: "Tell us how you play",
    desc: "A short, private survey: your volume, the games you favour, and what actually matters to you.",
  },
  {
    Icon: ShieldCheck,
    title: "We verify your volume",
    desc: "We confirm your verified play privately. Casinos never see who you are.",
  },
  {
    Icon: Gavel,
    title: "Casinos make private offers",
    desc: "We match you with vetted casino partners that fit how you play.",
  },
  {
    Icon: Scale,
    title: "You compare and choose",
    desc: "Every offer laid out side by side. Accept the one that fits, decline the rest.",
  },
] as const;

const WIN_ITEMS = [
  { Icon: TrendingUp, title: "Higher limits" },
  { Icon: RotateCcw, title: "Lossback" },
  { Icon: Gift, title: "Deposit match" },
  { Icon: Zap, title: "Fast withdrawals" },
] as const;

const OFFER_HREF = "/highroller-club/get-offer";

function TrustChip({ label }: { label: string }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-[rgba(142,142,255,0.1)] px-3 py-2 text-[13px] font-medium text-[#2a274e] sm:px-4 sm:py-2.5 sm:text-sm dark:text-white">
      {label}
    </span>
  );
}

/**
 * Port of reference `HighrollerLanding` — main content only.
 * Static marketing page; CTA links to `/highroller-club/get-offer`.
 */
export function HighrollerView() {
  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <Card
        variant="glass"
        theme="auto"
        ring={false}
        padded={false}
        className="light-element dark-glass-element"
      >
        <div className="relative flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:gap-6 lg:p-8">
          <div className="flex flex-1 flex-col gap-7">
            <div>
              <h1 className="text-[24px] font-semibold leading-tight text-[#2a274e] sm:text-[26px] dark:text-white">
                Let casinos compete for you.
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[rgba(42,39,78,0.7)] dark:text-white/70">
                You stay anonymous. Vetted casinos see your verified play, then
                privately bid for it. You compare every offer and pick the best
                one.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <GlowButton href={OFFER_HREF}>Get your offer</GlowButton>
              <div className="flex items-center gap-2 sm:contents">
                {TRUST_CHIPS.map((label) => (
                  <TrustChip key={label} label={label} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <HeroVisual />
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          How it Works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HOW_STEPS.map(({ Icon, title, desc }, index) => (
            <FeatureCard
              key={title}
              icon={<Icon />}
              title={title}
              desc={desc}
              step={index + 1}
            />
          ))}
        </div>
      </section>

      <WinMarquee
        title="What you can win"
        items={WIN_ITEMS.map(({ Icon, title }) => (
          <FeatureCard key={title} icon={<Icon />} title={title} />
        ))}
      />

      <TiltCta>
        <div className="flex flex-col items-center gap-7 px-6 py-12 text-center sm:px-10 sm:py-[70px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-[26px] font-semibold text-[#2a274e] sm:text-[32px] dark:text-white">
              See what they will offer you.
            </h2>
            <p className="text-[15px] text-[rgba(42,39,78,0.7)] sm:text-base dark:text-white/70">
              Free, anonymous, and no obligation to accept anything.
            </p>
          </div>
          <GlowButton href={OFFER_HREF}>Get your offer</GlowButton>
        </div>
      </TiltCta>
    </main>
  );
}
