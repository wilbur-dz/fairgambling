"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { connectAffiliateAccount } from "@/lib/affiliate/client-api";
import { CASINO_BY_SLUG } from "@/lib/affiliate/data";
import { setPendingSession } from "@/lib/affiliate/pending-session";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

type LinkAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  casinoSlug: string;
  wagerSharePercent?: number;
  onVerified?: () => void;
  affiliateMode?: boolean;
};

/**
 * Simplified link-account flow (reference `LinkAccountModal`).
 * Tries live connect API; on failure stores a pending verification session
 * so the overview can show the countdown row.
 */
export function LinkAccountModal({
  isOpen,
  onClose,
  casinoSlug,
  wagerSharePercent,
  onVerified,
}: LinkAccountModalProps) {
  const { isAuthenticated } = useAuth();
  const { openRegisterModal } = useAuthModal();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const casino = CASINO_BY_SLUG[casinoSlug];
  const logos = getCasinoLogoPair(casinoSlug, { withBg: true });

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, casinoSlug]);

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      openRegisterModal();
      onClose();
    }
  }, [isOpen, isAuthenticated, openRegisterModal, onClose]);

  if (!isOpen || !casino || !isAuthenticated) return null;

  const submit = async () => {
    const name = username.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await connectAffiliateAccount(casinoSlug, name);
      onVerified?.();
      onClose();
    } catch (err) {
      // Demo / offline: keep a pending row so the UI still progresses.
      try {
        setPendingSession(casinoSlug, name);
        onVerified?.();
        onClose();
        return;
      } catch {
        setError(err instanceof Error ? err.message : "Failed to connect");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Link Account"
      className="max-w-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[rgba(42,39,78,0.12)] bg-[rgba(42,39,78,0.04)] p-1.5 dark:border-white/10 dark:bg-white/[0.04]">
            {logos ? (
              <>
                <Image
                  src={logos.light}
                  alt={casino.name}
                  width={36}
                  height={36}
                  className="size-full object-contain dark:hidden"
                />
                <Image
                  src={logos.dark}
                  alt=""
                  width={36}
                  height={36}
                  className="hidden size-full object-contain dark:block"
                />
              </>
            ) : (
              <span className="text-sm font-bold text-[#2a274e] dark:text-white">
                {casino.name[0]}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-[#2a274e] dark:text-white">
              {casino.name}
            </p>
            {wagerSharePercent != null ? (
              <p className="text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
                {wagerSharePercent}% wager share
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor={`link-username-${casinoSlug}`}
            className="mb-1.5 block text-[13px] font-medium text-[#2a274e] dark:text-white"
          >
            {casino.name} Username
          </label>
          <input
            id={`link-username-${casinoSlug}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            placeholder={`Enter your ${casino.name} username`}
            className="w-full rounded-xl border-[0.5px] border-[rgba(42,39,78,0.15)] bg-white px-3 py-2.5 text-sm text-[#2a274e] outline-none focus:border-[#8874ff]/50 dark:border-white/20 dark:bg-white/[0.03] dark:text-white"
            disabled={submitting}
          />
        </div>

        {error ? (
          <p className="text-[12px] text-red-500 dark:text-red-400">{error}</p>
        ) : null}

        <p className="text-xs text-center text-[rgba(42,39,78,0.5)] dark:text-white/50">
          You&apos;ll need to place a verification bet on {casino.name}
        </p>

        <Button
          theme="auto"
          variant="primary"
          className="w-full justify-center"
          disabled={submitting || !username.trim()}
          onClick={() => void submit()}
        >
          {submitting ? "Checking…" : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}
