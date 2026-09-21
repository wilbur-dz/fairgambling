"use client";

import { useMemo, useState } from "react";
import {
  FieldLabel,
  NumberStepper,
} from "@/components/bonus-calculator/field";
import { CasinoGamePickers } from "@/components/provably-fair/casino-game-pickers";
import { SeedFields } from "@/components/provably-fair/seed-fields";
import { EmptyState } from "@/components/provably-fair/results/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import { analyzeGame } from "@/lib/provably-fair/analyze";
import type { StakeGameId } from "@/lib/provably-fair/constants";
import type {
  AnalyzerParams,
  AnalyzerSummary,
  GameParams,
  SeedInputs,
} from "@/lib/provably-fair/types";

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[rgba(42,39,78,0.1)] bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-[12px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
        {label}
      </p>
      <p
        className={`mt-1 text-[20px] font-semibold ${
          accent ? "text-[#8874ff]" : "text-[#2a274e] dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function AnalyzerPanel() {
  const [game, setGame] = useState<StakeGameId>("dice");
  const [seeds, setSeeds] = useState<SeedInputs>({
    clientSeed: "",
    serverSeed: "",
    nonce: 0,
  });
  const [params, setParams] = useState<GameParams>({
    mineCount: 3,
    gridSize: 25,
    rows: 16,
    risk: "low",
    segments: 10,
    coins: 1,
  });
  const [analyzer, setAnalyzer] = useState<AnalyzerParams>({
    nonceStart: 0,
    nonceEnd: 100,
    bettingSize: 1,
    bankroll: 100,
    condition: "over",
    target: 50.5,
    targetMultiplier: 2,
  });
  const [manual, setManual] = useState<AnalyzerSummary | null>(null);

  const autoSummary = useMemo(() => {
    if (!seeds.serverSeed.trim()) return null;
    return analyzeGame(game, seeds, analyzer, params);
  }, [game, seeds, analyzer, params]);

  const summary = manual ?? autoSummary;

  return (
    <Card
      variant="glass"
      padded={false}
      className="light-element dark-glass-element relative"
    >
      <div className="relative flex flex-col lg:flex-row">
        <div className="flex w-full flex-col gap-5 p-4 md:gap-6 md:p-6 lg:w-[460px] lg:shrink-0 lg:border-r lg:border-[rgba(42,39,78,0.08)] dark:lg:border-white/10">
          <CasinoGamePickers
            game={game}
            onGameChange={(g) => {
              setGame(g);
              setManual(null);
            }}
            mode="analyzer"
          />
          <SeedFields seeds={seeds} onChange={setSeeds} showNonce={false} />

          {game === "dice" ? (
            <>
              <FieldLabel label="Condition">
                <Dropdown
                  theme="auto"
                  block
                  size="md"
                  sizeConfig={{ radius: 22, paddingY: 9.5 }}
                  options={[
                    { value: "over", label: "Over" },
                    { value: "under", label: "Under" },
                  ]}
                  value={analyzer.condition ?? "over"}
                  onChange={(v) =>
                    setAnalyzer((a) => ({
                      ...a,
                      condition: v as "over" | "under",
                    }))
                  }
                />
              </FieldLabel>
              <FieldLabel label="Target">
                <NumberStepper
                  value={String(analyzer.target ?? 50.5)}
                  onChange={(v) =>
                    setAnalyzer((a) => ({
                      ...a,
                      target: parseFloat(v) || 50.5,
                    }))
                  }
                  ariaLabel="Target"
                  step={0.5}
                />
              </FieldLabel>
            </>
          ) : null}

          {game === "limbo" ? (
            <FieldLabel label="Target Multiplier">
              <NumberStepper
                value={String(analyzer.targetMultiplier ?? 2)}
                onChange={(v) =>
                  setAnalyzer((a) => ({
                    ...a,
                    targetMultiplier: parseFloat(v) || 2,
                  }))
                }
                ariaLabel="Target multiplier"
                step={0.1}
              />
            </FieldLabel>
          ) : null}

          {game === "mines" ? (
            <FieldLabel label="Mine Count">
              <NumberStepper
                value={String(params.mineCount ?? 3)}
                onChange={(v) =>
                  setParams((p) => ({
                    ...p,
                    mineCount: Math.min(
                      24,
                      Math.max(1, Math.floor(parseFloat(v) || 1)),
                    ),
                  }))
                }
                ariaLabel="Mine count"
              />
            </FieldLabel>
          ) : null}

          {game === "plinko" ? (
            <>
              <FieldLabel label="Rows">
                <NumberStepper
                  value={String(params.rows ?? 16)}
                  onChange={(v) =>
                    setParams((p) => ({
                      ...p,
                      rows: Math.min(
                        16,
                        Math.max(8, Math.floor(parseFloat(v) || 8)),
                      ),
                    }))
                  }
                  ariaLabel="Rows"
                />
              </FieldLabel>
              <FieldLabel label="Risk">
                <Dropdown
                  theme="auto"
                  block
                  size="md"
                  sizeConfig={{ radius: 22, paddingY: 9.5 }}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "extreme", label: "Extreme" },
                  ]}
                  value={(params.risk as string) ?? "low"}
                  onChange={(v) => setParams((p) => ({ ...p, risk: v }))}
                />
              </FieldLabel>
            </>
          ) : null}

          {game === "wheel" ? (
            <>
              <FieldLabel label="Segments">
                <Dropdown
                  theme="auto"
                  block
                  size="md"
                  sizeConfig={{ radius: 22, paddingY: 9.5 }}
                  options={[10, 20, 30, 40, 50].map((n) => ({
                    value: String(n),
                    label: String(n),
                  }))}
                  value={String(params.segments ?? 10)}
                  onChange={(v) =>
                    setParams((p) => ({ ...p, segments: parseInt(v, 10) }))
                  }
                />
              </FieldLabel>
              <FieldLabel label="Risk">
                <Dropdown
                  theme="auto"
                  block
                  size="md"
                  sizeConfig={{ radius: 22, paddingY: 9.5 }}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                  value={(params.risk as string) ?? "low"}
                  onChange={(v) => setParams((p) => ({ ...p, risk: v }))}
                />
              </FieldLabel>
            </>
          ) : null}

          {game === "flip" ? (
            <FieldLabel label="Coins">
              <NumberStepper
                value={String(params.coins ?? 1)}
                onChange={(v) =>
                  setParams((p) => ({
                    ...p,
                    coins: Math.min(
                      20,
                      Math.max(1, Math.floor(parseFloat(v) || 1)),
                    ),
                  }))
                }
                ariaLabel="Coins"
              />
            </FieldLabel>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Nonce Start">
              <NumberStepper
                value={String(analyzer.nonceStart)}
                onChange={(v) =>
                  setAnalyzer((a) => ({
                    ...a,
                    nonceStart: Math.max(0, Math.floor(parseFloat(v) || 0)),
                  }))
                }
                ariaLabel="Nonce start"
              />
            </FieldLabel>
            <FieldLabel label="Nonce End">
              <NumberStepper
                value={String(analyzer.nonceEnd)}
                onChange={(v) =>
                  setAnalyzer((a) => ({
                    ...a,
                    nonceEnd: Math.max(0, Math.floor(parseFloat(v) || 0)),
                  }))
                }
                ariaLabel="Nonce end"
              />
            </FieldLabel>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Betting Size">
              <NumberStepper
                value={String(analyzer.bettingSize)}
                onChange={(v) =>
                  setAnalyzer((a) => ({
                    ...a,
                    bettingSize: parseFloat(v) || 0,
                  }))
                }
                ariaLabel="Betting size"
                step={0.1}
              />
            </FieldLabel>
            <FieldLabel label="Bankroll">
              <NumberStepper
                value={String(analyzer.bankroll)}
                onChange={(v) =>
                  setAnalyzer((a) => ({
                    ...a,
                    bankroll: parseFloat(v) || 0,
                  }))
                }
                ariaLabel="Bankroll"
                step={1}
              />
            </FieldLabel>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              const s = analyzeGame(game, seeds, analyzer, params);
              setManual(s);
            }}
            disabled={!seeds.serverSeed.trim()}
          >
            Run Analyzer
          </Button>
        </div>

        <div className="flex min-h-[280px] flex-1 p-4 md:p-6">
          {!seeds.serverSeed.trim() || !summary ? (
            <EmptyState message="Enter seeds and run the analyzer to see ROI, win rate, and streak stats." />
          ) : (
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <Metric label="Total Bets" value={String(summary.totalBets)} />
              <Metric
                label="Win Rate"
                value={`${summary.winRate.toFixed(2)}%`}
                accent
              />
              <Metric label="ROI" value={`${summary.roi.toFixed(2)}%`} accent />
              <Metric label="P&L" value={summary.pnl.toFixed(4)} />
              <Metric
                label="Longest Win Streak"
                value={String(summary.longestWinStreak)}
              />
              <Metric
                label="Longest Lose Streak"
                value={String(summary.longestLoseStreak)}
              />
              <Metric
                label="Starting Bankroll"
                value={summary.startingBankroll.toFixed(2)}
              />
              <Metric
                label="Ending Bankroll"
                value={summary.endingBankroll.toFixed(2)}
                accent
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
