import data from "@/lib/casinos/bonus-testing-data.json";
import { casinoRouteSlug } from "@/lib/reviews/format";

export type BonusTestingLine = {
  label: string;
  pct: string;
  amount: string;
  note?: string;
};

export type BonusTestingSession = {
  balance: string;
  bonuses: BonusTestingLine[];
  totals: BonusTestingLine[];
};

export type BonusTestingFull = {
  type: "full";
  deposit: string;
  wager: string;
  profit: BonusTestingSession;
  loss: BonusTestingSession;
  summary?: string;
  note?: string;
};

export type BonusTestingSingle = {
  type: "single";
  deposit: string;
  wager: string;
  scenarioType: "profit" | "loss";
  scenario: BonusTestingSession;
  note?: string;
};

export type BonusTestingPartial = {
  type: "partial";
  deposit: string;
  wager: string;
  totalRakeback?: { pct: string; amount: string };
  profit?: BonusTestingSession;
  loss?: BonusTestingSession;
  note?: string;
};

export type BonusTestingNone = {
  type: "none";
  note?: string;
  hideComingSoon?: boolean;
};

export type BonusTestingRecord =
  | BonusTestingFull
  | BonusTestingSingle
  | BonusTestingPartial
  | BonusTestingNone;

const bySlug = data as Record<string, BonusTestingRecord>;

/** Port of reference bonus-testing map lookup (`a[e.slug] ?? { type: 'none' }`). */
export function getBonusTestingRecord(slug: string): BonusTestingRecord {
  const key = casinoRouteSlug(slug.trim()).toLowerCase();
  return bySlug[key] ?? { type: "none" };
}

export type BonusTestingWithIntro = Exclude<
  BonusTestingRecord,
  BonusTestingNone
>;

export function hasBonusTestingIntro(
  record: BonusTestingRecord,
): record is BonusTestingWithIntro {
  return (
    record.type === "full" ||
    record.type === "single" ||
    record.type === "partial"
  );
}
