"use client";

import Image from "next/image";
import { CircleAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { coinLogoSrc } from "@/lib/affiliate/coin-logo";
import type { AffiliateAccount } from "@/lib/affiliate/data";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

type ClaimConfirmModalProps = {
  claimConfirm: AffiliateAccount;
  accounts: AffiliateAccount[];
  payoutAccountId: number | null;
  setPayoutAccountId: (id: number | null) => void;
  claimSubmitting: boolean;
  claimError: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  onAddAccount?: () => void;
};

export function ClaimConfirmModal({
  claimConfirm: acc,
  accounts,
  payoutAccountId,
  setPayoutAccountId,
  claimSubmitting,
  claimError,
  onCancel,
  onConfirm,
  onAddAccount,
}: ClaimConfirmModalProps) {
  const text = "text-[#2a274e] dark:text-white";
  const muted = "text-[rgba(42,39,78,0.4)] dark:text-white/40";
  const soft = "text-[rgba(42,39,78,0.5)] dark:text-white/50";
  const chip = "bg-[rgba(42,39,78,0.06)] dark:bg-white/10";
  const logos = getCasinoLogoPair(acc.casinoSlug);
  const claimableCoins = (acc.coins ?? [])
    .filter((c) => c.claimableNow)
    .sort((a, b) => b.claimableUsd - a.claimableUsd);
  const showCrypto =
    claimableCoins.length > 0 || (acc.legacyClaimable ?? 0) > 0;
  const tippableOthers = accounts.filter(
    (a) => a.tippable && a.connectedAccountId !== acc.connectedAccountId,
  );
  const multiAccounts = acc.accounts ?? [];
  const hasMultiOnSame = acc.tippable && multiAccounts.length > 1;
  const selectedId = payoutAccountId ?? acc.connectedAccountId;
  const displayUsername = hasMultiOnSame
    ? (multiAccounts.find((a) => a.connectedAccountId === selectedId)
        ?.externalUsername ?? acc.externalUsername)
    : acc.externalUsername;

  return (
    <Modal
      open
      onClose={onCancel}
      title="Confirm Claim"
      className="max-w-sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-[rgba(42,39,78,0.6)] dark:text-white/60">
          Are you sure you want to claim your rewards?
        </p>

        <Card
          variant="glass"
          theme="auto"
          contentClassName="flex flex-col gap-2"
        >
          <p className={`text-xs ${muted}`}>Your rewards will be tipped to</p>
          <div className="flex items-center gap-2.5">
            {logos ? (
              <span
                className={`flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg p-0.5 ${chip}`}
              >
                <Image
                  src={logos.light}
                  alt={acc.casinoName}
                  width={20}
                  height={20}
                  className="size-full object-contain dark:hidden"
                />
                <Image
                  src={logos.dark}
                  alt=""
                  width={20}
                  height={20}
                  className="hidden size-full object-contain dark:block"
                />
              </span>
            ) : null}
            <div>
              <span className={`text-sm font-semibold ${text}`}>
                {displayUsername}
              </span>
              <p className={`text-[11px] ${muted}`}>{acc.casinoName}</p>
            </div>
            <span className="ml-auto text-lg font-bold text-[#6b56e0] dark:text-[#8874ff]">
              ${acc.claimable.toLocaleString()}
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${muted}`}>
            Your tip will be there in a few seconds.
          </p>
        </Card>

        {showCrypto ? (
          <Card
            variant="glass"
            theme="auto"
            contentClassName="flex flex-col gap-2.5"
          >
            <p className={`text-xs ${muted}`}>Paid in crypto</p>
            <div className="space-y-1.5">
              {(acc.legacyClaimable ?? 0) > 0 ? (
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full ${chip}`}
                  >
                    <Image
                      src={coinLogoSrc("USDT")}
                      alt="USDT"
                      width={20}
                      height={20}
                      className="size-full object-contain"
                    />
                  </span>
                  <span
                    className={`text-[13px] font-medium tabular-nums ${text}`}
                  >
                    {acc.legacyClaimable!.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className={`font-normal ${muted}`}>USDT</span>
                  </span>
                  <span
                    className={`ml-auto text-[10px] uppercase tracking-wide ${muted}`}
                  >
                    earlier balance
                  </span>
                </div>
              ) : null}
              {claimableCoins.map((c) => (
                <div key={c.currency} className="flex items-center gap-2.5">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full ${chip}`}
                  >
                    <Image
                      src={coinLogoSrc(c.currency)}
                      alt={c.currency}
                      width={20}
                      height={20}
                      className="size-full object-contain"
                    />
                  </span>
                  <span
                    className={`text-[13px] font-medium tabular-nums ${text}`}
                  >
                    {c.claimableAmount.toLocaleString(undefined, {
                      maximumFractionDigits:
                        c.claimableAmount >= 1 ? 4 : 8,
                    })}{" "}
                    <span className={`font-normal ${muted}`}>{c.currency}</span>
                  </span>
                  <span
                    className={`ml-auto text-[11px] tabular-nums ${muted}`}
                  >
                    ~$
                    {c.claimableUsd.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
            {claimableCoins.length > 0 ? (
              <p className={`text-[11px] leading-relaxed ${muted}`}>
                Crypto prices move over time, so your total earned in dollars
                can fluctuate. The coin amounts shown are what you get paid.
              </p>
            ) : null}
          </Card>
        ) : null}

        {hasMultiOnSame ? (
          <div className="space-y-2">
            <p className={`text-xs ${muted}`}>
              You have {multiAccounts.length} accounts on {acc.casinoName}.
              Choose which one receives this payout.
            </p>
            <div className="space-y-1.5">
              {multiAccounts.map((a) => {
                const active = selectedId === a.connectedAccountId;
                return (
                  <button
                    key={a.connectedAccountId}
                    type="button"
                    onClick={() => setPayoutAccountId(a.connectedAccountId)}
                    className={`flex w-full items-center gap-2.5 rounded-[14px] border-[0.5px] px-3 py-2.5 backdrop-blur-[20px] transition-colors ${
                      active
                        ? "border-[#8874ff]/60 bg-[#8874ff]/[0.08] shadow-[0_0_10px_rgba(136,116,255,0.15)]"
                        : "border-[rgba(42,39,78,0.12)] bg-white/[0.4] hover:bg-[rgba(42,39,78,0.04)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 text-left">
                      <span
                        className={`block truncate text-xs font-medium ${text}`}
                      >
                        {a.externalUsername}
                      </span>
                    </span>
                    <span
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                        active
                          ? "border-[#8874ff] bg-[#8874ff] text-white"
                          : "border-[rgba(42,39,78,0.2)] dark:border-white/20"
                      }`}
                    >
                      {active ? (
                        <svg
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!acc.tippable ? (
          <div className="space-y-2.5 rounded-[16px] border-[0.5px] border-[rgba(42,39,78,0.12)] bg-white/[0.4] px-3.5 py-3 backdrop-blur-[20px] dark:border-white/10 dark:bg-white/[0.02]">
            <p className={`text-[11px] leading-relaxed ${soft}`}>
              {acc.casinoName} payouts can&apos;t be sent on {acc.casinoName}.
              Choose another connected account to receive this payout (in
              USDT).
            </p>
            {tippableOthers.length === 0 ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-[12px] border-[0.5px] border-amber-500/20 bg-amber-500/[0.06] px-3 py-2">
                  <CircleAlert
                    size={13}
                    className="shrink-0 text-amber-500 dark:text-amber-400"
                  />
                  <p className={`text-[11px] leading-snug ${soft}`}>
                    No other connected account can receive a tip.
                  </p>
                </div>
                {onAddAccount ? (
                  <Button
                    theme="auto"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    leftIcon={<Plus />}
                    onClick={onAddAccount}
                  >
                    Connect an Account
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1.5">
                {tippableOthers.map((a) => {
                  const logosOther = getCasinoLogoPair(a.casinoSlug);
                  const active = payoutAccountId === a.connectedAccountId;
                  return (
                    <button
                      key={a.connectedAccountId}
                      type="button"
                      onClick={() => setPayoutAccountId(a.connectedAccountId)}
                      className={`flex w-full items-center gap-2.5 rounded-[14px] border-[0.5px] px-3 py-2.5 backdrop-blur-[20px] transition-colors ${
                        active
                          ? "border-[#8874ff]/60 bg-[#8874ff]/[0.08] shadow-[0_0_10px_rgba(136,116,255,0.15)]"
                          : "border-[rgba(42,39,78,0.12)] bg-white/[0.4] hover:bg-[rgba(42,39,78,0.04)] dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border-[0.5px] border-[rgba(42,39,78,0.12)] bg-white/[0.6] p-1 backdrop-blur-md dark:border-white/15 dark:bg-white/[0.05]">
                        {logosOther ? (
                          <>
                            <Image
                              src={logosOther.light}
                              alt={a.casinoName}
                              width={20}
                              height={20}
                              className="size-full object-contain dark:hidden"
                            />
                            <Image
                              src={logosOther.dark}
                              alt=""
                              width={20}
                              height={20}
                              className="hidden size-full object-contain dark:block"
                            />
                          </>
                        ) : (
                          <span className={`text-[10px] font-bold ${muted}`}>
                            {a.casinoName[0]}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span
                          className={`block truncate text-xs font-medium ${text}`}
                        >
                          {a.externalUsername}
                        </span>
                        <span className={`block text-[10px] ${muted}`}>
                          {a.casinoName}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 rounded-full border-[0.5px] border-[rgba(42,39,78,0.12)] bg-[rgba(42,39,78,0.04)] py-0.5 pl-1 pr-1.5 dark:border-white/10 dark:bg-white/[0.06]">
                        <Image
                          src={coinLogoSrc("USDT")}
                          alt="USDT"
                          width={12}
                          height={12}
                          className="size-3 rounded-full object-contain"
                        />
                        <span className={`text-[9px] font-medium ${muted}`}>
                          USDT
                        </span>
                      </span>
                      <span
                        className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? "border-[#8874ff] bg-[#8874ff] text-white"
                            : "border-[rgba(42,39,78,0.2)] dark:border-white/20"
                        }`}
                      >
                        {active ? (
                          <svg
                            className="size-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {claimError ? (
          <div className="flex items-center gap-2 rounded-full border-[0.5px] border-red-500/20 bg-red-500/[0.06] px-3.5 py-2 backdrop-blur-[20px]">
            <CircleAlert
              size={13}
              className="shrink-0 text-red-500 dark:text-red-400"
            />
            <p className="min-w-0 text-xs leading-snug text-red-700 dark:text-red-300/90">
              {claimError}
            </p>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button
            theme="auto"
            variant="ghost"
            className="flex-1 justify-center"
            onClick={onCancel}
            disabled={claimSubmitting}
          >
            Cancel
          </Button>
          <Button
            theme="auto"
            variant="primary"
            className="flex-1 justify-center"
            onClick={onConfirm}
            disabled={claimSubmitting || (!acc.tippable && !payoutAccountId)}
          >
            {claimSubmitting ? "Claiming…" : "Confirm Claim"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
