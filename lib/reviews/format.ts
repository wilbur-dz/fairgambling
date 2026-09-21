const CASINO_ROUTE_ALIASES: Record<string, string> = {
  "500-casino": "500casino",
  "bc-game": "bcgame",
  "chips-gg": "chipsgg",
  "whale-io": "whaleio",
  stakeus: "stake",
  "stake-us": "stake",
  shuffleus: "shuffle",
  "shuffle-us": "shuffle",
};

export function casinoRouteSlug(slug: string): string {
  const key = (slug ?? "").trim();
  return CASINO_ROUTE_ALIASES[key] ?? key;
}

/** Port of reference `casinoPageHref`. */
export function casinoPageHref(slug: string): string {
  return `/${casinoRouteSlug(slug)}`;
}

export function reviewPermalink(casinoSlug: string, reviewId: string): string {
  if (!casinoSlug || !reviewId) return "/reviews";
  return `/${casinoRouteSlug(casinoSlug)}/reviews?review_id=${reviewId}`;
}

export function formatVerifiedBadgeText(review: {
  casinoName?: string | null;
  isVerified?: boolean;
  verifiedVipRank?: string | null;
  verifiedTotalWagered?: string | null;
}): string {
  if (!review.isVerified) return "This review is not verified.";
  const casino = review.casinoName?.trim() || "this casino";
  const rank = review.verifiedVipRank?.trim();
  const wager = review.verifiedTotalWagered?.trim();
  const wagerNum = wager ? parseFloat(wager) : 0;
  let text = rank
    ? `Verified ${rank} player on ${casino}`
    : `Verified player on ${casino}`;
  if (Number.isFinite(wagerNum) && wagerNum > 0) {
    text += ` with $${Math.round(wagerNum).toLocaleString("en-US")} wagered`;
  }
  return `${text} at the time of the review.`;
}

export function stripReviewHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

/** Port of reference `formatRelativeTime`. */
export function formatRelativeTime(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (weeks < 4) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
