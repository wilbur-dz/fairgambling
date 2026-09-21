"use client";

import Image from "next/image";
import { Coins, PenLine, ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import {
  CASINO_ACCENT_COLORS,
  REVIEW_PRIZE_CONFIGS,
  type ReviewPrizeConfig,
} from "@/lib/reviews/constants";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

const STEPS = [
  {
    icon: PenLine,
    title: "Write a review",
    description: "Share an honest experience at a casino you've played at.",
  },
  {
    icon: ShieldCheck,
    title: "Verify account",
    description:
      "Link your casino account so we can confirm you actually played there.",
  },
  {
    icon: Coins,
    title: "Claim your reward",
    description: "Once verified, claim your crypto prize from your profile.",
  },
];

function CasinoMark({ slug, name }: { slug: string; name: string }) {
  const pair = getCasinoLogoPair(slug);
  if (!pair) {
    return (
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#e5e7eb] dark:bg-white/10">
        <span className="text-[8px] font-bold text-[#6b7280]">{name[0]}</span>
      </div>
    );
  }
  return (
    <div className="h-5 w-5 shrink-0">
      <Image
        src={pair.light}
        alt={name}
        width={20}
        height={20}
        className="object-contain dark:hidden"
      />
      <Image
        src={pair.dark}
        alt={name}
        width={20}
        height={20}
        className="hidden object-contain dark:block"
      />
    </div>
  );
}

function PrizeValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[#9ca3af] dark:text-[#4b5563]">—</span>;
  }
  return <span>${value % 1 === 0 ? value : value.toFixed(2)}</span>;
}

