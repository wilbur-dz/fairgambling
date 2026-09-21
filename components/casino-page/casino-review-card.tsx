"use client";

import Image from "next/image";
import { Share2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { CasinoVipRankBadge } from "@/components/casino-page/casino-vip-rank-badge";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { ReviewItem } from "@/lib/reviews/data";
import {
  formatRelativeTime,
  formatVerifiedBadgeText,
  reviewPermalink,
} from "@/lib/reviews/format";
import { voteOnReview } from "@/lib/reviews/vote-on-review";

type CasinoReviewCardProps = {
  review: ReviewItem;
  casinoSlug: string;
  casinoName: string;
  highlighted?: boolean;
  onVerify?: () => void;
};

function ReviewStars({ filled, size = 16 }: { filled: number; size?: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= filled
              ? "fill-[#FFCF2F] text-[#FFCF2F]"
              : "text-[rgba(42,39,78,0.2)] dark:text-white/15"
          }
        />
      ))}
    </div>
  );
}

function ReviewAvatar({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={36}
        height={36}
        className="size-8 shrink-0 rounded-full object-cover md:size-9"
        unoptimized={url.startsWith("http")}
      />
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#8874ff] text-[14px] font-medium text-white md:size-9 md:text-[16px]">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/** Port of reference casino review card `T` (3gytcvcyv09c7.js). */
export function CasinoReviewCard({
  review,
  casinoSlug,
  casinoName,
  highlighted = false,
  onVerify,
}: CasinoReviewCardProps) {
  const { isAuthenticated, user, accessToken } = useAuth();
  const { openLoginModal } = useAuthModal();

  const ink = "text-[#2a274e] dark:text-white";
  const muted = "text-[rgba(42,39,78,0.55)] dark:text-white/50";
  const displayName =
    review.user?.deactivated || review.author === "Deleted account"
      ? "Deleted account"
      : review.user?.username ?? review.author ?? "Anonymous";
  const resolvedCasinoName = review.casinoName || casinoName;
  const isOwn = Boolean(user?.id && user.id === review.userId);

  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(
    review.userVote ?? null,
  );
  const [counts, setCounts] = useState({
    helpful: review.votes?.helpful ?? review.helpfulCount ?? 0,
    notHelpful: review.votes?.notHelpful ?? review.notHelpfulCount ?? 0,
  });
  const [voting, setVoting] = useState(false);

  const onShare = async () => {
    try {
      const url = `${window.location.origin}${reviewPermalink(casinoSlug, review.id)}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied
    }
  };

  const onVote = async (next: 1 | -1) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (isOwn || voting) return;

    const prevVote = userVote;
    const prevCounts = { ...counts };
    const applied: 0 | 1 | -1 = prevVote === next ? 0 : next;

    setVoting(true);
    setUserVote(applied === 0 ? null : applied);
    setCounts((c) => {
      let helpful = c.helpful;
      let notHelpful = c.notHelpful;
      if (prevVote === 1) helpful = Math.max(0, helpful - 1);
      if (prevVote === -1) notHelpful = Math.max(0, notHelpful - 1);
      if (applied === 1) helpful += 1;
      if (applied === -1) notHelpful += 1;
      return { helpful, notHelpful };
    });

    try {
      await voteOnReview(review.id, applied, accessToken);
    } catch {
      setUserVote(prevVote);
      setCounts(prevCounts);
    } finally {
      setVoting(false);
    }
  };

  const voteClass = `flex items-center gap-1.5 transition-colors ${
    voting || isOwn
      ? "cursor-not-allowed opacity-60"
      : "hover:text-[#2a274e] dark:hover:text-white"
  }`;

  const bodyHtml = review.body?.trim();

  return (
    <div
      id={`review-${review.id}`}
      className={`scroll-mt-24 ${
        highlighted ? "rounded-[24px] ring-1 ring-[#8874ff]/70" : ""
      }`}
    >
      <Card
        variant="panel"
        blur
        contentClassName="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className={`truncate text-[15px] font-medium ${ink}`}>
              {review.title || "Review"}
            </p>
            {review.isVerified ? (
              <Tooltip
                content={formatVerifiedBadgeText({
                  ...review,
                  casinoName: resolvedCasinoName,
                })}
              >
                <span
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[#00FF86]/15 text-[10px] font-bold text-[#1f9d57] dark:text-[#00FF86]"
                  aria-label="Verified review"
                >
                  ✓
                </span>
              </Tooltip>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-[14px]">
            <Star size={14} className="fill-[#FFCF2F] text-[#FFCF2F]" />
            <span className={`font-bold ${ink}`}>
              {(review.rating ?? 0).toFixed(1)}
            </span>
            <span className={muted}>/ 5</span>
          </div>
        </div>

        {bodyHtml ? (
          <div
            className={`whitespace-pre-wrap text-[14px] leading-normal [&_p]:mb-0 ${muted}`}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-[rgba(42,39,78,0.1)] pt-3 md:gap-4 md:pt-4 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <ReviewAvatar url={review.user?.avatarUrl} name={displayName} />
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`truncate text-[14px] ${ink}`}>
                  {displayName}
                </span>
                {review.isVerified && review.verifiedVipRank ? (
                  <Tooltip
                    content={
                      <>
                        <span className={`font-semibold ${ink}`}>
                          {review.verifiedVipRank}
                        </span>
                        {" on "}
                        <span className={`font-semibold ${ink}`}>
                          {resolvedCasinoName || "this casino"}
                        </span>
                        {review.verifiedTotalWagered &&
                        parseFloat(review.verifiedTotalWagered) > 0 ? (
                          <>
                            {" with "}
                            <span className={`font-semibold ${ink}`}>
                              $
                              {Math.round(
                                parseFloat(review.verifiedTotalWagered),
                              ).toLocaleString("en-US")}{" "}
                              wagered
                            </span>
                          </>
                        ) : null}{" "}
                        at the time of the review
                      </>
                    }
                  >
                    <CasinoVipRankBadge rank={review.verifiedVipRank} />
                  </Tooltip>
                ) : null}
              </div>
              <span
                className={`text-[12px] ${muted}`}
                suppressHydrationWarning
              >
                {formatRelativeTime(review.createdAt)}
              </span>
            </div>
          </div>

          <div
            className={`flex shrink-0 items-center gap-2 text-[13px] md:gap-4 ${muted}`}
          >
            {onVerify && isOwn && !review.isVerified ? (
              <Button
                theme="auto"
                variant="primary"
                size="sm"
                className="px-2.5! py-1.5! text-[12px]! md:px-3.5! md:py-[9px]! md:text-[14px]!"
                onClick={onVerify}
              >
                <span className="md:hidden">Verify</span>
                <span className="hidden md:inline">Verify Now</span>
              </Button>
            ) : null}
            <button
              type="button"
              onClick={onShare}
              aria-label="Share review"
              className="relative flex items-center transition-colors hover:text-[#2a274e] dark:hover:text-white"
            >
              <Share2 size={16} />
              {copied ? (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#12121f] px-2 py-1 text-[12px] text-white shadow-lg ring-1 ring-white/10">
                  Link copied
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onVote(1)}
              disabled={voting || isOwn}
              className={voteClass}
            >
              <ThumbsUp
                size={16}
                className={
                  userVote === 1 ? "text-[#1f9d57] dark:text-[#00FF86]" : ""
                }
              />
              <span
                className={
                  userVote === 1 ? "text-[#1f9d57] dark:text-[#00FF86]" : ""
                }
              >
                {counts.helpful}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onVote(-1)}
              disabled={voting || isOwn}
              className={voteClass}
            >
              <ThumbsDown
                size={16}
                className={
                  userVote === -1 ? "text-[#dc2626] dark:text-[#F7575F]" : ""
                }
              />
              <span
                className={
                  userVote === -1 ? "text-[#dc2626] dark:text-[#F7575F]" : ""
                }
              >
                {counts.notHelpful}
              </span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export { ReviewStars };
