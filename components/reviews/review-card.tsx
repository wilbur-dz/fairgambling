"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Share2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Fragment, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { hasVerifyPath } from "@/lib/reviews/constants";
import type { ReviewItem } from "@/lib/reviews/data";
import {
  casinoPageHref,
  casinoRouteSlug,
  formatRelativeTime,
  formatVerifiedBadgeText,
  reviewPermalink,
  stripReviewHtml,
} from "@/lib/reviews/format";
import { voteOnReview } from "@/lib/reviews/vote-on-review";

const BADGE = {
  helpful: { label: "Most Helpful", color: "#00FF86" },
  critical: { label: "Critical", color: "#F7575F" },
} as const;

export type ReviewBadge = keyof typeof BADGE;

type ReviewCardProps = {
  review: ReviewItem;
  badge?: ReviewBadge;
  bodyLines?: 2 | 3;
};

/** Port of reference review card (`D`). */
export function ReviewCard({
  review,
  badge,
  bodyLines = 2,
}: ReviewCardProps) {
  const router = useRouter();
  const { isAuthenticated, user, accessToken } = useAuth();
  const { openLoginModal } = useAuthModal();

  const casinoName = review.casinoName || "Casino";
  const casinoSlug = review.casinoSlug || "stake";
  const routeSlug = casinoRouteSlug(casinoSlug);
  const rating = review.rating ?? 0;
  const isOwn = user?.id === review.userId;
  const showVerify =
    isOwn && !review.isVerified && hasVerifyPath(routeSlug);

  const [userVote, setUserVote] = useState<1 | -1 | null>(
    review.userVote ?? null,
  );
  const [counts, setCounts] = useState({
    helpful: review.votes?.helpful ?? review.helpfulCount ?? 0,
    notHelpful: review.votes?.notHelpful ?? review.notHelpfulCount ?? 0,
  });
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);

  const bodyText = stripReviewHtml(review.body ?? "");

  const voteButtonClass = `flex items-center gap-2 transition-opacity ${
    voting || isOwn
      ? "cursor-not-allowed opacity-50"
      : "hover:opacity-80"
  }`;

  const onShare = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${reviewPermalink(routeSlug, review.id)}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be denied
    }
  };

  const onVote = async (event: React.MouseEvent, next: 1 | -1) => {
    event.preventDefault();
    event.stopPropagation();
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
    setCounts((current) => {
      let helpful = current.helpful;
      let notHelpful = current.notHelpful;
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

  return (
    <Fragment>
      <Card
        variant="glass"
        theme="auto"
        padded={false}
        className="px-4 py-3 md:p-4"
        contentClassName="flex flex-col gap-4 md:gap-6"
      >
        <div
          className={`flex items-center ${
            badge ? "justify-between" : "gap-4"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-8 shrink-0">
              <AnalyticsCasinoIcon
                casinoName={casinoName}
                size={32}
                theme="auto"
              />
            </span>
            <Link
              href={`${casinoPageHref(routeSlug)}#reviews`}
              prefetch={false}
              className="truncate text-[16px] font-semibold text-[#2a274e] hover:opacity-80 dark:text-white"
            >
              {casinoName}
            </Link>
            {review.isVerified ? (
              <Tooltip
                content={formatVerifiedBadgeText({
                  ...review,
                  casinoName,
                })}
              >
                <span
                  className="inline-flex size-3.5 shrink-0 translate-y-px items-center justify-center rounded-full bg-[#00FF86]/15 text-[9px] font-bold text-[#1f9d57] dark:text-[#00FF86]"
                  aria-hidden
                >
                  ✓
                </span>
              </Tooltip>
            ) : null}
          </div>
          <span className="flex shrink-0 items-center gap-1">
            <Star size={14} className="text-[#FFCF2F]" fill="currentColor" />
            <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
              {rating}
            </span>
            <span className="text-[12px] text-[#2a274e]/50 dark:text-[#97a1af]">
              / 5
            </span>
          </span>
        </div>

        <p
          className={`text-[14px] leading-normal text-[#2a274e]/60 dark:text-white/50 ${
            bodyLines === 3
              ? "line-clamp-3 min-h-[3lh]"
              : "line-clamp-2 min-h-[2lh]"
          }`}
        >
          {bodyText}
        </p>

        <div className="flex items-center justify-between text-[14px]">
          {badge ? (
            <span
              className={`rounded-[4px] px-[6px] py-[2px] text-[10px] font-medium ${
                badge === "helpful"
                  ? "text-[#1f9d57] dark:text-[#00FF86]"
                  : "text-[#F7575F]"
              }`}
              style={{ backgroundColor: `${BADGE[badge].color}1a` }}
            >
              {BADGE[badge].label}
            </span>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <span
                suppressHydrationWarning
                className="shrink-0 text-[#2a274e]/50 dark:text-white/50"
              >
                {formatRelativeTime(review.createdAt)}
              </span>
              <Link
                href={reviewPermalink(routeSlug, review.id)}
                prefetch={false}
                className="shrink-0 text-[#8874ff] underline underline-offset-2 hover:opacity-80"
              >
                View full review
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 text-[16px] md:gap-6">
            {showVerify ? (
              <Button
                theme="auto"
                variant="primary"
                size="sm"
                className="px-2.5! py-1! text-[12px]!"
                onClick={() => router.push(`/${routeSlug}/reviews`)}
              >
                Verify
              </Button>
            ) : null}
            <button
              type="button"
              onClick={onShare}
              aria-label="Share review"
              className="relative flex items-center text-[#2a274e]/50 transition-colors hover:text-[#2a274e] dark:text-white/50 dark:hover:text-white"
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
              onClick={(event) => onVote(event, 1)}
              disabled={voting || isOwn}
              className={voteButtonClass}
            >
              <ThumbsUp
                size={16}
                className={
                  userVote === 1 ? "text-[#1f9d57] dark:text-[#00FF86]" : ""
                }
                fill={userVote === 1 ? "currentColor" : "none"}
              />
              <span
                className={
                  userVote === 1
                    ? "text-[#1f9d57] dark:text-[#00FF86]"
                    : "text-[#2a274e]/50 dark:text-white/50"
                }
              >
                {counts.helpful}
              </span>
            </button>
            <button
              type="button"
              onClick={(event) => onVote(event, -1)}
              disabled={voting || isOwn}
              className={voteButtonClass}
            >
              <ThumbsDown
                size={16}
                className={userVote === -1 ? "text-[#F7575F]" : ""}
                fill={userVote === -1 ? "currentColor" : "none"}
              />
              <span
                className={
                  userVote === -1
                    ? "text-[#F7575F]"
                    : "text-[#2a274e]/50 dark:text-white/50"
                }
              >
                {counts.notHelpful}
              </span>
            </button>
          </div>
        </div>
      </Card>
    </Fragment>
  );
}