function PrizeGroup({
  title,
  configs,
}: {
  title: string;
  configs: ReviewPrizeConfig[];
}) {
  if (configs.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-wider text-[#6b7280] uppercase dark:text-[#9ca3af]">
          {title}
        </span>
        <div className="h-px flex-1 bg-[#e5e7eb] dark:bg-white/[0.06]" />
      </div>
      <table className="w-full table-fixed text-left text-[12px]">
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "34%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-[#e5e7eb] dark:border-white/[0.06]">
            <th className="pb-1.5 text-[10px] font-medium tracking-wider text-[#9ca3af] uppercase">
              Casino
            </th>
            <th className="pb-1.5 text-center text-[10px] font-medium tracking-wider text-[#9ca3af] uppercase">
              Tier
            </th>
            <th className="pb-1.5 text-center text-[10px] font-medium tracking-wider text-[#9ca3af] uppercase">
              Prize
            </th>
            <th className="pb-1.5 text-center text-[10px] font-medium tracking-wider whitespace-nowrap text-[#9ca3af] uppercase">
              <span className="inline-flex items-center gap-1">
                <span>Prize with</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/logo.svg"
                  alt="FairGambling"
                  width={12}
                  height={12}
                  className="h-3 w-3 shrink-0"
                />
                <span>code</span>
              </span>
            </th>
          </tr>
        </thead>
        {configs.map((config, configIndex) => {
          const accent = CASINO_ACCENT_COLORS[config.slug] || "#6b7280";
          const rowBg = `${accent}${configIndex % 2 === 0 ? "0D" : "1C"}`;
          return (
            <tbody key={config.slug}>
              {config.tiers.map((tier, tierIndex) => (
                <tr
                  key={`${config.slug}-${tier.label}`}
                  style={{ backgroundColor: rowBg }}
                  className="border-t border-t-[#f3f4f6] dark:border-t-white/[0.03]"
                >
                  {tierIndex === 0 ? (
                    <td
                      className="border-l-[3px] py-2 pr-2 pl-2"
                      rowSpan={config.tiers.length}
                      style={{ borderLeftColor: accent }}
                    >
                      <div className="flex items-center gap-1.5">
                        <CasinoMark slug={config.slug} name={config.name} />
                        <span className="text-[12px] font-medium text-[#111827] dark:text-white">
                          {config.name}
                        </span>
                      </div>
                    </td>
                  ) : null}
                  <td className="px-1 py-2 text-center text-[11px] text-[#374151] dark:text-[#d1d5db]">
                    {tier.label}
                  </td>
                  <td className="px-1 py-2 text-center font-medium text-[#111827] dark:text-white">
                    <PrizeValue value={tier.prize} />
                  </td>
                  <td className="px-1 py-2 text-center font-semibold text-[#4F2DEC] dark:text-[#9A80F9]">
                    <PrizeValue value={tier.prizeWithCode} />
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

type ReviewRewardsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Port of reference Verified Review Rewards modal (`eh`). */
export function ReviewRewardsModal({
  isOpen,
  onClose,
}: ReviewRewardsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const top = REVIEW_PRIZE_CONFIGS.filter((c) =>
    ["stake", "shuffle", "roobet", "rainbet"].includes(c.slug),
  );
  const major = REVIEW_PRIZE_CONFIGS.filter((c) =>
    ["duel", "bcgame", "winna", "stakeus", "rollbit", "thrill"].includes(
      c.slug,
    ),
  );
  const more = REVIEW_PRIZE_CONFIGS.filter(
    (c) => !top.includes(c) && !major.includes(c),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-[#e5e7eb] dark:bg-[#0D1120] dark:sm:border-white/[0.08]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#e5e7eb] px-4 py-3 sm:px-5 sm:py-4 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-bold text-[#111827] sm:text-lg dark:text-white">
              Verified Review Rewards
            </h2>
            <p className="mt-0.5 text-[11px] text-[#6b7280] sm:text-[13px] dark:text-[#9ca3af]">
              Earn crypto for honest, verified reviews
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ca3af] transition-colors hover:bg-[#f3f4f6] hover:text-[#4b5563] dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:space-y-5 sm:px-5 sm:py-4">
          <div className="pt-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-[#e5e7eb] bg-gradient-to-b from-[#4F2DEC]/[0.06] to-transparent px-4 pt-6 pb-4 transition-colors hover:border-[#4F2DEC]/30 dark:border-white/[0.06] dark:from-[#9A80F9]/[0.08] dark:to-transparent dark:hover:border-[#9A80F9]/30"
                >
                  <div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#4F2DEC] to-[#7C5FF3] py-1 pr-2.5 pl-1.5 dark:from-[#7C5FF3] dark:to-[#9A80F9]">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                      <span className="text-[11px] leading-none font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <step.icon size={12} className="shrink-0 text-white" />
                  </div>
                  <h3 className="mb-1.5 text-[15px] leading-tight font-semibold text-[#111827] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[#6b7280] dark:text-[#9ca3af]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-[#4F2DEC]/20 bg-[#4F2DEC]/[0.06] px-3 py-2.5 sm:px-4 dark:border-[#4F2DEC]/15 dark:bg-[#4F2DEC]/[0.08]">
            <span className="shrink-0 text-[16px] font-bold text-[#4F2DEC] sm:text-[18px] dark:text-[#9a80f9]">
              +150%
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#111827] sm:text-[13px] dark:text-white">
                Signed up with code{" "}
                <span className="rounded border border-[#4F2DEC]/30 px-1 py-0.5 text-[11px] text-[#4F2DEC] dark:border-[#9A80F9]/30 dark:text-[#9A80F9]">
                  fairgambling
                </span>
                ?
              </p>
              <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af]">
                You automatically earn 150% more on every verified review
              </p>
            </div>
          </div>

          <PrizeGroup title="Top Casinos" configs={top} />
          <PrizeGroup title="Major Casinos" configs={major} />
          <PrizeGroup title="More Casinos" configs={more} />

          <p className="pb-2 text-[10px] leading-relaxed text-[#9ca3af] sm:text-[11px] dark:text-[#6b7280]">
            Prizes are paid in crypto to your verified casino account. Reviews
            must be genuine and meet our quality guidelines. One verified review
            per casino per user.
          </p>
        </div>
      </div>
    </div>
  );
}
