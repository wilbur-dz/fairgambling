export type NavIconName =
  | "home-icon"
  | "podium-icon"
  | "analytics-icon"
  | "reviews-icon"
  | "complaints-icon"
  | "streamers-icon"
  | "activity-icon"
  | "user-icon"
  | "medal-icon"
  | "code-bonuses-icon"
  | "diamond-icon"
  | "bonus-tools-icon"
  | "calculator-icon"
  | "calendar-icon"
  | "football-icon"
  | "globe-icon"
  | "check-icon"
  | "casino-icon"
  | "pie-chart-icon"
  | "casino-building-icon"
  | "sidebar-toggle-icon"
  | "discord-icon"
  | "x-icon"
  | "telegram-icon"
  | "reddit-icon";

export type NavLinkItem = {
  href: string;
  icon: NavIconName;
  label: string;
  external?: boolean;
  badge?: string;
  children?: NavLinkItem[];
};

export type NavSubSection = {
  label: string;
  icon: NavIconName;
  items: NavLinkItem[];
};

export type NavSection = {
  label: string;
  defaultOpen?: boolean;
  items: NavLinkItem[];
  sub?: NavSubSection;
};

export type SocialLink = {
  href: string;
  icon: NavIconName;
  label: string;
};

export type MobileNavItem = {
  label: string;
  icon: NavIconName;
  href?: string;
  popup?: NavLinkItem[];
};

/** Feature flags — flip as product surface expands. */
export const FEATURES = {
  sportsHub: true,
  complaints: true,
  blog: true,
} as const;

export function isComplaintsEnabled() {
  return FEATURES.complaints;
}

export function isBlogEnabled() {
  return FEATURES.blog;
}

export const RESEARCH_PATH = "/news";

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    defaultOpen: true,
    items: [
      { href: "/casinos", icon: "podium-icon", label: "Ranking" },
      { href: "/analytics", icon: "analytics-icon", label: "Analytics" },
      { href: "/reviews", icon: "reviews-icon", label: "Reviews" },
      { href: "/complaints", icon: "complaints-icon", label: "Complaints" },
      { href: "/streamers", icon: "streamers-icon", label: "Streamers" },
      {
        href: "/bet-feed",
        icon: "activity-icon",
        label: "Live Bet Feed",
        children: [
          { href: "/players", icon: "user-icon", label: "Players" },
        ],
      },
    ],
  },
  {
    label: "Bonuses",
    defaultOpen: true,
    items: [
      {
        href: "/leaderboard",
        icon: "medal-icon",
        label: "$10,000 Leaderboard",
      },
      { href: "/livecodes", icon: "code-bonuses-icon", label: "Live Codes" },
      {
        href: "/highroller-club",
        icon: "diamond-icon",
        label: "High Roller Club",
      },
    ],
    sub: {
      label: "Bonus Tools",
      icon: "bonus-tools-icon",
      items: [
        {
          href: "/bonus-calculator",
          icon: "calculator-icon",
          label: "Bonus Calculator",
        },
        {
          href: "/calendar",
          icon: "calendar-icon",
          label: "Bonus Calendar",
        },
      ],
    },
  },
  {
    label: "Resources",
    defaultOpen: true,
    items: [
      ...(FEATURES.sportsHub
        ? ([
            {
              href: "/sports-hub",
              icon: "football-icon",
              label: "Sports",
            },
          ] as NavLinkItem[])
        : []),
      { href: "/news", icon: "globe-icon", label: "News" },
      {
        href: "/provably-fair",
        icon: "check-icon",
        label: "Provably Fair",
      },
    ],
    sub: {
      label: "Gambling Tools",
      icon: "casino-icon",
      items: [
        {
          href: "/stake-stats",
          icon: "pie-chart-icon",
          label: "My Stake Stats",
        },
        {
          href: "/blackjack-trainer",
          icon: "casino-icon",
          label: "Blackjack Trainer",
        },
      ],
    },
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://discord.gg/fairgambling",
    icon: "discord-icon",
    label: "Discord",
  },
  { href: "https://x.com/FairGambling", icon: "x-icon", label: "X" },
  {
    href: "https://t.me/fairgambling",
    icon: "telegram-icon",
    label: "Telegram",
  },
  {
    href: "https://reddit.com/r/fairgambling",
    icon: "reddit-icon",
    label: "Reddit",
  },
];

export type FooterLinkItem = {
  label: string;
  href: string;
};

/** Footer column data (reference module `544839`). */
export const FOOTER_CASINOS: FooterLinkItem[] = [
  { label: "Ranking", href: "/casinos" },
  { label: "Analytics", href: "/analytics" },
  { label: "Reviews", href: "/reviews" },
  { label: "Live Bet Feed", href: "/bet-feed" },
];

