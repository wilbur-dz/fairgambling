"use client";

import { useMemo, useState } from "react";
import {
  FieldLabel,
  NumberStepper,
} from "@/components/bonus-calculator/field";
import { CasinoGamePickers } from "@/components/provably-fair/casino-game-pickers";
import { SeedFields } from "@/components/provably-fair/seed-fields";
import { ResultRenderer } from "@/components/provably-fair/results/result-renderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import type { StakeGameId } from "@/lib/provably-fair/constants";
import type { GameParams, SeedInputs } from "@/lib/provably-fair/types";
import { verifyStake } from "@/lib/provably-fair/verify";

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
                mineCount: Math.min(24, Math.max(1, Math.floor(parseFloat(v) || 1))),
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
                  rows: Math.min(16, Math.max(8, Math.floor(parseFloat(v) || 8))),
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
                coins: Math.min(20, Math.max(1, Math.floor(parseFloat(v) || 1))),
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
                cardCount: Math.min(52, Math.max(1, Math.floor(parseFloat(v) || 1))),
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
                cardCount: Math.min(52, Math.max(1, Math.floor(parseFloat(v) || 1))),
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

export function VerifierPanel() {
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
    difficulty: "medium",
    cardCount: 52,
  });

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

  const showNonce = game !== "crash";

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
              if (g === "blackjack") {
                setParams((p) => ({ ...p, cardCount: 10 }));
              } else if (g === "hilo") {
                setParams((p) => ({ ...p, cardCount: 52 }));
              }
            }}
          />
          <SeedFields
            seeds={seeds}
            onChange={setSeeds}
            showNonce={showNonce}
          />
          <GameParamFields game={game} params={params} onChange={setParams} />
          <Button
            type="button"
            variant="ghost"
            disabled
            title="Coming soon"
            className="opacity-50"
          >
            Import bet slip
          </Button>
        </div>
        <div className="flex min-h-[280px] flex-1 items-center justify-center p-4 md:p-6">
          <div className="w-full">
            <ResultRenderer result={result} />
          </div>
        </div>
      </div>
    </Card>
  );
}
