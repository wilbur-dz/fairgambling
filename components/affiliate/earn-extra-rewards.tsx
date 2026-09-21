"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { LinkAccountModal } from "@/components/affiliate/link-account-modal";
import { SectionHeader } from "@/components/affiliate/chrome";
import { Modal } from "@/components/ui/modal";
import {
  CASINO_BY_SLUG,
  CONNECT_SLUGS,
  OTHER_CASINO_SLUGS,
  TOP_TIER_CARDS,
  cardArtUrl,
  type AffiliateCasino,
  type TopTierCard as TopTierCardDef,
} from "@/lib/affiliate/data";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

const PERCENT_LABEL_STYLE = {
  top: "9.524cqw",
  right: "9.524cqw",
  width: "19.643cqw",
  height: "10.119cqw",
  fontSize: "5.952cqw",
  fontWeight: 500,
  fontFamily: "var(--font-geist-sans)",
  color: "#FFF",
} as const;

function TopTierCard({
  casino,
  file,
  percent,
  onClick,
}: {
  casino: AffiliateCasino;
  file: string;
  percent?: number;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group @container relative aspect-[168/108] w-full cursor-pointer overflow-hidden rounded-[24px] transition-transform hover:-translate-y-0.5"
    >
      <Image
        src={cardArtUrl(file)}
        alt={casino.name}
        fill
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 23vw, 16vw"
        quality={90}
        className="object-cover"
      />
      {percent != null ? (
        <span
          className="pointer-events-none absolute flex items-center justify-center leading-none"
          style={PERCENT_LABEL_STYLE}
        >
          {percent}%
        </span>
      ) : null}
    </div>
  );
}

