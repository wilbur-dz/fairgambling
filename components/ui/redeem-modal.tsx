"use client";

import Image from "next/image";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

const REDEEM_URL_BUILDERS: Record<string, (code: string) => string> = {
  stake: (code) =>
    `https://stake.com/settings/offers?type=drop&code=${encodeURIComponent(code)}&modal=redeemBonus`,
  stakeus: (code) =>
    `https://stake.us/settings/offers?type=drop&code=${encodeURIComponent(code)}&currency=sweeps&modal=redeemBonus`,
  shuffle: (code) =>
    `https://shuffle.com/?modal=c&md-code=${encodeURIComponent(code)}`,
  shuffleus: (code) =>
    `https://shuffle.us/?modal=c&md-code=${encodeURIComponent(code)}`,
  rainbet: () => "https://rainbet.com/affiliates?modal=wallet&tab=redeem",
  winna: () => "https://winna.com/?bonus-center=true",
  moon: (code) =>
    `https://moon.com/bet?modal=redeem-code&source=weekly&code=${encodeURIComponent(code)}`,
};

const CASINO_HOME_URLS: Record<string, string> = {
  stake: "https://stake.com",
  stakeus: "https://stake.us",
  shuffle: "https://shuffle.com",
  shuffleus: "https://shuffle.us",
  roobet: "https://roobet.com",
  rainbet: "https://rainbet.com",
  razed: "https://razed.com",
  goated: "https://goated.com",
  gamba: "https://gamba.com",
  thrill: "https://thrill.com",
  winna: "https://winna.com",
  gamdom: "https://gamdom.com",
  rollbit: "https://rollbit.com",
  betfury: "https://betfury.io",
  bcgame: "https://bc.game",
  duelbits: "https://duelbits.com",
  "500casino": "https://500.casino",
  yeet: "https://yeet.com",
  moon: "https://moon.com",
};

type RedeemModalProps = {
  code: string;
  casinoSlug?: string | null;
  casinoName?: string | null;
  onClose: () => void;
  onRedeemed?: () => void;
};

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

/** Port of reference `RedeemModal`. */
export function RedeemModal({
  code,
  casinoSlug,
  casinoName,
  onClose,
  onRedeemed,
}: RedeemModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!code) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
    };
  }, [code, onClose]);

  if (!mounted || !code) return null;

  const slug = (casinoSlug ?? "").toLowerCase();
  const hasRedeemBuilder = slug in REDEEM_URL_BUILDERS;
  const redeemUrl = hasRedeemBuilder
    ? REDEEM_URL_BUILDERS[slug](code)
    : slug
      ? (CASINO_HOME_URLS[slug] ?? null)
      : null;
  const logoPair = slug ? getCasinoLogoPair(slug, { withBg: true }) : null;
  const displayName = casinoName || "Casino";

  const handleCopy = async () => {
    await copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const openRedeem = () => {
    void handleCopy();
    if (redeemUrl) {
      window.open(redeemUrl, "_blank", "noopener,noreferrer");
    }
    onRedeemed?.();
    onClose();
  };

  const openSite = () => {
    if (redeemUrl) {
      window.open(redeemUrl, "_blank", "noopener,noreferrer");
    }
    onRedeemed?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Redeem code for ${displayName}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl dark:border-[rgba(255,255,255,0.06)] dark:bg-[#161C32]">
        <div
          className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 dark:block"
          style={{
            width: "400px",
            height: "180px",
            background:
              "radial-gradient(ellipse at center top, rgba(79, 45, 236, 0.25) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-px dark:block"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-4 p-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1 text-[#9ca3af] transition-colors hover:text-[#4b5563] dark:hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6] dark:border-[rgba(255,255,255,0.06)] dark:bg-[rgba(7,5,22,0.3)]">
              {logoPair ? (
                <Image
                  src={logoPair.dark}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-[#2a274e] dark:text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280] dark:text-[#9ca3af]">
                Redeem Code
              </span>
              <span className="text-[14px] font-semibold text-[#111827] dark:text-white">
                {displayName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="group flex items-center justify-between gap-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 transition-colors hover:border-[#4C4CDB] dark:border-[#2A3444] dark:bg-[#141A28] dark:hover:border-[#6C6CFF]"
          >
            <span className="truncate font-mono text-[14px] font-semibold text-[#111827] dark:text-white">
              {code}
            </span>
            {copied ? (
              <Check size={20} className="shrink-0 text-green-500" />
            ) : (
              <Copy
                size={16}
                className="shrink-0 text-[#9ca3af] transition-colors group-hover:text-[#4C4CDB] dark:group-hover:text-[#9A80F9]"
              />
            )}
          </button>

          <div className="flex flex-col gap-2">
            {redeemUrl ? (
              <button
                type="button"
                onClick={openRedeem}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#4C4CDB] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#5858e0]"
              >
                {hasRedeemBuilder ? "Redeem Code" : "Copy Code & Visit Site"}
                <ExternalLink size={16} />
              </button>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e5e7eb] px-3 py-2 text-[12px] font-medium text-[#374151] transition-colors hover:border-[#4C4CDB] hover:text-[#4C4CDB] dark:border-[#2A3444] dark:text-[#d1d5db] dark:hover:border-[#6C6CFF] dark:hover:text-[#9A80F9]"
              >
                {copied ? (
                  <>
                    Copied
                    <Check size={14} className="text-green-500" />
                  </>
                ) : (
                  <>
                    Copy Code
                    <Copy size={13} />
                  </>
                )}
              </button>
              {redeemUrl ? (
                <button
                  type="button"
                  onClick={openSite}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e5e7eb] px-3 py-2 text-[12px] font-medium text-[#374151] transition-colors hover:border-[#4C4CDB] hover:text-[#4C4CDB] dark:border-[#2A3444] dark:text-[#d1d5db] dark:hover:border-[#6C6CFF] dark:hover:text-[#9A80F9]"
                >
                  Visit Site
                  <ExternalLink size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
