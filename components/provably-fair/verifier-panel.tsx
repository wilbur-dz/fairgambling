"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FieldLabel,
  NumberStepper,
} from "@/components/bonus-calculator/field";
import { SeedFields } from "@/components/provably-fair/seed-fields";
import { ResultRenderer } from "@/components/provably-fair/results/result-renderer";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import type { StakeGameId } from "@/lib/provably-fair/constants";
import type { GameParams, SeedInputs } from "@/lib/provably-fair/types";
import { verifyStake } from "@/lib/provably-fair/verify";
import { Download, Share2 } from "lucide-react";

const RISK_OPTS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "extreme", label: "Extreme" },
];

const WHEEL_RISK = RISK_OPTS.filter((r) => r.value !== "extreme");

const DIFFICULTY_OPTS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
  { value: "master", label: "Master" },
  { value: "extreme", label: "Extreme" },
  { value: "nightmare", label: "Nightmare" },
];

function GameParamFields({
  game,
  params,
  onChange,
}: {
  game: StakeGameId;
  params: GameParams;
  onChange: (p: GameParams) => void;
}) {
  switch (game) {
    case "mines":
      return (
        <FieldLabel label="Mine Count">
          <NumberStepper
            value={String(params.mineCount ?? 3)}
            onChange={(v) =>
              onChange({
                ...params,
                mineCount: Math.min(
                  24,
                  Math.max(1, Math.floor(parseFloat(v) || 1)),
                ),
                gridSize: 25,
              })
            }
            ariaLabel="Mine count"
          />
        </FieldLabel>
      );
    case "plinko":
      return (
        <>
          <FieldLabel label="Rows">
            <NumberStepper
              value={String(params.rows ?? 16)}
              onChange={(v) =>
                onChange({
                  ...params,
                  rows: Math.min(
                    16,
                    Math.max(8, Math.floor(parseFloat(v) || 8)),
                  ),
                })
              }
              ariaLabel="Plinko rows"
            />
          </FieldLabel>
          <FieldLabel label="Risk">
            <Dropdown
              theme="auto"
              block
              size="md"
              sizeConfig={{ radius: 22, paddingY: 9.5 }}
              options={RISK_OPTS}
              value={(params.risk as string) ?? "low"}
              onChange={(v) => onChange({ ...params, risk: v })}
            />
          </FieldLabel>
        </>
      );
    case "wheel":
      return (
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
                onChange({ ...params, segments: parseInt(v, 10) })
              }
            />
          </FieldLabel>
          <FieldLabel label="Risk">
            <Dropdown
              theme="auto"
              block
              size="md"
              sizeConfig={{ radius: 22, paddingY: 9.5 }}
              options={WHEEL_RISK}
              value={(params.risk as string) ?? "low"}
              onChange={(v) => onChange({ ...params, risk: v })}
            />
          </FieldLabel>
        </>
      );
    case "flip":
      return (
        <FieldLabel label="Coins">
          <NumberStepper
            value={String(params.coins ?? 1)}
            onChange={(v) =>
              onChange({
                ...params,
                coins: Math.min(
                  20,
                  Math.max(1, Math.floor(parseFloat(v) || 1)),
                ),
              })
            }
            ariaLabel="Coins"
          />
        </FieldLabel>
      );
    case "dragon-tower":
      return (
        <FieldLabel label="Difficulty">
          <Dropdown
            theme="auto"
            block
            size="md"
            sizeConfig={{ radius: 22, paddingY: 9.5 }}
            options={DIFFICULTY_OPTS}
            value={(params.difficulty as string) ?? "medium"}
            onChange={(v) => onChange({ ...params, difficulty: v })}
          />
        </FieldLabel>
      );
    case "hilo":
      return (
        <FieldLabel label="Card Count">
          <NumberStepper
            value={String(params.cardCount ?? 52)}
            onChange={(v) =>
              onChange({
                ...params,
                cardCount: Math.min(
                  52,
                  Math.max(1, Math.floor(parseFloat(v) || 1)),
                ),
              })
            }
            ariaLabel="Card count"
          />
        </FieldLabel>
      );
    case "blackjack":
      return (
        <FieldLabel label="Card Count">
          <NumberStepper
            value={String(params.cardCount ?? 10)}
            onChange={(v) =>
              onChange({
                ...params,
                cardCount: Math.min(
                  52,
                  Math.max(1, Math.floor(parseFloat(v) || 1)),
                ),
              })
            }
            ariaLabel="Card count"
          />
        </FieldLabel>
      );
    default:
      return null;
  }
}

type VerifierPanelProps = {
  game: StakeGameId;
};

export function VerifierPanel({ game }: VerifierPanelProps) {
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
    difficulty: "medium",
    cardCount: 52,
  });

  useEffect(() => {
    if (game === "blackjack") {
      setParams((p) => ({ ...p, cardCount: 10 }));
    } else if (game === "hilo") {
      setParams((p) => ({ ...p, cardCount: 52 }));
    }
  }, [game]);

  const seedsComplete =
    Boolean(seeds.serverSeed.trim()) && Boolean(seeds.clientSeed.trim());

  const result = useMemo(() => {
    if (!seedsComplete) return null;
    return verifyStake(game, seeds, {
      ...params,
      cardCount:
        game === "blackjack"
          ? (params.cardCount ?? 10)
          : game === "hilo"
            ? (params.cardCount ?? 52)
            : params.cardCount,
    });
  }, [game, seeds, params, seedsComplete]);

  return (
    <div className="light-element dark-element relative isolate overflow-hidden rounded-[24px] p-4 sm:p-6">
      <div className="mb-2 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          theme="auto"
          size="sm"
          disabled
          title="Log in to share"
          leftIcon={<Share2 />}
        >
          Share
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div className="w-full shrink-0 lg:w-[460px]">
          <div className="grid grid-cols-1 gap-3 sm:gap-[15px]">
            <SeedFields
              seeds={seeds}
              onChange={setSeeds}
              showNonce={game !== "crash"}
            />
            <GameParamFields
              game={game}
              params={params}
              onChange={setParams}
            />
            <div>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="inline-flex items-center gap-2 rounded-[22px] border border-[rgba(42,39,78,0.15)] bg-[rgba(42,39,78,0.02)] px-4 py-2.5 text-[13px] font-medium text-[rgba(42,39,78,0.8)] opacity-60 transition-colors dark:border-white/10 dark:bg-white/[0.02] dark:text-white/80"
              >
                <Download size={15} aria-hidden />
                Import from bet slip
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <div className="mx-auto w-full max-w-[480px] px-4 md:max-w-[80%]">
            <ResultRenderer result={result} game={game} emptyAsDefault />
          </div>
        </div>
      </div>
    </div>
  );
}
