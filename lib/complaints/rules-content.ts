/** Static copy aligned with https://www.fairgambling.com/complaints/rules (Sep 2026). */

export const RESOLUTION_RULES_META = {
  title: "Resolution Rules",
  subtitle: "How We Judge Cases",
  lastUpdated: "September 2026",
} as const;

export const RESOLUTION_RULES_INTRO = [
  "FairGambling Resolution is a free, independent mediation service between crypto-casino players and casinos. Anyone with a real dispute can file a case. A resolver reviews it, the casino gets to respond, and we publish the outcome no matter which side it favors.",
  "We charge no fees and sell no placement. A casino cannot pay for a better verdict.",
] as const;

export const RESOLUTION_RULES_STEPS = [
  {
    title: "You file",
    description: "Pick a casino and a category, attach your evidence.",
  },
  {
    title: "We review",
    description:
      "A resolver approves the case or asks you for more. Every rejection comes with a reason.",
  },
  {
    title: "Casino responds",
    description: "Silence closes the case as unresolved.",
  },
  {
    title: "Mediation",
    description: "You and the casino talk in a shared thread.",
  },
  {
    title: "Outcome",
    description: "Resolved, unresolved, or rejected. Always published.",
  },
] as const;

export const RESOLUTION_OUTCOMES = [
  {
    label: "Resolved",
    tone: "green" as const,
    description: "The issue was fixed, paid, or settled.",
  },
  {
    label: "Unresolved",
    tone: "red" as const,
    description:
      "The casino refused to cooperate or missed a deadline. Counts against its reputation.",
  },
  {
    label: "Rejected",
    tone: "muted" as const,
    description:
      "Invalid, unsupported, or the player stopped responding. Not the casino's fault.",
  },
] as const;

export type ResolutionRuleSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const RESOLUTION_CATEGORY_RULES: ResolutionRuleSection[] = [
  {
    title: "Deposit",
    paragraphs: [
      "Deposits sent to the correct address and network should be credited to the player's balance.",
      "If a player sends funds to the wrong address or network, this is generally the player's responsibility.",
      "For AML reasons, casinos may require a deposit to be wagered once before withdrawal.",
      "Deposit bonus terms must be clear upfront. Important restrictions, such as maximum bet limits, should not be hidden in the general T&Cs and later used to confiscate a bonus or winnings.",
    ],
  },
  {
    title: "Withdrawal",
    paragraphs: [
      "Withdrawals should be processed without unnecessary delay.",
    ],
  },
  {
    title: "Bonus",
    paragraphs: [
      "Casinos generally decide which bonuses they offer and who is eligible to receive them.",
      "Because of this, bonus disputes are usually not eligible for a complaint. However, we may review individual cases where the casino's actions appear unfair.",
    ],
  },
  {
    title: "Account Restricted",
    paragraphs: [
      "Casinos may decide to stop accepting a player's business.",
      "However, they should never confiscate a player's funds without a valid reason.",
      "If a casino closes or restricts an account, the player should normally be placed into withdraw-only mode and allowed to withdraw their remaining balance.",
    ],
  },
  {
    title: "Provably Fair",
    paragraphs: [
      'Players are generally responsible for checking whether a game actually has a provably fair system before playing.',
      'However, if a casino advertises a game as "Provably Fair", a real provably fair system must be available. Otherwise, we consider this false advertisement from the casino.',
    ],
    bullets: [
      "Verification tool",
      "Client seed control",
      "Transparency information",
      "RTP disclosure",
    ],
  },
  {
    title: "Affiliate",
    paragraphs: [
      "Casinos are generally free to set their own affiliate terms.",
      "Once terms have been agreed, changes should only apply going forward, not retroactively.",
      "Exceptions may apply in cases involving fraud, multi-accounting or similar abuse.",
    ],
  },
  {
    title: "KYC",
    paragraphs: [
      "Our preferred standard is simple: if a casino requires KYC, it should ideally be requested before the player deposits.",
      "KYC should never be used simply to delay a withdrawal.",
      "If KYC is required before withdrawal, the casino should normally restrict gameplay so the player can't lose their balance.",
      "Unless there are serious concerns such as suspected money laundering or criminal activity, KYC should normally be completed within 48 hours.",
    ],
  },
  {
    title: "Responsible Gambling",
    paragraphs: [
      "If a player requests self-exclusion, the casino should honor it.",
      "If the player requests permanent self-exclusion or has shown clear signs of gambling addiction, the account should not later be reopened.",
    ],
  },
  {
    title: "Sports Betting",
    paragraphs: [
      "Our rule is simple: if you take the bet, you take the action. Once a casino accepts a bet, it should honor that bet.",
      "Exceptions should be rare and require strong evidence, for example a fraudulent late bet or a fixed match.",
      "Casinos are allowed to limit players.",
    ],
  },
];

export const RESOLUTION_RULES_CLOSING = {
  publishHeading: "Why We Publish Verdicts",
  publishBody:
    "A complaint that's settled quietly helps you, but it does nothing for the next person who hits the same problem. Publishing verdicts is how everyone learns which casinos honor their obligations and which don't.",
  contactHeading: "Contact",
  contactBody:
    "Questions about a case or these rules? File a complaint under the Other category and the mediation team answers in the thread.",
} as const;
