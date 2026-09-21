"use client";

import { useCallback, useRef, useState } from "react";
import {
  Coins,
  ExternalLink,
  LayoutGrid,
  Percent,
  ShieldCheck,
  Sparkles,
  Upload,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Percent,
    label: "Realized RTP %",
    desc: "Actual return vs house edge",
  },
  {
    icon: LayoutGrid,
    label: "Per-game breakdown",
    desc: "Net, RTP & win rate by game",
  },
  {
    icon: Coins,
    label: "Per-currency net",
    desc: "Every coin, valued in USD",
  },
  {
    icon: ShieldCheck,
    label: "100% in your browser",
    desc: "Nothing is uploaded",
  },
] as const;

const STEPS = [
  "Open Stake and go to your profile",
  "Navigate to My Bets → Archive",
  "Select your date range",
  "Download the archive as JSON",
  "Drop the file(s) here — nothing leaves your browser",
];

type AnalyzerUploadProps = {
  onOpenFileDialog: () => void;
  onFiles: (files: File[]) => void;
  onSeeExample: () => void;
  isProcessing: boolean;
  error: string | null;
};

export function AnalyzerUpload({
  onOpenFileDialog,
  onFiles,
  onSeeExample,
  isProcessing,
  error,
}: AnalyzerUploadProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Card variant="panel" blur>
        <div className="grid items-center gap-6 p-2 sm:p-4 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#6b56e0] dark:text-[#b9adff]">
              Your Stake archive · decoded
            </span>
            <h1 className="text-[30px] font-bold leading-[1.1] text-[#2a274e] sm:text-[40px] dark:text-white">
              Bet Analyzer & RTP Calculator
            </h1>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-[rgba(42,39,78,0.6)] dark:text-white/60">
              Drop in your Stake bet archive to see your real RTP, per-game and
              per-currency breakdowns, and your cumulative profit / loss —
              computed entirely in your browser. Nothing is uploaded.
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

      <Card variant="panel" blur>
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const files = Array.from(e.dataTransfer.files).filter(
              (f) =>
                f.type === "application/json" || f.name.endsWith(".json"),
            );
            if (files.length > 0) onFiles(files);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          className={`flex flex-col items-center gap-4 rounded-[18px] border border-dashed px-6 py-12 text-center transition-colors ${
            dragging
              ? "border-[#8874ff]/70 bg-[#8874ff]/[0.06]"
              : "border-[rgba(42,39,78,0.15)] bg-white/[0.3] dark:border-white/12 dark:bg-white/[0.01]"
          }`}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#8874ff]/15 text-[#6b56e0] dark:text-[#b9adff]">
            <Upload className="size-6" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#2a274e] dark:text-white">
              Stake Bet Archive JSON
            </h2>
            <p className="mt-1 text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Drop one or more .json archives here — processed 100% locally
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Button
              theme="auto"
              variant="primary"
              size="md"
              leftIcon={<Upload />}
              onClick={onOpenFileDialog}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing…" : "Upload archive"}
            </Button>
            <Button
              theme="auto"
              variant="ghost"
              size="md"
              leftIcon={<Sparkles />}
              onClick={onSeeExample}
              disabled={isProcessing}
            >
              See example
            </Button>
          </div>
          <a
            href="https://stake.com/my-bets/archive"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-[rgba(42,39,78,0.4)] transition-colors hover:text-[rgba(42,39,78,0.7)] dark:text-white/40 dark:hover:text-white/70"
          >
            Download from stake.com/my-bets/archive
            <ExternalLink className="size-3.5" />
          </a>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[rgba(42,39,78,0.35)] dark:text-white/35">
            <ShieldCheck className="size-3.5" />
            Both old and new Stake export formats are supported
          </p>
        </div>
        {error ? (
          <div className="mt-4 rounded-[14px] border border-[#F87171]/30 bg-[#F87171]/10 p-3.5 text-[14px] text-[#dc2626] dark:text-[#F87171]">
            {error}
          </div>
        ) : null}
      </Card>

      <Card variant="panel">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-medium text-[#2a274e] dark:text-white">
            How to export your bets from Stake
            <ChevronDown className="size-4 text-[rgba(42,39,78,0.4)] transition-transform group-open:rotate-180 dark:text-white/40" />
          </summary>
          <ol className="mt-4 flex flex-col gap-2 text-[14px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[rgba(42,39,78,0.06)] text-[12px] font-medium text-[rgba(42,39,78,0.7)] dark:bg-white/[0.06] dark:text-white/70">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </details>
      </Card>
    </div>
  );
}

export function useJsonFileInput(onFiles: (files: File[]) => void) {
  const ref = useRef<HTMLInputElement | null>(null);
  const open = useCallback(() => ref.current?.click(), []);
  const input = (
    <input
      ref={ref}
      type="file"
      accept=".json,application/json"
      multiple
      className="hidden"
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onFiles(files);
        e.target.value = "";
      }}
    />
  );
  return { open, input };
}
