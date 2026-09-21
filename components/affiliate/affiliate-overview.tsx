"use client";

import Image from "next/image";
import { Clock, History, Info, Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { ClaimConfirmModal } from "@/components/affiliate/claim-confirm-modal";
import { CoinWagerHover } from "@/components/affiliate/coin-wager-hover";
import { Panel, SectionHeader } from "@/components/affiliate/chrome";
import { LinkAccountModal } from "@/components/affiliate/link-account-modal";
import { PendingCountdown } from "@/components/affiliate/pending-countdown";
import { VipTelegramModal } from "@/components/affiliate/vip-telegram-modal";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  claimAffiliateKickback,
  getMyAffiliateClaims,
  getMyAffiliateEarnings,
  getTelegramHandle,
} from "@/lib/affiliate/client-api";
import { coinLogoSrc } from "@/lib/affiliate/coin-logo";
import {
  AUTH_HINT_ATTR,
  CASINOS,
  MORE_CASINOS,
  PREVIEW_ACCOUNTS,
  PREVIEW_KICKBACK,
  TOP_CASINOS,
  type AffiliateAccount,
  type AffiliateClaim,
  type PendingVerification,
} from "@/lib/affiliate/data";
import { getPendingSession } from "@/lib/affiliate/pending-session";
import { getCasinoLogoPair, surfaceTile } from "@/lib/casinos/logos";

const COIN_WAGER_SLUGS = new Set(["stake", "stakeus", "shuffle"]);
const CRYPTO_EARNED_SLUGS = new Set(["thrill"]);
const GRID =
  "grid-cols-[200px_116px_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)_132px]";

