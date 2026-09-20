const CASINO_ROUTE_ALIASES: Record<string, string> = {
  "500-casino": "500casino",
  "bc-game": "bcgame",
  "chips-gg": "chipsgg",
  "whale-io": "whaleio",
};

export function casinoRouteSlug(slug: string): string {
  const key = (slug ?? "").trim();
  return CASINO_ROUTE_ALIASES[key] ?? key;
}

export function reviewPermalink(casinoSlug: string, reviewId: string): string {
  if (!casinoSlug || !reviewId) return "/reviews";
  return `/${casinoRouteSlug(casinoSlug)}/reviews?review_id=${reviewId}`;
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