export const FOOTER_CASINO_BRANDS: FooterLinkItem[] = [
  { label: "Stake", href: "/stake" },
  { label: "Roobet", href: "/roobet" },
  { label: "Shuffle", href: "/shuffle" },
  { label: "Rainbet", href: "/rainbet" },
  { label: "Gamdom", href: "/gamdom" },
  { label: "Rollbit", href: "/rollbit" },
  { label: "BetFury", href: "/betfury" },
  { label: "BC.Game", href: "/bcgame" },
  { label: "Duelbits", href: "/duelbits" },
  { label: "Goated", href: "/goated" },
  { label: "Razed", href: "/razed" },
  { label: "500 Casino", href: "/500casino" },
  { label: "Thrill", href: "/thrill" },
  { label: "Winna", href: "/winna" },
  { label: "Yeet", href: "/yeet" },
  { label: "Duel", href: "/duel" },
  { label: "SolCasino", href: "/solcasino" },
  { label: "Whale.io", href: "/whaleio" },
  { label: "Metawin", href: "/metawin" },
  { label: "Chips.gg", href: "/chipsgg" },
  { label: "Gamba", href: "/gamba" },
  { label: "Moon", href: "/moon" },
  { label: "1win", href: "/1win" },
  { label: "Acebet", href: "/acebet" },
  { label: "Betstrike", href: "/betstrike" },
  { label: "Bluff", href: "/bluff" },
  { label: "Cloudbet", href: "/cloudbet" },
  { label: "CoinCasino", href: "/coincasino" },
  { label: "Cybet", href: "/cybet" },
  { label: "Degen", href: "/degen" },
  { label: "Degencity", href: "/degencity" },
  { label: "Dicey", href: "/dicey" },
  { label: "Dustbit", href: "/dustbit" },
  { label: "Flush", href: "/flush" },
  { label: "Housebets", href: "/housebets" },
  { label: "JackpotBet", href: "/jackpotbet" },
  { label: "Qzino", href: "/qzino" },
  { label: "Shock", href: "/shock" },
  { label: "Spartans", href: "/spartans" },
  { label: "Sportsbet", href: "/sportsbet" },
  { label: "Toshibet", href: "/toshibet" },
  { label: "Wager.com", href: "/wagercom" },
];

export const FOOTER_BONUSES: FooterLinkItem[] = [
  { label: "$10,000 Leaderboard", href: "/leaderboard" },
  { label: "Live Codes", href: "/livecodes" },
  { label: "Bonus Calculator", href: "/bonus-calculator" },
  { label: "Bonus Calendar", href: "/calendar" },
];

export const FOOTER_CASINO_CODES: FooterLinkItem[] = [
  { label: "Stake Codes", href: "/stake/codes" },
  { label: "Shuffle Codes", href: "/shuffle/codes" },
  { label: "Roobet Codes", href: "/roobet/codes" },
  { label: "Thrill Codes", href: "/thrill/codes" },
  { label: "Razed Codes", href: "/razed/codes" },
  { label: "Gamba Codes", href: "/gamba/codes" },
  { label: "Duelbits Codes", href: "/duelbits/codes" },
  { label: "BC.Game Codes", href: "/bcgame/codes" },
  { label: "Degen Codes", href: "/degen/codes" },
  { label: "Dicey Codes", href: "/dicey/codes" },
  { label: "500 Casino Codes", href: "/500casino/codes" },
  { label: "Winna Codes", href: "/winna/codes" },
  { label: "Stake.us Codes", href: "/stakeus/codes" },
  { label: "Shuffle.us Codes", href: "/shuffleus/codes" },
  { label: "Moon Codes", href: "/moon/codes" },
  { label: "Duel Codes", href: "/duel/codes" },
];

export const FOOTER_TOOLS: FooterLinkItem[] = [
  { label: "Provably Fair", href: "/provably-fair" },
  { label: "My Stake Stats", href: "/stake-stats" },
  { label: "Blackjack Trainer", href: "/blackjack-trainer" },
];

/** Mirrors `SECTION_LINKS` order for the Newsroom column. */
export const FOOTER_NEWSROOM: FooterLinkItem[] = [
  { label: "News", href: "/news" },
  { label: "Investigations", href: "/investigations" },
  { label: "Spotlight", href: "/spotlight" },
  { label: "Guides", href: "/guides" },
  { label: "Pulse", href: "/pulse" },
];