function CasinoSignupModal({
  casino,
  onClose,
}: {
  casino: AffiliateCasino;
  onClose: () => void;
}) {
  const logos = getCasinoLogoPair(casino.slug);
  const [copied, setCopied] = useState(false);

  if (!logos || !casino.referralUrl) return null;

  return (
    <Modal theme="auto" open onClose={onClose} closeButton>
      <div className="flex flex-col items-center px-2 pb-2 pt-2 text-center">
        <span className="mb-3 flex size-16 items-center justify-center rounded-2xl border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.5] p-2 dark:border-white/20 dark:bg-white/[0.03]">
          <Image
            src={logos.light}
            alt={casino.name}
            width={48}
            height={48}
            className="size-full object-contain dark:hidden"
          />
          <Image
            src={logos.dark}
            alt=""
            width={48}
            height={48}
            className="hidden size-full object-contain dark:block"
          />
        </span>
        <h3 className="mb-1 text-lg font-semibold text-[#2a274e] dark:text-white">
          {casino.name}
        </h3>
        <p className="mb-5 text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
          {casino.code
            ? "Use our code at signup to support FairGambling."
            : "Sign up via our referral link to support FairGambling."}
        </p>
        {casino.code ? (
          <button
            type="button"
            onClick={() => {
              if (!casino.code) return;
              void navigator.clipboard?.writeText(casino.code).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white/[0.5] px-4 py-3 transition-colors hover:border-[#8874ff]/40 dark:border-white/20 dark:bg-white/[0.03]"
          >
            <span className="text-[11px] font-medium uppercase tracking-wider text-[rgba(42,39,78,0.4)] dark:text-white/40">
              Code
            </span>
            <span className="font-mono text-base font-bold tracking-wide text-[#6b56e0] dark:text-[#8874ff]">
              {casino.code}
            </span>
            <span className="min-w-[44px] text-right text-[11px] font-medium text-[rgba(42,39,78,0.5)] dark:text-white/50">
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        ) : null}
        <a
          href={casino.referralUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={onClose}
          className="nd-button nd-button--primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[14px] font-semibold text-white"
        >
          Register Now
          <ArrowRight size={14} />
        </a>
      </div>
    </Modal>
  );
}

function TopTierCardGrid({
  title,
  badge,
  cards,
  onConnect,
  onSignup,
}: {
  title?: string;
  badge?: string;
  cards: TopTierCardDef[];
  onConnect: (slug: string) => void;
  onSignup: (casino: AffiliateCasino) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {title ? (
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-[#2a274e] dark:text-white">
            {title}
          </h3>
          {badge ? (
            <span className="rounded-md bg-[#8874ff]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6b56e0] dark:text-[#8874ff]">
              {badge}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {cards.map(({ slug, file, percent }) => {
          const casino = CASINO_BY_SLUG[slug];
          if (!casino) return null;
          const canConnect = CONNECT_SLUGS.has(slug);
          return (
            <TopTierCard
              key={slug}
              casino={casino}
              file={file}
              percent={percent}
              onClick={() =>
                canConnect ? onConnect(slug) : onSignup(casino)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function OtherCasinoTile({
  casino,
  onClick,
}: {
  casino: AffiliateCasino;
  onClick: () => void;
}) {
  const logos = getCasinoLogoPair(casino.slug);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-[18px] border border-[#e4e4e7] bg-[#e4e4e7]/30 p-2.5 backdrop-blur-xl transition-colors hover:bg-white/[0.7] nd-ring-dark-only dark:border-0 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:block"
      />
      <span className="flex size-10 items-center justify-center rounded-[12px] border-[0.5px] border-[rgba(42,39,78,0.12)] bg-white/[0.6] p-1.5 backdrop-blur-md dark:border-white/15 dark:bg-white/[0.05]">
        {logos ? (
          <>
            <Image
              src={logos.light}
              alt={casino.name}
              width={26}
              height={26}
              className="size-full object-contain dark:hidden"
            />
            <Image
              src={logos.dark}
              alt=""
              width={26}
              height={26}
              className="hidden size-full object-contain dark:block"
            />
          </>
        ) : (
          <span className="text-base font-bold text-[rgba(42,39,78,0.6)] dark:text-white/60">
            {casino.name.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="text-[12px] font-semibold text-[#2a274e] dark:text-white">
        {casino.name}
      </span>
      <span className="mt-0.5 flex w-full items-center justify-center gap-1 border-t border-[rgba(42,39,78,0.07)] pt-2 text-[12px] font-medium text-[#6b56e0] transition-colors group-hover:text-[#2a274e] dark:border-white/[0.07] dark:text-[#8874ff] dark:group-hover:text-white">
        Sign Up <ArrowRight size={12} />
      </span>
    </button>
  );
}

/** Earn Extra Rewards casino grids (reference SupportedCasinos). */
export function EarnExtraRewards() {
  const { isAuthenticated } = useAuth();
  const { openRegisterModal } = useAuthModal();
  const [linkSlug, setLinkSlug] = useState<string | null>(null);
  const [signupCasino, setSignupCasino] = useState<AffiliateCasino | null>(
    null,
  );

  const onConnect = (slug: string) => {
    if (isAuthenticated) setLinkSlug(slug);
    else openRegisterModal();
  };

  return (
    <section className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4">
        <SectionHeader title="Earn Extra Rewards" />
        <TopTierCardGrid
          cards={TOP_TIER_CARDS}
          onConnect={onConnect}
          onSignup={setSignupCasino}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[#2a274e] dark:text-white">
          Other Casinos - No Wager Share Yet
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {OTHER_CASINO_SLUGS.map((slug) => {
            const casino = CASINO_BY_SLUG[slug];
            if (!casino) return null;
            const canConnect = CONNECT_SLUGS.has(slug);
            return (
              <OtherCasinoTile
                key={slug}
                casino={casino}
                onClick={() =>
                  canConnect ? onConnect(slug) : setSignupCasino(casino)
                }
              />
            );
          })}
        </div>
      </div>

      {linkSlug ? (
        <LinkAccountModal
          isOpen
          affiliateMode
          casinoSlug={linkSlug}
          wagerSharePercent={CASINO_BY_SLUG[linkSlug]?.kickbackPercent}
          onClose={() => setLinkSlug(null)}
          onVerified={() => {}}
        />
      ) : null}

      {signupCasino ? (
        <CasinoSignupModal
          casino={signupCasino}
          onClose={() => setSignupCasino(null)}
        />
      ) : null}
    </section>
  );
}