function StatCard({
  label,
  value,
  action,
  loading,
}: {
  label: string;
  value: string;
  action?: ReactNode;
  loading?: boolean;
}) {
  const text = "text-[#2a274e] dark:text-white";
  return (
    <div className="flex flex-col gap-2 rounded-[24px] border-[0.5px] border-[rgba(42,39,78,0.12)] bg-white/[0.5] px-4 py-3 backdrop-blur-[35.5px] md:gap-3 md:p-4 dark:border-white/20 dark:bg-white/[0.01]">
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm md:text-[16px] ${text}`}>{label}</p>
        {action}
      </div>
      {loading ? (
        <div className="h-8 w-28 animate-pulse rounded bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.06]" />
      ) : (
        <p className={`text-2xl font-semibold ${text}`}>{value}</p>
      )}
    </div>
  );
}

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[rgba(42,39,78,0.35)] dark:text-white/30">
        {label}
      </span>
      <span className="truncate text-[13px] font-semibold text-[rgba(42,39,78,0.9)] dark:text-white/90">
        {value}
      </span>
    </div>
  );
}

function PaidInCryptoHint({ acc }: { acc: AffiliateAccount }) {
  const text = "text-[#2a274e] dark:text-white";
  const muted = "text-[rgba(42,39,78,0.4)] dark:text-white/40";
  const soft = "text-[rgba(42,39,78,0.5)] dark:text-white/50";
  const chip = "bg-[rgba(42,39,78,0.06)] dark:bg-white/10";
  const coins = (acc.coins ?? [])
    .filter((c) => c.claimableAmount > 0)
    .sort((a, b) => b.claimableUsd - a.claimableUsd);
  const icons = [
    ...((acc.legacyClaimable ?? 0) > 0 ? (["USDT"] as const) : []),
    ...coins.map((c) => c.currency),
  ].slice(0, 5);
  const minLabel =
    acc.minClaimUsd != null ? `$${acc.minClaimUsd.toFixed(2)}` : "the";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="mt-2 flex">
      <div ref={ref} className="group/coins relative inline-flex items-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-my-1 inline-flex items-center gap-1.5 py-1"
        >
          <span className="flex -space-x-1.5">
            {icons.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className={`flex size-4 items-center justify-center overflow-hidden rounded-full ring-1 ${chip} ring-white dark:ring-[#0f1424]`}
              >
                <Image
                  src={coinLogoSrc(c)}
                  alt={c}
                  width={16}
                  height={16}
                  className="size-full object-contain"
                />
              </span>
            ))}
          </span>
          <span className={`text-[10px] font-medium ${muted}`}>
            Paid in crypto
          </span>
          <Info size={10} className={`shrink-0 ${muted}`} />
        </button>
        <div
          className={`absolute bottom-[calc(100%+8px)] left-0 z-50 w-[280px] max-w-[calc(100vw-5rem)] rounded-lg border border-[#e4e4e7] bg-white p-3 shadow-lg transition-all duration-200 dark:border-0 dark:bg-[#1a1d2e] ${
            open
              ? "visible opacity-100"
              : "invisible opacity-0 group-hover/coins:visible group-hover/coins:opacity-100"
          }`}
        >
          <p className={`mb-2 text-[10px] uppercase tracking-wide ${soft}`}>
            Your payout
          </p>
          <div className="flex flex-col gap-1.5">
            {(acc.legacyClaimable ?? 0) > 0 ? (
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-4 items-center justify-center overflow-hidden rounded-full ${chip}`}
                >
                  <Image
                    src={coinLogoSrc("USDT")}
                    alt="USDT"
                    width={16}
                    height={16}
                    className="size-full object-contain"
                  />
                </span>
                <span className={`text-[11px] tabular-nums ${text}`}>
                  {acc.legacyClaimable!.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className={soft}>USDT</span>
                </span>
                <span className={`ml-auto text-[10px] ${muted}`}>
                  earlier balance
                </span>
              </div>
            ) : null}
            {coins.map((c) => (
              <div key={c.currency} className="flex items-center gap-2">
                <span
                  className={`flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full ${chip}`}
                >
                  <Image
                    src={coinLogoSrc(c.currency)}
                    alt={c.currency}
                    width={16}
                    height={16}
                    className="size-full object-contain"
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-[11px] tabular-nums ${text}`}
                >
                  {c.claimableAmount.toLocaleString(undefined, {
                    maximumFractionDigits: c.claimableAmount >= 1 ? 4 : 8,
                  })}{" "}
                  <span className={soft}>{c.currency}</span>
                </span>
                <span
                  className={`shrink-0 whitespace-nowrap text-[11px] tabular-nums ${soft}`}
                >
                  ~$
                  {c.claimableUsd.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
                {!c.claimableNow ? (
                  <span
                    className={`shrink-0 whitespace-nowrap text-[10px] ${muted}`}
                  >
                    below {minLabel} min
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  acc,
  isGuest,
  hasBelowMin,
  onClaim,
  onRegister,
  wide,
}: {
  acc: AffiliateAccount;
  isGuest: boolean;
  hasBelowMin: boolean;
  onClaim: () => void;
  onRegister: () => void;
  wide?: boolean;
}) {
  if (acc.customDeal) {
    return wide ? (
      <span className="inline-block w-[124px]" aria-hidden />
    ) : null;
  }
  if (acc.claimable > 0) {
    return (
      <Button
        theme="auto"
        variant="primary"
        size="sm"
        className={
          wide ? "w-[124px] justify-center" : "shrink-0 justify-center"
        }
        onClick={() => (isGuest ? onRegister() : onClaim())}
      >
        Claim ${acc.claimable.toLocaleString()}
      </Button>
    );
  }
  if (acc.totalPending > 0) {
    return wide ? (
      <span className="inline-flex w-[124px] cursor-default items-center justify-center gap-1.5 rounded-full border-[0.5px] border-amber-400/25 bg-[linear-gradient(180deg,rgba(251,146,60,0.20),rgba(180,83,9,0.24))] py-[9px] text-[13px] font-medium text-[#b45309] shadow-[inset_0_1px_3px_rgba(255,255,255,0.12),0_0_14px_rgba(251,146,60,0.14)] dark:text-amber-300">
        <Clock className="size-3.5" aria-hidden />
        Pending
      </span>
    ) : (
      <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-[#b45309] dark:text-amber-400">
        Pending
      </span>
    );
  }
  if (wide) {
    return (
      <span className="group/claimed inline-flex w-[124px] cursor-default items-center justify-center rounded-full border-[0.5px] border-white/[0.08] bg-[linear-gradient(180deg,rgba(96,84,190,0.22),rgba(48,10,104,0.30))] py-[9px] text-[13px] font-medium text-white/45 transition-all hover:bg-[linear-gradient(180deg,rgba(136,116,255,0.45),rgba(81,5,161,0.45))] hover:text-white hover:shadow-[0_0_14px_rgba(136,116,255,0.25)]">
        <span className="group-hover/claimed:hidden">
          {hasBelowMin ? "Below min" : "Claimed"}
        </span>
        <span className="hidden group-hover/claimed:inline">
          {hasBelowMin
            ? acc.minClaimUsd != null
              ? `Claimable from $${acc.minClaimUsd.toFixed(2)} per coin`
              : "Claimable from the per-coin minimum"
            : "Wager to earn"}
        </span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(42,39,78,0.08)] px-3 py-2 text-xs font-medium text-[rgba(42,39,78,0.5)] dark:bg-[#3c3c3c] dark:text-white/50"
      title={
        hasBelowMin
          ? acc.minClaimUsd != null
            ? `Claimable from $${acc.minClaimUsd.toFixed(2)} per coin`
            : "Claimable from the per-coin minimum"
          : undefined
      }
    >
      {hasBelowMin ? "Below min" : "Claimed"}
    </span>
  );
}

/** Port of reference `AffiliateOverview`. */
export function AffiliateOverview() {
  const text = "text-[#2a274e] dark:text-white";
  const value = "text-[rgba(42,39,78,0.9)] dark:text-white/90";
  const label = "text-[rgba(42,39,78,0.35)] dark:text-white/30";
  const muted = "text-[rgba(42,39,78,0.4)] dark:text-white/40";
  const soft = "text-[rgba(42,39,78,0.5)] dark:text-white/50";
  const skeleton = "bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.06]";
  const divide = "divide-[rgba(42,39,78,0.06)] dark:divide-white/[0.04]";

  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const { openRegisterModal } = useAuthModal();

  const [authHintReady, setAuthHintReady] = useState(false);
  const [linkSlug, setLinkSlug] = useState<string | null>(null);
  const [vipOpen, setVipOpen] = useState(false);
  const [promptVipAfterLink, setPromptVipAfterLink] = useState(false);
  const [accounts, setAccounts] = useState<AffiliateAccount[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [claimConfirm, setClaimConfirm] = useState<AffiliateAccount | null>(
    null,
  );
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [payoutAccountId, setPayoutAccountId] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [claims, setClaims] = useState<AffiliateClaim[]>([]);
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [nowMs, setNowMs] = useState(0);

  const refreshPending = useCallback(() => {
    const next: PendingVerification[] = [];
    for (const casino of CASINOS) {
      const session = getPendingSession(casino.slug);
      if (session && session.expiresAt > Date.now()) next.push(session);
    }
    setPending(next);
  }, []);

  useEffect(() => {
    setAuthHintReady(
      document.documentElement.getAttribute(AUTH_HINT_ATTR) !== "1",
    );
  }, []);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 60_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    refreshPending();
    const id = setInterval(refreshPending, 30_000);
    return () => clearInterval(id);
  }, [refreshPending]);

  useEffect(() => {
    refreshPending();
  }, [linkSlug, refreshPending]);

  const refreshEarnings = useCallback(async () => {
    try {
      const [earnings, claimRows] = await Promise.all([
        getMyAffiliateEarnings(),
        getMyAffiliateClaims(),
      ]);
      setAccounts(earnings);
      setClaims(claimRows);
    } catch {
      // keep previous rows
    } finally {
      setLoadingEarnings(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void refreshEarnings();
  }, [isAuthenticated, refreshEarnings]);

  const maybeOpenVip = useCallback(async () => {
    if (accessToken) {
      try {
        if ((await getTelegramHandle(accessToken)).handle) return;
      } catch {
        // open vip form
      }
    }
    setVipOpen(true);
  }, [accessToken]);

  const waitingAuth = isLoading && !authHintReady;
  const isGuest = !waitingAuth && !isAuthenticated;
  const kickbackBySlug = new Map(
    CASINOS.map((c) => [c.slug, c.kickbackPercent ?? 10]),
  );
  const rows = isGuest ? PREVIEW_ACCOUNTS : accounts;
  const showSkeleton = (waitingAuth || loadingEarnings) && rows.length === 0;
  const totalWager = rows.reduce((sum, r) => sum + r.wagerUsd, 0);
  const totalEarned = rows.reduce((sum, r) => sum + r.commissionUsd, 0);
  const totalClaimed = rows.reduce((sum, r) => sum + r.totalPaid, 0);

  const relativeSync = (iso?: string) => {
    if (!iso || nowMs <= 0 || isGuest) return null;
    const mins = Math.floor((nowMs - new Date(iso).getTime()) / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const shareFor = (slug: string) =>
    isGuest ? (PREVIEW_KICKBACK[slug] ?? 10) : (kickbackBySlug.get(slug) ?? 10);

  const hasCryptoBalance = (acc: AffiliateAccount) =>
    Boolean(acc.coins?.some((c) => c.claimableAmount > 0)) ||
    (acc.legacyClaimable ?? 0) > 0;

  return (
    <section>
      <Panel contentClassName="flex flex-col gap-6">
        <SectionHeader
          title={
            isAuthenticated ? "Your Affiliate Overview" : "Affiliate Overview"
          }
        />

        {!isGuest && accounts.some((a) => a.customDeal) ? (
          <div className="rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-sm text-purple-800 dark:text-purple-200">
            <span className="font-semibold">You&apos;re on a custom deal</span>,
            nothing to claim here. Questions? Reach out to your host.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Wager"
            value={`$${totalWager.toLocaleString()}`}
            loading={showSkeleton}
          />
          <StatCard
            label="Earned"
            value={`$${totalEarned.toLocaleString()}`}
            loading={showSkeleton}
          />
          <StatCard
            label="Claimed"
            value={`$${totalClaimed.toLocaleString()}`}
            loading={showSkeleton}
            action={
              claims.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-[0.5px] border-[rgba(42,39,78,0.12)] bg-[rgba(42,39,78,0.04)] px-2.5 py-1 text-[12px] font-medium text-[rgba(42,39,78,0.6)] transition-colors hover:border-[#8874ff]/40 hover:text-[#8874ff] dark:border-white/15 dark:bg-white/[0.04] dark:text-white/60 dark:hover:text-[#8874ff]"
                >
                  <History className="size-3.5" aria-hidden />
                  History
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Desktop table */}
        <div className="scrollbar-hide -mx-4 hidden overflow-x-auto px-4 md:block">
          <div className="min-w-[760px]">
            <div
              className={`grid ${GRID} gap-3 border-b border-[rgba(42,39,78,0.08)] pb-2.5 dark:border-white/[0.08]`}
            >
              {["Casino", "Wager Share", "Wager", "Earned", "Claimed"].map(
                (h) => (
                  <span
                    key={h}
                    className={`text-[12px] font-medium uppercase tracking-wider ${label} ${
                      h === "Wager Share" ? "whitespace-nowrap" : ""
                    }`}
                  >
                    {h}
                  </span>
                ),
              )}
              <span
                className={`text-right text-[12px] font-medium uppercase tracking-wider ${label}`}
              >
                Action
              </span>
            </div>

            {showSkeleton ? (
              <div className={`divide-y ${divide}`}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-3.5">
                    <div className={`size-8 animate-pulse rounded-lg ${skeleton}`} />
                    <div className="flex-1 space-y-1.5">
                      <div className={`h-3.5 w-24 animate-pulse rounded ${skeleton}`} />
                      <div className={`h-2.5 w-16 animate-pulse rounded ${skeleton}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`divide-y ${divide}`}>
                {rows.map((acc) => {
                  const share = shareFor(acc.casinoSlug);
                  const belowMin = hasCryptoBalance(acc);
                  return (
                    <div
                      key={`${acc.casinoId}-${acc.connectedAccountId}`}
                      className="py-3"
                    >
                      {acc.casinoSlug === "bcgame" ? (
                        <div className="mb-2 rounded-lg border border-blue-500/15 bg-blue-500/10 px-3 py-1.5">
                          <p className="text-[10px] text-blue-400">
                            BC.Game moved to a new affiliate program on Sep 3,
                            2026. Earnings up to that date are settled; new play
                            is tracked and credited under the new program.
                          </p>
                        </div>
                      ) : null}
                      {acc.casinoSlug === "rollbit" &&
                      acc.commissionUsd === 0 ? (
                        <div className="mb-2 rounded-lg border border-amber-500/15 bg-amber-500/10 px-3 py-1.5">
                          <p className="text-[10px] text-amber-400">
                            Rollbit commission may take time to appear. Make
                            sure you&apos;ve deposited and wagered first.
                          </p>
                        </div>
                      ) : null}
                      <div className={`grid ${GRID} items-center gap-3`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <AnalyticsCasinoIcon
                            casinoName={acc.casinoName}
                            size={26}
                            theme="auto"
                          />
                          <div className="min-w-0">
                            <span
                              className={`block truncate text-sm font-semibold ${text}`}
                            >
                              {acc.casinoName}
                            </span>
                            <p
                              className={`truncate text-[10px] font-medium ${soft} ${
                                isGuest ? "select-none blur-[2px]" : ""
                              }`}
                            >
                              {(acc.accounts?.length
                                ? acc.accounts.map((a) => a.externalUsername)
                                : [acc.externalUsername]
                              ).join(", ")}
                              {relativeSync(acc.lastSyncedAt) ? (
                                <span className={muted}>
                                  {" "}
                                  · Updated {relativeSync(acc.lastSyncedAt)}
                                </span>
                              ) : null}
                            </p>
                            {belowMin ? <PaidInCryptoHint acc={acc} /> : null}
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${value}`}>
                          {acc.customDeal ? "Custom" : `${share}%`}
                        </span>
                        {COIN_WAGER_SLUGS.has(acc.casinoSlug) ||
                        (acc.wagerCoins?.length ?? 0) > 0 ? (
                          <span className={value}>
                            <CoinWagerHover
                              value={`$${acc.wagerUsd.toLocaleString()}`}
                              breakdown={acc.wagerCoins}
                            />
                          </span>
                        ) : (
                          <span className={`text-sm font-medium ${value}`}>
                            ${acc.wagerUsd.toLocaleString()}
                          </span>
                        )}
                        {CRYPTO_EARNED_SLUGS.has(acc.casinoSlug) ? (
                          <span className={value}>
                            <CoinWagerHover
                              value={`$${acc.commissionUsd.toLocaleString()}`}
                              text="Earnings are held in crypto coins. The USD value moves with coin prices; your wager stays fixed."
                            />
                          </span>
                        ) : (
                          <span className={`text-sm font-medium ${value}`}>
                            ${acc.commissionUsd.toLocaleString()}
                          </span>
                        )}
                        <span className={`text-sm font-medium ${value}`}>
                          ${acc.totalPaid.toLocaleString()}
                        </span>
                        <div className="flex justify-end">
                          <ActionButton
                            acc={acc}
                            isGuest={isGuest}
                            hasBelowMin={belowMin}
                            wide
                            onRegister={openRegisterModal}
                            onClaim={() => {
                              setPayoutAccountId(null);
                              setClaimConfirm(acc);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!isGuest
                  ? pending.map((session) => {
                      const casino = CASINOS.find(
                        (c) => c.slug === session.casinoSlug,
                      );
                      if (!casino) return null;
                      const logos = getCasinoLogoPair(session.casinoSlug);
                      return (
                        <button
                          key={`pending-${session.casinoSlug}`}
                          type="button"
                          onClick={() => setLinkSlug(session.casinoSlug)}
                          className={`grid ${GRID} w-full items-center gap-3 rounded-lg py-3 text-left transition-colors hover:bg-amber-500/[0.05]`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[rgba(42,39,78,0.06)] p-1 ring-2 ring-amber-500/30 dark:bg-white/10">
                              {logos ? (
                                <>
                                  <Image
                                    src={logos.light}
                                    alt={casino.name}
                                    width={24}
                                    height={24}
                                    className="size-full object-contain dark:hidden"
                                  />
                                  <Image
                                    src={logos.dark}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="hidden size-full object-contain dark:block"
                                  />
                                </>
                              ) : (
                                <span className={`text-xs font-bold ${muted}`}>
                                  {casino.name[0]}
                                </span>
                              )}
                            </span>
                            <div className="min-w-0">
                              <span
                                className={`text-sm font-medium ${text}`}
                              >
                                {casino.name}
                              </span>
                              <p className="truncate text-[11px] text-[#b45309] dark:text-amber-400">
                                {session.username}
                                <span className={muted}>
                                  {" "}
                                  · Verification pending
                                </span>
                              </p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${muted}`}>
                            —
                          </span>
                          <span className={`text-sm font-semibold ${muted}`}>
                            —
                          </span>
                          <span className={`text-sm font-semibold ${muted}`}>
                            —
                          </span>
                          <span className={`text-sm font-semibold ${muted}`}>
                            —
                          </span>
                          <div className="flex justify-end">
                            <span className="inline-flex w-[124px] items-center justify-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 py-2 text-xs font-semibold text-[#b45309] dark:text-amber-400">
                              <PendingCountdown
                                expiresAt={session.expiresAt}
                                onExpire={refreshPending}
                              />
                            </span>
                          </div>
                        </button>
                      );
                    })
                  : null}

                {!isGuest ? (
                  <button
                    type="button"
                    onClick={() => setLinkSlug("__picker")}
                    className="flex w-full items-center gap-2.5 py-3 text-sm font-medium text-[#8874ff] transition-colors hover:bg-[#8874ff]/[0.06]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#8874ff]/30">
                      <Plus size={16} />
                    </span>
                    Connect another casino
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {showSkeleton
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-[rgba(42,39,78,0.05)] dark:bg-white/[0.04]"
                />
              ))
            : (
              <>
                {rows.map((acc) => {
                  const share = shareFor(acc.casinoSlug);
                  const belowMin = hasCryptoBalance(acc);
                  return (
                    <div
                      key={`m-${acc.casinoId}-${acc.connectedAccountId}`}
                      className="rounded-2xl border border-[rgba(42,39,78,0.1)] bg-white/[0.5] p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <AnalyticsCasinoIcon
                            casinoName={acc.casinoName}
                            size={30}
                            theme="auto"
                          />
                          <div className="min-w-0">
                            <span
                              className={`block truncate text-sm font-semibold ${text}`}
                            >
                              {acc.casinoName}
                            </span>
                            <p
                              className={`truncate text-[10px] font-medium ${soft} ${
                                isGuest ? "select-none blur-[2px]" : ""
                              }`}
                            >
                              {(acc.accounts?.length
                                ? acc.accounts.map((a) => a.externalUsername)
                                : [acc.externalUsername]
                              ).join(", ")}
                              {relativeSync(acc.lastSyncedAt) ? (
                                <span className={muted}>
                                  {" "}
                                  · Updated {relativeSync(acc.lastSyncedAt)}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <ActionButton
                          acc={acc}
                          isGuest={isGuest}
                          hasBelowMin={belowMin}
                          onRegister={openRegisterModal}
                          onClaim={() => {
                            setPayoutAccountId(null);
                            setClaimConfirm(acc);
                          }}
                        />
                      </div>
                      {acc.casinoSlug === "bcgame" ? (
                        <p className="mt-2 rounded-lg border border-blue-500/15 bg-blue-500/10 px-3 py-1.5 text-[10px] text-blue-400">
                          BC.Game moved to a new affiliate program on Sep 3,
                          2026. Earnings up to that date are settled; new play
                          is tracked and credited under the new program.
                        </p>
                      ) : null}
                      {acc.casinoSlug === "rollbit" &&
                      acc.commissionUsd === 0 ? (
                        <p className="mt-2 rounded-lg border border-amber-500/15 bg-amber-500/10 px-3 py-1.5 text-[10px] text-amber-400">
                          Rollbit commission may take time to appear. Make sure
                          you&apos;ve deposited and wagered first.
                        </p>
                      ) : null}
                      {belowMin ? <PaidInCryptoHint acc={acc} /> : null}
                      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-[rgba(42,39,78,0.08)] pt-3 dark:border-white/[0.06]">
                        <MobileStat
                          label="Share"
                          value={acc.customDeal ? "Custom" : `${share}%`}
                        />
                        <MobileStat
                          label="Wager"
                          value={`$${acc.wagerUsd.toLocaleString()}`}
                        />
                        <MobileStat
                          label="Earned"
                          value={`$${acc.commissionUsd.toLocaleString()}`}
                        />
                        <MobileStat
                          label="Claimed"
                          value={`$${acc.totalPaid.toLocaleString()}`}
                        />
                      </div>
                    </div>
                  );
                })}

                {!isGuest
                  ? pending.map((session) => {
                      const casino = CASINOS.find(
                        (c) => c.slug === session.casinoSlug,
                      );
                      if (!casino) return null;
                      return (
                        <button
                          key={`m-pending-${session.casinoSlug}`}
                          type="button"
                          onClick={() => setLinkSlug(session.casinoSlug)}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-3.5 text-left"
                        >
                          <div className="min-w-0">
                            <span className={`text-sm font-medium ${text}`}>
                              {casino.name}
                            </span>
                            <p className="truncate text-[11px] text-[#b45309] dark:text-amber-400">
                              {session.username}
                              <span className={muted}>
                                {" "}
                                · Verification pending
                              </span>
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-[#b45309] dark:text-amber-400">
                            <PendingCountdown
                              expiresAt={session.expiresAt}
                              onExpire={refreshPending}
                            />
                          </span>
                        </button>
                      );
                    })
                  : null}

                {!isGuest ? (
                  <button
                    type="button"
                    onClick={() => setLinkSlug("__picker")}
                    className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-[#8874ff]/30 px-3.5 py-3 text-sm font-medium text-[#8874ff]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[#8874ff]/30">
                      <Plus size={16} />
                    </span>
                    Connect another casino
                  </button>
                ) : null}
              </>
            )}
        </div>
      </Panel>

      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Transactions"
        className="max-w-lg"
      >
        {claims.length === 0 ? (
          <p className={`py-10 text-center text-[13px] ${muted}`}>
            No transactions yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {claims.map((claim) => {
              const name =
                (claim.casinoSlug || "").charAt(0).toUpperCase() +
                (claim.casinoSlug || "").slice(1);
              const when = new Date(claim.claimedAt);
              const logos = getCasinoLogoPair(claim.casinoSlug || "");
              const amount = parseFloat(claim.amount);
              const rejected = claim.status === "rejected";
              const hasCoin = !!(claim.coinCurrency && claim.coinAmount);
              const coinAmt = hasCoin ? parseFloat(claim.coinAmount!) : 0;
              const amountLabel = `${rejected ? "" : "+"}$${amount.toFixed(2)}`;
              const status =
                claim.status === "paid"
                  ? { label: "Confirmed", color: "var(--nd-profit)" }
                  : rejected
                    ? { label: "Rejected", color: "var(--nd-loss)" }
                    : {
                        label: "Pending",
                        color: "var(--tx-pending)",
                      };
              return (
                <div
                  key={claim.id}
                  className="relative rounded-2xl border-[0.5px] border-[rgba(42,39,78,0.08)] bg-[rgba(42,39,78,0.02)] px-3.5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-4 top-0 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent dark:block"
                  />
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[rgba(42,39,78,0.06)] p-1 dark:bg-white/10">
                      {logos ? (
                        <>
                          <Image
                            src={logos.light}
                            alt={name}
                            width={22}
                            height={22}
                            className="size-full object-contain dark:hidden"
                          />
                          <Image
                            src={logos.dark}
                            alt=""
                            width={22}
                            height={22}
                            className="hidden size-full object-contain dark:block"
                          />
                        </>
                      ) : (
                        <span className={`text-[10px] font-bold ${muted}`}>
                          {name[0]}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`truncate text-[13px] font-medium ${text}`}
                        >
                          {claim.tipUsername} · {name}
                        </p>
                        {hasCoin ? (
                          <CoinWagerHover
                            align="left"
                            valueClassName="flex shrink-0 cursor-help items-center"
                            value={
                              <Image
                                src={coinLogoSrc(claim.coinCurrency!)}
                                alt={claim.coinCurrency!}
                                width={15}
                                height={15}
                                className="size-[15px] rounded-full object-contain ring-1 ring-black/5 dark:ring-white/10"
                              />
                            }
                            breakdown={[
                              {
                                currency: claim.coinCurrency!,
                                amount: coinAmt,
                                usd: amount,
                              },
                            ]}
                          />
                        ) : null}
                      </div>
                      <p className={`text-[10px] ${muted}`}>
                        {when.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {when.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={`whitespace-nowrap text-[14px] font-semibold tabular-nums ${
                          rejected
                            ? "text-[rgba(42,39,78,0.4)] line-through dark:text-white/40"
                            : "text-[#1f9d57] dark:text-[#00ff86]"
                        }`}
                      >
                        {amountLabel}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium [--pill-mix:10%] [--tx-pending:#e0700f] dark:[--pill-glow:14%] dark:[--pill-hi:rgba(255,255,255,0.2)] dark:[--pill-mix:14%] dark:[--tx-pending:#fb923c]"
                        style={{
                          color: status.color,
                          backgroundColor: `color-mix(in srgb, ${status.color} var(--pill-mix), transparent)`,
                          boxShadow: `inset 0 1px 4px var(--pill-hi, transparent), inset 0 -4px 10px color-mix(in srgb, ${status.color} var(--pill-glow, 0%), transparent)`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                  {rejected && claim.rejectionReason ? (
                    <p
                      className={`mt-2 rounded-lg bg-red-500/[0.06] px-2.5 py-1.5 text-[11px] ${soft} dark:bg-red-500/[0.07]`}
                    >
                      <span className="font-medium text-[#dc2626] dark:text-red-400">
                        Reason:
                      </span>{" "}
                      {claim.rejectionReason}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {claimConfirm ? (
        <ClaimConfirmModal
          claimConfirm={claimConfirm}
          accounts={rows}
          payoutAccountId={payoutAccountId}
          setPayoutAccountId={setPayoutAccountId}
          claimSubmitting={claimSubmitting}
          claimError={claimError}
          onCancel={() => {
            if (!claimSubmitting) setClaimConfirm(null);
          }}
          onAddAccount={() => {
            setClaimConfirm(null);
            setLinkSlug("__picker");
          }}
          onConfirm={async () => {
            setClaimSubmitting(true);
            setClaimError(null);
            try {
              const payout = claimConfirm.tippable
                ? payoutAccountId &&
                  payoutAccountId !== claimConfirm.connectedAccountId
                  ? payoutAccountId
                  : undefined
                : (payoutAccountId ?? undefined);
              await claimAffiliateKickback(
                claimConfirm.casinoId,
                payout,
                claimConfirm.connectedAccountId,
              );
              setClaimConfirm(null);
              await refreshEarnings();
            } catch (err) {
              setClaimError(
                err instanceof Error ? err.message : "Failed to claim",
              );
            } finally {
              setClaimSubmitting(false);
            }
          }}
        />
      ) : null}

      <Modal
        open={linkSlug === "__picker"}
        onClose={() => setLinkSlug(null)}
        title="Earn Extra Rewards"
        className="max-w-lg"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...TOP_CASINOS, ...MORE_CASINOS]
            .filter((c) => c.slug !== "cybet" && c.slug !== "flush")
            .map((casino) => {
              const logos = getCasinoLogoPair(casino.slug, { withBg: true });
              return (
                <button
                  key={casino.slug}
                  type="button"
                  onClick={() => setLinkSlug(casino.slug)}
                  className="flex items-center gap-2.5 rounded-xl border-[0.5px] border-[rgba(42,39,78,0.12)] px-3 py-3 transition-colors hover:border-[#8874ff]/30 hover:bg-[#8874ff]/[0.06] dark:border-white/10"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[rgba(42,39,78,0.06)] dark:bg-white/10">
                    {logos ? (
                      <>
                        <Image
                          src={surfaceTile(logos, casino.slug, true)}
                          alt={casino.name}
                          width={32}
                          height={32}
                          className="size-full object-cover dark:hidden"
                        />
                        <Image
                          src={surfaceTile(logos, casino.slug, false)}
                          alt=""
                          width={32}
                          height={32}
                          className="hidden size-full object-cover dark:block"
                        />
                      </>
                    ) : (
                      <span className={`text-[10px] font-bold ${muted}`}>
                        {casino.name[0]}
                      </span>
                    )}
                  </span>
                  <span className={`text-[13px] font-medium ${text}`}>
                    {casino.name}
                  </span>
                </button>
              );
            })}
        </div>
      </Modal>

      {linkSlug && linkSlug !== "__picker" ? (
        <LinkAccountModal
          isOpen
          onClose={() => {
            setLinkSlug(null);
            if (promptVipAfterLink) {
              setPromptVipAfterLink(false);
              void maybeOpenVip();
            }
          }}
          casinoSlug={linkSlug}
          wagerSharePercent={kickbackBySlug.get(linkSlug)}
          onVerified={() => {
            void refreshEarnings();
            setPromptVipAfterLink(true);
          }}
          affiliateMode
        />
      ) : null}

      <VipTelegramModal open={vipOpen} onClose={() => setVipOpen(false)} />
    </section>
  );
}
