export type CasinoTimelineEntry = {
  casino: string;
  start: string;
  end?: string | null;
};

export type DegenLevel = "High" | "Medium" | "Low" | string;
export type RawFake = "Raw" | "Fake" | string;

/** Static roster entry from `all-streamers.json`. */
export type StreamerRecord = {
  username: string;
  platform: string;
  live?: boolean;
  currentCasino: string;
  pastCasinos: string[];
  estMonthlyPayment: string;
  degen: DegenLevel;
  rawFake: RawFake;
  leaderboard: boolean;
  leaderboardTop5Wager: string | null;
  monthlyLeaderboardUsd: number | null;
  followers: number;
  avgViewers30d: number;
  peakViewers30d: number;
  peakAllTime: number;
  hoursWatched30d: number;
  activeDays30d: number;
  streamHours30d?: number;
  topGames: string;
  lastStreamed: string;
  profileUrl: string;
  xProfile: string | null;
  hasStats: boolean;
  language: string | null;
  mainCasinoPartner: string | null;
  youtube: string | null;
  discord: string | null;
  instagram: string | null;
  tiktok: string | null;
  telegram: string | null;
  website: string | null;
  marketValueUsd: number | null;
  location: string | null;
  favoriteGame: string | null;
  biggestWinClip: string | null;
  biggestLossClip: string | null;
  affiliateCode: string | null;
  affiliateCodeBenefits: string | null;
  affiliateBenefitsRating: string | null;
  casesPacksPartner: string | null;
  otherContent: string | null;
  faceCam: boolean | null;
  casinoTimeline?: CasinoTimelineEntry[];
  bio?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string | null;
  liveViewers?: number | null;
  liveUptimeMin?: number | null;
  liveThumb?: string | null;
  liveTitle?: string | null;
  subAffiliate?: boolean;
  subAffiliateOf?: string | null;
  mvPinned?: boolean;
  firstStreamed?: string;
};

/** Row from `GET /api/streamer-profiles` → `data.streamers`. */
export type StreamerDbProfile = {
  id?: number;
  username: string;
  language?: string | null;
  currentCasino?: string | null;
  pastCasinos?: string | string[] | null;
  casinoTimeline?: CasinoTimelineEntry[] | null;
  estMonthlyPayment?: number | string | null;
  degenLevel?: string | null;
  rawFake?: string | null;
  mainCasinoPartner?: string | null;
  monthlyLeaderboard?: number | string | null;
  monthlyTop5Wager?: string | null;
  otherCasinos?: string | null;
  casesPacksPartner?: string | null;
  otherContent?: string | null;
  subAffiliate?: boolean | null;
  subAffiliateOf?: string | null;
  affiliateCode?: string | null;
  affiliateCodeBenefits?: string | null;
  affiliateBenefitsRating?: string | null;
  faceCam?: boolean | null;
  profileUrl?: string | null;
  xProfile?: string | null;
  youtube?: string | null;
  discord?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  telegram?: string | null;
  website?: string | null;
  topGames?: string | null;
  followers?: number | null;
  avgViewers30d?: number | null;
  peakViewers30d?: number | null;
  peakAllTime?: number | null;
  hoursWatched30d?: number | null;
  activeDays30d?: number | null;
  lastStreamed?: string | null;
  imageUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  favoriteGame?: string | null;
  biggestWinClip?: string | null;
  biggestLossClip?: string | null;
  marketValueUsd?: number | null;
  mvPinned?: boolean | null;
};

export type StreamerLiveStat = {
  slug: string;
  platform?: string;
  main_casino?: string;
  all_casinos?: string;
  avg_viewers_30d?: number;
  peak_viewers_30d?: number;
  hours_watched_30d?: number;
  active_days_30d?: number;
  last_streamed?: string;
  followers?: number;
  pfp_url?: string | null;
  peak_all_time?: number;
  first_streamed?: string;
  followers_gain_30d?: number;
  airtime_h_30d?: number;
};

export type StreamerLiveNow = {
  viewers?: number;
  uptime_min?: number;
  thumb_url?: string | null;
  title?: string | null;
};

export type StreamerNewsArticle = {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  coverImageUrl?: string | null;
  breaking?: boolean;
  streamers?: { username: string }[];
};

export type MarketValueBreakdown = {
  components: {
    label: string;
    input: string;
    weight: number;
    contribution: number;
  }[];
  base: number;
  penalties: { label: string; pct: number }[];
  total: number;
};
