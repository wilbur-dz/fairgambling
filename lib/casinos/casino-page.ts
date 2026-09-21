/**
 * Shared types / constants for the casino detail page (`/${slug}`).
 * Mirrors reference SectionNav sections + casino detail payload shape.
 */

import type { CasinoAnalytics } from "@/lib/casinos/casino-analytics";
import type { CasinoHotWallet } from "@/lib/casinos/casino-hot-wallet";
import type { CasinoListItem, CasinoRatingDetail } from "@/lib/casinos/data";
import type { RatingDistribution, ReviewItem } from "@/lib/reviews/data";

export type CasinoPageSection = { id: string; label: string };

/** Default jump targets (reference `SectionNav` module `879002`). */
export const CASINO_PAGE_SECTIONS: CasinoPageSection[] = [
  { id: "rating", label: "Rating" },
  { id: "analytics", label: "Analytics" },
  { id: "fairness-rtp", label: "Fairness & RTP" },
  { id: "provably-fair-games", label: "Provably Fair Games" },
  { id: "financial-transparency", label: "Financial Transparency" },
  { id: "hot-wallet-balances", label: "Hot Wallet Balances" },
  { id: "bonus-types", label: "Bonus types" },
  { id: "bonus-testing", label: "Bonus Testing" },
  { id: "customer-support", label: "Customer Support" },
  { id: "compliance", label: "Compliance" },
  { id: "responsible-gambling", label: "Responsible Gambling" },
  { id: "security", label: "Security" },
  { id: "house-games", label: "House Games" },
  { id: "slots", label: "Slots" },
  { id: "third-party-ratings", label: "Third Party Ratings" },
  { id: "review", label: "Review" },
];

export type CasinoPageStats = {
  reviewCount: number;
  averageRating: number | null;
  complaintCount: number;
  openComplaintCount: number;
  verifiedReviewCount?: number;
  verifiedAverageRating?: number | null;
  ratingDistribution?: RatingDistribution;
};

export type CasinoDetail = CasinoListItem & {
  websiteUrl?: string | null;
  brandStatus?: string | null;
  description?: string | null;
  facts?: Record<string, unknown> | null;
};

export type CasinoPageData = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
  stats: CasinoPageStats;
  promotionsCount: number;
  reviewHtml: string | null;
  analytics: CasinoAnalytics;
  hotWallet: CasinoHotWallet | null;
  initialCasinoReviews: ReviewItem[];
  initialCasinoReviewsTotalPages: number;
  pinnedReview: ReviewItem | null;
};

/** Port of reference `getCasinoWebsiteUrl`. */
const WEBSITE_OVERRIDES: Record<string, string> = {
  sportsbet: "https://sportsbet.io",
  whaleio: "https://whale.io",
  "500casino": "https://500.casino",
  stakeus: "https://stake.us",
  solcasino: "https://solcasino.io",
  betfury: "https://betfury.io",
  sportsbetio: "https://sportsbet.io",
  chipsgg: "https://chips.gg",
};

export function getCasinoWebsiteUrl(
  slug: string,
  websiteUrl?: string | null,
): string {
  if (websiteUrl) return websiteUrl.replace(/\/$/, "");
  const key = slug.toLowerCase().replace(/[.\s]+/g, "");
  return WEBSITE_OVERRIDES[key] ?? `https://${key}.com`;
}

/** Port of reference `CASINO_SOCIALS` (subset used on profile). */
export const CASINO_SOCIALS: Record<
  string,
  { x?: string; telegram?: string; discord?: string }
> = {
  stake: { x: "https://x.com/Stake", telegram: "https://t.me/StakeCasino" },
  shuffle: {
    x: "https://x.com/shufflecom",
    telegram: "https://t.me/shufflecom",
  },
  roobet: { x: "https://x.com/Roobet", telegram: "https://t.me/roobetcom" },
  bcgame: { x: "https://x.com/bcgame", telegram: "https://t.me/bcgamewin" },
  rainbet: {
    x: "https://x.com/rainbetcom",
    telegram: "https://t.me/rainbetcom",
  },
  "500casino": {
    x: "https://x.com/500casino",
    telegram: "https://t.me/fivehundredcasino",
  },
  winna: { x: "https://x.com/Winna", telegram: "https://t.me/winna" },
  thrill: {
    x: "https://x.com/Thrill_com",
    telegram: "https://t.me/Thrillcom",
  },
  duel: { x: "https://x.com/duel", telegram: "https://t.me/duelmogs" },
  goated: { x: "https://x.com/goated", telegram: "https://t.me/goated" },
};

export function isValidCasinoSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,63}$/i.test(slug.trim());
}

export function str(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function yn(value: unknown): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return str(value);
}

export function formatUsdCompact(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString("en-US")}`;
}
