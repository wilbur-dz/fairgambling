import {
  getBonusRates,
  HOUSE_EDGE,
  type BonusPeriod,
  type GameType,
  type ProfitLoss,
} from "@/lib/bonus-calculator/data";

export type BonusEstimateInput = {
  casinoSlug: string;
  period: BonusPeriod;
  gameType: GameType;
  wager: number;
  profitLoss: ProfitLoss;
  netLoss: number;
};

export type BonusEstimate = {
  period: BonusPeriod;
  rakebackRate: number;
  lossbackRate: number;
  expectedLoss: number;
  rakeback: number;
  lossback: number;
  estimated: number;
};

/** Port of production Bonus Calculator estimate. */
export function estimateBonus(input: BonusEstimateInput): BonusEstimate {
  const casino = getBonusRates(input.casinoSlug);
  const edge = HOUSE_EDGE[input.gameType];
  const expectedLoss = input.wager * edge;
  const rakebackRate =
    input.period === "weekly" ? casino.weeklyRakeback : casino.monthlyRakeback;
  const lossbackRate =
    input.period === "weekly" ? casino.weeklyLossback : casino.monthlyLossback;
  const rakeback = (rakebackRate / 100) * expectedLoss;
  const lossback =
    input.profitLoss === "loss"
      ? (lossbackRate / 100) * input.netLoss
      : 0;

  return {
    period: input.period,
    rakebackRate,
    lossbackRate,
    expectedLoss,
    rakeback,
    lossback,
    estimated: rakeback + lossback,
  };
}

const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const intFmt = new Intl.NumberFormat("en-US");

export function formatUsd(n: number) {
  return usd2.format(Number.isFinite(n) ? n : 0);
}

export function formatUsdCompact(n: number) {
  return usd0.format(Number.isFinite(n) ? n : 0);
}

export function formatRequirement(n: number) {
  if (n >= 1e9) return `$${trimNum(n / 1e9)}B`;
  if (n >= 1e6) return `$${trimNum(n / 1e6)}M`;
  if (n >= 1e3) return `$${trimNum(n / 1e3)}K`;
  return `$${trimNum(n)}`;
}

function trimNum(n: number) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

/** Format integer part with commas while editing decimals. */
export function formatWagerDisplay(raw: string, focused: boolean) {
  if (raw === "" || focused) return raw;
  const [intPart, frac] = raw.split(".");
  const formatted =
    intPart === ""
      ? ""
      : intFmt.format(Number.isFinite(Number(intPart)) ? Number(intPart) : 0);
  return frac !== undefined ? `${formatted}.${frac}` : formatted;
}

export function sanitizeDecimalInput(value: string) {
  let next = value.replace(/[^0-9.]/g, "");
  const dot = next.indexOf(".");
  if (dot !== -1) {
    next = next.slice(0, dot + 1) + next.slice(dot + 1).replace(/\./g, "");
  }
  return next;
}
