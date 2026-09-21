"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  getTelegramHandle,
  setTelegramHandle,
} from "@/lib/affiliate/client-api";

type VipTelegramModalProps = {
  open: boolean;
  onClose: () => void;
};

/** VIP host Telegram capture after first casino connect. */
export function VipTelegramModal({ open, onClose }: VipTelegramModalProps) {
  const { accessToken } = useAuth();
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !accessToken) return;
    let cancelled = false;
    getTelegramHandle(accessToken)
      .then((res) => {
        if (!cancelled && res.handle) {
          setHandle(res.handle);
          setSaved(true);
        }
      })
      .catch(() => {
        // ignore — form stays empty
      });
    return () => {
      cancelled = true;
    };
  }, [open, accessToken]);

  const save = async () => {
    if (!accessToken || saving || saved) return;
    const cleaned = handle.trim().replace(/^@/, "");
    if (!cleaned) return;
    setSaving(true);
    setError(false);
    try {
      const res = await setTelegramHandle(accessToken, cleaned);
      if (res.handle) setHandle(res.handle);
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      padded={false}
      closeButton
      ariaLabel="VIP Telegram bonuses"
      className="max-w-[400px] overflow-hidden"
    >
      <div className="relative h-[190px] w-full">
        <Image
          src="/affiliate/vip-host.jpg"
          alt="Lana, your VIP host"
          fill
          priority
          sizes="400px"
          className="object-cover object-[50%_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-black/20 dark:from-[#0f1424] dark:via-[#0f1424]/30 dark:to-black/20" />
        <div className="absolute left-5 top-4 flex items-center gap-2">
          <Image
            src="/icons/fg-icon.svg"
            alt=""
            width={22}
            height={20}
            style={{ height: "auto" }}
          />
          <Image
            src="/icons/fairgambling-logo-dark.svg"
            alt="FairGambling"
            width={100}
            height={13}
            style={{ height: "auto" }}
          />
        </div>
        <div className="absolute bottom-2.5 left-5 flex flex-col">
          <span className="text-[15px] font-semibold text-[#2a274e] dark:text-white">
            Lana
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(42,39,78,0.55)] dark:text-white/55">
            FairGambling VIP Host
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 pt-3">
        {saved ? (
          <div className="flex flex-col items-center gap-4 pt-1 text-center">
            <span
              className="flex size-12 items-center justify-center rounded-full text-white"
              style={{
                background: "linear-gradient(180deg, #8874ff 0%, #5105a1 100%)",
                boxShadow:
                  "0 0 22px rgba(153,51,229,0.32), 0 0 4px rgba(184,71,255,0.5)",
              }}
            >
              <Check size={24} strokeWidth={3.5} />
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-[17px] font-semibold text-[#2a274e] dark:text-white">
                You&apos;re on Lana&apos;s List
              </p>
              <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.6)] dark:text-white/60">
                She&apos;ll reach out to{" "}
                <span className="font-medium text-[#2a274e] dark:text-white">
                  @{handle.replace(/^@/, "")}
                </span>{" "}
                when there&apos;s something for you.
              </p>
            </div>
            <Button
              theme="auto"
              variant="primary"
              size="md"
              className="mt-2 w-full"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-[17px] font-semibold text-[#2a274e] dark:text-white">
                One Last Step to Extra Kickback
              </p>
              <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.6)] dark:text-white/60">
                Leave your Telegram so our VIP host can keep in contact with
                you.
              </p>
            </div>
            <div className="flex h-[42px] items-center gap-2 rounded-[22px] border border-[rgba(42,39,78,0.15)] bg-white pl-4 pr-1 dark:border-white/10 dark:bg-white/[0.02]">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void save();
                }}
                placeholder="@username"
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-[14px] font-light text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.5)] dark:text-white dark:placeholder:text-white/40"
              />
            </div>
            {error ? (
              <p className="-mt-2 text-[12px] text-[#f05959]">
                Could not save your handle — please try again.
              </p>
            ) : null}
            <Button
              theme="auto"
              variant="primary"
              size="md"
              className="w-full"
              disabled={saving || !handle.trim()}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Get VIP Bonuses"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 self-center text-[12px] text-[rgba(42,39,78,0.45)] transition-colors hover:text-[rgba(42,39,78,0.7)] dark:text-white/40 dark:hover:text-white/70"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