export const FOOTER_OTHER: FooterLinkItem[] = [
  { label: "Transparency Note", href: "/transparency" },
  { label: "Resolution", href: "/complaints" },
  { label: "Resolution Rules", href: "/complaints/rules" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Support", href: "#support" },
];

export const FOOTER_COMPLAINT_HREFS = new Set([
  "/complaints",
  "/complaints/rules",
]);

export const RESPONSIBLE_GAMBLING_LINKS = [
  { label: "BeGambleAware.org", href: "https://www.begambleaware.org" },
  { label: "GamblingTherapy.org", href: "https://www.gamblingtherapy.org" },
  { label: "GamCare.org.uk", href: "https://www.gamcare.org.uk" },
] as const;

export function filterFooterOtherLinks(
  items: FooterLinkItem[] = FOOTER_OTHER,
): FooterLinkItem[] {
  const complaints = isComplaintsEnabled();
  const blog = isBlogEnabled();
  return items.filter((item) => {
    if (!complaints && FOOTER_COMPLAINT_HREFS.has(item.href)) return false;
    if (!blog && item.href === "/blog") return false;
    return true;
  });
}

export const MOBILE_NAV: MobileNavItem[] = [
  { label: "Home", icon: "home-icon", href: "/" },
  {
    label: "Main",
    icon: "casino-building-icon",
    popup: [
      { href: "/casinos", icon: "podium-icon", label: "Ranking" },
      { href: "/analytics", icon: "analytics-icon", label: "Analytics" },
      { href: "/reviews", icon: "reviews-icon", label: "Reviews" },
      { href: "/complaints", icon: "complaints-icon", label: "Complaints" },
      { href: "/streamers", icon: "streamers-icon", label: "Streamer" },
      { href: "/bet-feed", icon: "activity-icon", label: "Live Bet Feed" },
      { href: "/players", icon: "user-icon", label: "Players" },
    ],
  },
  {
    label: "Bonuses",
    icon: "code-bonuses-icon",
    popup: [
      {
        href: "/leaderboard",
        icon: "medal-icon",
        label: "$10,000 Leaderboard",
      },
      { href: "/livecodes", icon: "code-bonuses-icon", label: "Live Codes" },
      {
        href: "/highroller-club",
        icon: "diamond-icon",
        label: "High Roller Club",
      },
      {
        href: "/bonus-calculator",
        icon: "calculator-icon",
        label: "Bonus Calculator",
      },
      { href: "/calendar", icon: "calendar-icon", label: "Bonus Calendar" },
    ],
  },
  {
    label: "Resources",
    icon: "globe-icon",
    popup: [
      ...(FEATURES.sportsHub
        ? ([
            {
              href: "/sports-hub",
              icon: "football-icon",
              label: "Sports",
            },
          ] as NavLinkItem[])
        : []),
      { href: "/news", icon: "globe-icon", label: "News" },
      {
        href: "/provably-fair",
        icon: "check-icon",
        label: "Provably Fair",
      },
      {
        href: "/stake-stats",
        icon: "pie-chart-icon",
        label: "My Stake Stats",
      },
      {
        href: "/blackjack-trainer",
        icon: "casino-icon",
        label: "Blackjack Trainer",
      },
    ],
  },
  { label: "Profile", icon: "user-icon", href: "/profile" },
];

/** Flat list of internal app routes derived from nav (for scaffolding pages). */
export const APP_ROUTES = collectInternalRoutes([
  ...NAV_SECTIONS.flatMap((section) => [
    ...section.items,
    ...(section.sub?.items ?? []),
  ]),
  { href: "/affiliate", icon: "medal-icon", label: "Affiliate" },
  { href: "/profile", icon: "user-icon", label: "Profile" },
]);

function collectInternalRoutes(items: NavLinkItem[]): {
  href: string;
  label: string;
}[] {
  const seen = new Set<string>();
  const routes: { href: string; label: string }[] = [];

  const walk = (list: NavLinkItem[]) => {
    for (const item of list) {
      if (!item.external && item.href.startsWith("/") && !seen.has(item.href)) {
        seen.add(item.href);
        routes.push({ href: item.href, label: item.label });
      }
      if (item.children) walk(item.children);
    }
  };

  walk(items);
  return routes;
}

export function isPathActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname === "/casinos" || pathname.startsWith("/casinos/")) {
    return "Casinos";
  }

  const ranked = [...APP_ROUTES].sort(
    (a, b) => b.href.length - a.href.length,
  );
  const match = ranked.find((route) => isPathActive(route.href, pathname));
  return match?.label ?? "FairGambling";
}

export function sectionHasActivePath(
  section: { items: NavLinkItem[] },
  pathname: string,
): boolean {
  return section.items.some(
    (item) =>
      isPathActive(item.href, pathname) ||
      (item.children?.some((child) => isPathActive(child.href, pathname)) ??
        false),
  );
}
