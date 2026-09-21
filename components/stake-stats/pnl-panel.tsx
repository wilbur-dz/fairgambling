"use client";

import { useCallback, useRef, useState } from "react";
import {
  Coins,
  ExternalLink,
  FileText,
  Info,
  Percent,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Hint } from "@/components/stake-stats/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatCount,
  formatUsd,
  pnlClass,
} from "@/lib/stake-stats/format";
import { computePnl, parseStakeCsv } from "@/lib/stake-stats/parse-csv";
import type { PnlResult } from "@/lib/stake-stats/types";

const FEATURES = [
  {
    icon: Scale,
    label: "Deposit vs withdrawal",
    desc: "Real money in vs out",
  },
  {
    icon: Coins,
    label: "Per-asset breakdown",
    desc: "Net by coin, in USD",
  },
  {
    icon: Percent,
    label: "All-time net %",
    desc: "Return on what you put in",
  },
  {
    icon: ShieldCheck,
    label: "100% in your browser",
    desc: "Addresses never leave",
  },
] as const;

function CsvDropzone({
  title,
  downloadUrl,
  downloadLabel,
  file,
  onFile,
  disabled,
}: {
  title: string;
  downloadUrl: string;
  downloadLabel: string;
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const pick = (list: FileList | null) => {
    const next = Array.from(list ?? []).find(
      (f) => f.name.endsWith(".csv") || f.type === "text/csv",
    );
    if (next) onFile(next);
  };

  return (
    <Card variant="panel" blur>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={`flex flex-col items-center gap-3 rounded-[18px] border border-dashed px-5 py-8 text-center transition-colors ${
          dragging
            ? "border-[#8874ff]/70 bg-[#8874ff]/[0.06]"
            : "border-[rgba(42,39,78,0.15)] bg-white/[0.3] dark:border-white/12 dark:bg-white/[0.01]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="flex size-11 items-center justify-center rounded-full bg-[#8874ff]/15 text-[#6b56e0] dark:text-[#b9adff]">
          <FileText className="size-5" />
        </span>
        <h3 className="text-[16px] font-semibold text-[#2a274e] dark:text-white">
          {title}
        </h3>
        {file ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(42,39,78,0.04)] px-3 py-1 text-[13px] text-[rgba(42,39,78,0.8)] dark:bg-white/[0.04] dark:text-white/80">
            <FileText className="size-3.5" /> {file.name}
          </span>
        ) : (
          <p className="text-[13px] text-[rgba(42,39,78,0.45)] dark:text-white/45">
            Drag & drop your .csv here
          </p>
        )}
        <Button
          theme="auto"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {file ? "Choose another" : "Choose file"}
        </Button>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-[rgba(42,39,78,0.35)] transition-colors hover:text-[rgba(42,39,78,0.7)] dark:text-white/35 dark:hover:text-white/70"
        >
          {downloadLabel}
          <ExternalLink className="size-3" />
        </a>
      </div>
    </Card>
  );
}

function PnlUpload({
  onCalculate,
  onSeeExample,
  isProcessing,
  error,
}: {
  onCalculate: (deposits: File | null, withdrawals: File | null) => void;
  onSeeExample: () => void;
  isProcessing: boolean;
  error: string | null;
}) {
  const [deposits, setDeposits] = useState<File | null>(null);
  const [withdrawals, setWithdrawals] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <Card variant="panel" blur>
        <div className="grid items-center gap-6 p-2 sm:p-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#6b56e0] dark:text-[#b9adff]">
              Deposits · Withdrawals · USD
            </span>
            <h1 className="text-[30px] font-bold leading-[1.1] text-[#2a274e] sm:text-[40px] dark:text-white">
              Profit & Loss Calculator
            </h1>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-[rgba(42,39,78,0.6)] dark:text-white/60">
              Upload Stake crypto deposit and withdrawal CSVs to see your
              all-time net in USD — processed entirely in your browser.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.label}
                  variant="glass"
                  padded={false}
                  className="p-3.5"
                  contentClassName="flex flex-col gap-2"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#8874ff]/15 text-[#6b56e0] dark:text-[#b9adff]">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[13px] font-semibold leading-tight text-[#2a274e] dark:text-white">
                    {f.label}
                  </span>
                  <span className="text-[11px] leading-tight text-[rgba(42,39,78,0.45)] dark:text-white/45">
                    {f.desc}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CsvDropzone
          title="Crypto Deposits CSV"
          downloadUrl="https://stake.com/transactions/deposits"
          downloadLabel="Download from stake.com/transactions/deposits"
          file={deposits}
          onFile={setDeposits}
          disabled={isProcessing}
        />
        <CsvDropzone
          title="Crypto Withdrawals CSV"
          downloadUrl="https://stake.com/transactions/withdrawals"
          downloadLabel="Download from stake.com/transactions/withdrawals"
          file={withdrawals}
          onFile={setWithdrawals}
          disabled={isProcessing}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          theme="auto"
          variant="primary"
          size="md"
          disabled={isProcessing || (!deposits && !withdrawals)}
          onClick={() => onCalculate(deposits, withdrawals)}
        >
          {isProcessing ? "Calculating…" : "Calculate Profit / Loss"}
        </Button>
        <Button
          theme="auto"
          variant="ghost"
          size="md"
          leftIcon={<Sparkles />}
          disabled={isProcessing}
          onClick={onSeeExample}
        >
          See example
        </Button>
      </div>

      {error ? (
        <div className="rounded-[14px] border border-[#F87171]/30 bg-[#F87171]/10 p-3.5 text-[14px] text-[#dc2626] dark:text-[#F87171]">
          {error}
        </div>
      ) : null}

      <Card variant="panel">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-medium text-[#2a274e] dark:text-white">
            About this profit & loss calculator
            <Info className="size-4 text-[rgba(42,39,78,0.4)] dark:text-white/40" />
          </summary>
          <p className="mt-3 text-[14px] leading-relaxed text-[rgba(42,39,78,0.55)] dark:text-white/55">
            Net P&L = withdrawals − deposits, converted to USD with built-in
            fallback rates for major coins. Stablecoins count 1:1. Processing
            stays in your browser — CSVs are never uploaded.
          </p>
        </details>
      </Card>
    </div>
  );
}

function StatCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[12px] text-[rgba(42,39,78,0.45)] dark:text-white/45">
        {label}
        {hint ? (
          <>
            {" "}
            <Hint text={hint} />
          </>
        ) : null}
      </span>
      <span className="text-[15px] font-semibold tabular-nums text-[#2a274e] dark:text-white">
        {value}
      </span>
    </div>
  );
}

function PnlResults({
  result,
  isDemo,
  onReset,
}: {
  result: PnlResult;
  isDemo: boolean;
  onReset: () => void;
}) {
  const { hasWithdrawals, netUsd, netPct, depositedUsd, withdrawnUsd, txCount } =
    result;
  const range =
    result.dateRange.start && result.dateRange.end
      ? result.dateRange.start === result.dateRange.end
        ? result.dateRange.start
        : `${result.dateRange.start} → ${result.dateRange.end}`
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isDemo ? (
            <span className="rounded-full border border-[#8874ff]/40 bg-[#8874ff]/10 px-2.5 py-1 text-[12px] font-medium text-[#6b56e0] dark:text-[#b9adff]">
              Demo data
            </span>
          ) : null}
          <p className="text-[13px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
            {range ? <span>{range} · </span> : null}
            {formatCount(txCount)} transactions
          </p>
        </div>
        <Button
          theme="auto"
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw />}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>

      <Card variant="panel" blur>
        <div className="py-2 text-center">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[rgba(42,39,78,0.4)] dark:text-white/40">
            {hasWithdrawals ? "Net Profit / Loss (USD)" : "Total Deposited (USD)"}{" "}
            <Hint
              text={
                hasWithdrawals
                  ? "Money withdrawn minus money deposited (USD) — your real, all-time profit or loss."
                  : "Total you've deposited so far. Add a withdrawals CSV to see your net profit / loss."
              }
            />
          </div>
          <div
            className={`mt-1 text-[40px] font-bold leading-none tabular-nums sm:text-[48px] ${
              hasWithdrawals
                ? pnlClass(netUsd)
                : "text-[#2a274e] dark:text-white"
            }`}
          >
            {hasWithdrawals ? formatUsd(netUsd) : formatUsd(depositedUsd)}
          </div>
          <div
            className={`mt-1.5 text-[13px] font-medium tabular-nums ${
              hasWithdrawals
                ? pnlClass(netUsd)
                : "text-[rgba(42,39,78,0.4)] dark:text-white/40"
            }`}
          >
            {hasWithdrawals
              ? `${netPct >= 0 ? "+" : ""}${netPct.toFixed(1)}%`
              : "Add withdrawals for net P&L"}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-y-4 border-t border-[rgba(42,39,78,0.05)] pt-4 dark:border-white/5">
          <StatCell
            label="Deposited"
            value={formatUsd(depositedUsd)}
            hint="Total of every deposit, converted to USD."
          />
          <StatCell
            label="Withdrawn"
            value={formatUsd(withdrawnUsd)}
            hint="Total of every withdrawal, converted to USD."
          />
          <StatCell label="Transactions" value={formatCount(txCount)} />
        </div>
      </Card>

      {hasWithdrawals ? (
        netUsd >= 0 ? (
          <div className="flex items-start gap-2.5 rounded-[16px] border border-[#4ADE80]/25 bg-[#4ADE80]/[0.06] p-3.5 text-[13px] text-[#1f9d57] dark:text-[#4ADE80]">
            <TrendingUp className="mt-0.5 size-4 shrink-0" />
            <span>
              You&apos;re up {formatUsd(netUsd)} — consider locking in your
              winnings before you give them back.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-[16px] border border-[#F87171]/25 bg-[#F87171]/[0.06] p-3.5 text-[13px] text-[#dc2626] dark:text-[#F87171]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              You&apos;re down {formatUsd(Math.abs(netUsd))} across deposits vs
              withdrawals.
            </span>
          </div>
        )
      ) : (
        <div className="flex items-start gap-2.5 rounded-[16px] border border-[#FFCF2F]/25 bg-[#FFCF2F]/[0.06] p-3.5 text-[13px] text-[#b47316] dark:text-[#FFCF2F]">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Withdrawals not uploaded — this reflects deposits only. Add your
            withdrawals CSV for an accurate net P&L.
          </span>
        </div>
      )}

      <Card variant="panel" blur>
        <h3 className="mb-4 text-[16px] font-semibold text-[#2a274e] dark:text-white">
          Asset Breakdown
        </h3>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[680px] border-separate border-spacing-0 text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/40">
                <th className="pb-3 font-normal">Asset</th>
                <th className="pb-3 text-right font-normal">Deposits</th>
                <th className="pb-3 text-right font-normal">Withdrawals</th>
                <th className="pb-3 text-right font-normal">Deposits USD</th>
                <th className="pb-3 text-right font-normal">Withdrawals USD</th>
                <th className="pb-3 text-right font-normal">Net USD</th>
              </tr>
            </thead>
            <tbody>
              {result.assets.map((row) => (
                <tr
                  key={row.currency}
                  className="border-t border-[rgba(42,39,78,0.05)] transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:border-white/5 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-3 font-medium text-[#2a274e] dark:text-white">
                    {row.currency}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {row.depositCoin.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {row.withdrawalCoin.toLocaleString("en-US", {
                      maximumFractionDigits: 8,
                    })}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatUsd(row.depositUsd)}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70">
                    {formatUsd(row.withdrawalUsd)}
                  </td>
                  <td
                    className={`py-3 text-right font-medium tabular-nums ${pnlClass(row.netUsd)}`}
                  >
                    {formatUsd(row.netUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/** P&L Calculator tab — local CSV processing. */
export function PnlPanel() {
  const [result, setResult] = useState<PnlResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCalculate = useCallback(
    async (depositsFile: File | null, withdrawalsFile: File | null) => {
      if (!depositsFile && !withdrawalsFile) return;
      setProcessing(true);
      setError(null);
      try {
        const [depText, witText] = await Promise.all([
          depositsFile ? depositsFile.text() : Promise.resolve(""),
          withdrawalsFile ? withdrawalsFile.text() : Promise.resolve(""),
        ]);
        const deposits = depText ? parseStakeCsv(depText) : [];
        const withdrawals = witText ? parseStakeCsv(witText) : [];
        if (deposits.length === 0 && withdrawals.length === 0) {
          setError(
            "Couldn't read any transactions — make sure these are Stake deposit / withdrawal CSVs.",
          );
          return;
        }
        setResult(computePnl(deposits, withdrawals));
        setIsDemo(false);
      } catch (err) {
        console.error("P&L calc failed:", err);
        setError("Failed to process the CSVs. Please try again.");
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  const onSeeExample = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      const [dRes, wRes] = await Promise.all([
        fetch("/demo/stake-demo-deposits.csv"),
        fetch("/demo/stake-demo-withdrawals.csv"),
      ]);
      const [dText, wText] = await Promise.all([dRes.text(), wRes.text()]);
      setResult(computePnl(parseStakeCsv(dText), parseStakeCsv(wText)));
      setIsDemo(true);
    } catch (err) {
      console.error("P&L demo failed:", err);
      setError("Failed to load the example. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, []);

  if (result) {
    return (
      <PnlResults
        result={result}
        isDemo={isDemo}
        onReset={() => {
          setResult(null);
          setIsDemo(false);
          setError(null);
        }}
      />
    );
  }

  return (
    <PnlUpload
      onCalculate={onCalculate}
      onSeeExample={onSeeExample}
      isProcessing={processing}
      error={error}
    />
  );
}
