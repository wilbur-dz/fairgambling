"use client";

import { useCallback, useState } from "react";
import {
  AnalyzerUpload,
  useJsonFileInput,
} from "@/components/stake-stats/analyzer-upload";
import { AnalyzerResults } from "@/components/stake-stats/analyzer-results";
import {
  analyzeBets,
  emptyStats,
  mergeStats,
  readJsonFile,
} from "@/lib/stake-stats/parse-bets";
import type { AnalyzerStats } from "@/lib/stake-stats/types";

/** Bet Analyzer tab — local JSON archive processing. */
export function AnalyzerPanel() {
  const [stats, setStats] = useState<AnalyzerStats | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      setProcessing(true);
      setError(null);
      try {
        let next = stats && !isDemo ? stats : emptyStats();
        let processed = 0;
        for (const file of files) {
          try {
            const raw = await readJsonFile(file);
            const part = analyzeBets(raw);
            next =
              next.totalBets === 0 ? part : mergeStats(next, part);
            processed += 1;
          } catch (err) {
            console.error("Error processing file:", file.name, err);
            setError(
              `Failed to process ${file.name}. Make sure it's a valid Stake bet archive.`,
            );
          }
        }
        if (processed > 0) {
          setStats(next);
          setIsDemo(false);
        }
      } catch (err) {
        console.error("Error processing files:", err);
        setError("Failed to process files. Please try again.");
      } finally {
        setProcessing(false);
      }
    },
    [stats, isDemo],
  );

  const onSeeExample = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/demo/stake-demo-archive.json");
      if (!res.ok) throw new Error(`demo fetch ${res.status}`);
      const json = (await res.json()) as unknown;
      const list = Array.isArray(json)
        ? json
        : ((json as { data?: unknown[] }).data ?? []);
      setStats(analyzeBets(list));
      setIsDemo(true);
    } catch (err) {
      console.error("Failed to load demo:", err);
      setError("Failed to load the example. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, []);

  const onClear = useCallback(() => {
    setStats(null);
    setIsDemo(false);
    setError(null);
  }, []);

  const { open, input } = useJsonFileInput(processFiles);

  if (stats) {
    return (
      <>
        {input}
        <AnalyzerResults
          stats={stats}
          isDemo={isDemo}
          isProcessing={processing}
          onUploadMore={open}
          onClear={onClear}
        />
      </>
    );
  }

  return (
    <>
      {input}
      <AnalyzerUpload
        onOpenFileDialog={open}
        onFiles={processFiles}
        onSeeExample={onSeeExample}
        isProcessing={processing}
        error={error}
      />
    </>
  );
}
