"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { formatLeaderboardWager } from "@/components/leaderboard/format";
import { Modal } from "@/components/ui/modal";
import { fetchUserByUsername } from "@/lib/users/api";
import type { UserProfile } from "@/lib/users/types";
import { getCasinoLogoPair } from "@/lib/casinos/logos";

type ProfilePopupProps = {
  username: string;
  onClose: () => void;
};

function formatMemberSince(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function StatCell({
  label,
  value,
  blurred,
}: {
  label: string;
  value: string;
  blurred?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="mb-2 text-[11px] uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/30">
        {label}
      </p>
      <p
        className={`text-[15px] font-semibold text-[#2a274e] dark:text-white ${
          blurred ? "select-none blur-sm" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/** Profile detail dialog — port of reference `ProfilePopup` (mock/2). */
export function ProfilePopup({ username, onClose }: ProfilePopupProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setProfile(null);

    void fetchUserByUsername(username)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  const ghost = failed || (profile?.ghostMode ?? false);

  return (
    <Modal
      open
      onClose={onClose}
      closeButton
      padded={false}
      className="max-w-[560px]"
      ariaLabel={`${username}'s profile`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(42,39,78,0.15)] border-t-[#8874ff] dark:border-white/20" />
        </div>
      ) : null}

      {!loading && (failed || profile) ? (
        <>
          <div className="flex flex-col items-center px-6 pb-4 pt-7">
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-gradient-to-b from-[#8874ff] to-[#5105a1] p-[3px]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#ece9ff] dark:bg-[#0f1424]">
                {profile?.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt={profile.username}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User
                    size={32}
                    className="text-[rgba(42,39,78,0.45)] dark:text-white/40"
                  />
                )}
              </div>
            </div>

            <h2 className="mb-1 text-[22px] font-bold tracking-tight text-[#2a274e] dark:text-white">
              {profile?.username ?? username}
            </h2>

            <div className="mb-5 mt-4 w-full border-t border-[rgba(42,39,78,0.1)] dark:border-white/[0.08]" />

            <div className="grid w-full grid-cols-4 gap-3">
              <StatCell
                label="Member since"
                value={
                  failed
                    ? "—"
                    : formatMemberSince(profile?.memberSince ?? "")
                }
                blurred={failed}
              />
              <StatCell
                label="Total reviews"
                value={failed ? "0" : String(profile?.totalReviews ?? 0)}
                blurred={failed}
              />
              <StatCell
                label="Total wager"
                value={
                  ghost
                    ? "$0"
                    : formatLeaderboardWager(profile?.totalWager ?? 0)
                }
                blurred={ghost}
              />
              <StatCell
                label="Total earned"
                value={
                  ghost
                    ? "$0"
                    : formatLeaderboardWager(profile?.totalClaimed ?? 0)
                }
                blurred={ghost}
              />
            </div>
          </div>

          {!failed && profile && profile.connectedCasinos.length > 0 ? (
            <div className="px-5 pb-6">
              <div className="grid grid-cols-2 gap-2">
                {profile.connectedCasinos.map((casino, index) => {
                  const logos = getCasinoLogoPair(casino.slug);
                  return (
                    <div
                      key={`${casino.slug}-${index}`}
                      className="flex items-center gap-2.5 rounded-[12px] border-[0.5px] border-[rgba(42,39,78,0.15)] bg-[linear-gradient(270deg,#f4f2ff_0%,#eeeaff_50%,#f4f2ff_100%)] px-3 py-2.5 dark:border-white/20 dark:bg-[linear-gradient(270deg,#2A274E_0%,#312E5E_50%,#2A274E_100%)]"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[rgba(42,39,78,0.06)] dark:bg-white/5">
                        {logos ? (
                          <Image
                            src={logos.dark}
                            alt={casino.name}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-[11px] font-semibold text-[rgba(42,39,78,0.6)] dark:text-white/60">
                            {casino.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="min-w-0 truncate text-[13px] font-medium text-[#2a274e] dark:text-white">
                        {casino.name}
                      </p>
                      <div className="ml-auto flex flex-shrink-0 items-center gap-1.5">
                        <span className="text-[11px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
                          Wager:
                        </span>
                        <span
                          className={`text-[13px] font-semibold text-[#2a274e] dark:text-white ${
                            ghost ? "select-none blur-sm" : ""
                          }`}
                        >
                          {ghost
                            ? "$0"
                            : formatLeaderboardWager(
                                Number(casino.totalWagered) || 0,
                              )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </Modal>
  );
}
