import { dayKey } from "@/lib/stake-stats/format";
import { amountToUsd } from "@/lib/stake-stats/rates";
import type { CsvTx, PnlAsset, PnlResult } from "@/lib/stake-stats/types";

/** Parse Stake deposit/withdrawal CSV (`date,amount,currency`). */
export function parseStakeCsv(text: string): CsvTx[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r\n|\r|\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dateIdx = headers.indexOf("date");
  const amountIdx = headers.indexOf("amount");
  const currencyIdx = headers.indexOf("currency");
  if (dateIdx === -1 || amountIdx === -1 || currencyIdx === -1) return [];

  const out: CsvTx[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const date = new Date(cols[dateIdx]).getTime();
    const amount = parseFloat(cols[amountIdx]);
    const currency = (cols[currencyIdx] || "").trim().toLowerCase();
    if (Number.isFinite(date) && Number.isFinite(amount) && currency) {
      out.push({ date, amount, currency });
    }
  }
  return out;
}

/** Compute deposit vs withdrawal P&L in USD. */
export function computePnl(
  deposits: CsvTx[],
  withdrawals: CsvTx[],
): PnlResult {
  const assets = new Map<string, PnlAsset>();
  const ensure = (currency: string) => {
    const key = currency.toUpperCase();
    let row = assets.get(key);
    if (!row) {
      row = {
        currency: key,
        depositCoin: 0,
        withdrawalCoin: 0,
        depositUsd: 0,
        withdrawalUsd: 0,
        netUsd: 0,
      };
      assets.set(key, row);
    }
    return row;
  };

  let depositedUsd = 0;
  let withdrawnUsd = 0;
  let minDate = Infinity;
  let maxDate = -Infinity;

  for (const tx of deposits) {
    const usd = amountToUsd(tx.currency, tx.amount);
    const row = ensure(tx.currency);
    row.depositCoin += tx.amount;
    row.depositUsd += usd;
    depositedUsd += usd;
    if (tx.date < minDate) minDate = tx.date;
    if (tx.date > maxDate) maxDate = tx.date;
  }

  for (const tx of withdrawals) {
    const usd = amountToUsd(tx.currency, tx.amount);
    const row = ensure(tx.currency);
    row.withdrawalCoin += tx.amount;
    row.withdrawalUsd += usd;
    withdrawnUsd += usd;
    if (tx.date < minDate) minDate = tx.date;
    if (tx.date > maxDate) maxDate = tx.date;
  }

  for (const row of assets.values()) {
    row.netUsd = row.withdrawalUsd - row.depositUsd;
  }

  const assetList = Array.from(assets.values()).sort(
    (a, b) => Math.abs(b.netUsd) - Math.abs(a.netUsd),
  );
  const currencies = assetList.map((a) => a.currency);

  const events = [
    ...deposits.map((tx) => ({
      date: tx.date,
      cur: tx.currency.toUpperCase(),
      delta: -amountToUsd(tx.currency, tx.amount),
    })),
    ...withdrawals.map((tx) => ({
      date: tx.date,
      cur: tx.currency.toUpperCase(),
      delta: amountToUsd(tx.currency, tx.amount),
    })),
  ].sort((a, b) => a.date - b.date);

  const running: Record<string, number> = {};
  for (const c of currencies) running[c] = 0;
  const timeline = events.map((e) => {
    running[e.cur] = (running[e.cur] ?? 0) + e.delta;
    return { date: dayKey(e.date), ...running };
  });

  return {
    depositedUsd,
    withdrawnUsd,
    netUsd: withdrawnUsd - depositedUsd,
    netPct: depositedUsd > 0 ? ((withdrawnUsd - depositedUsd) / depositedUsd) * 100 : 0,
    txCount: deposits.length + withdrawals.length,
    hasDeposits: deposits.length > 0,
    hasWithdrawals: withdrawals.length > 0,
    assets: assetList,
    currencies,
    timeline,
    dateRange: {
      start: minDate !== Infinity ? dayKey(minDate) : "",
      end: maxDate !== -Infinity ? dayKey(maxDate) : "",
    },
  };
}
