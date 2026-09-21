"use client";

import type { VerifyResult } from "@/lib/provably-fair/types";
import { CardsResult } from "./cards-result";
import { CrashResult } from "./crash-result";
import { DiceResult } from "./dice-result";
import { DiamondsResult } from "./diamonds-result";
import { DragonResult } from "./dragon-result";
import { EmptyState } from "./empty-state";
import { FlipResult } from "./flip-result";
import { KenoResult } from "./keno-result";
import { LimboResult } from "./limbo-result";
import { MinesResult } from "./mines-result";
import { PlinkoResult } from "./plinko-result";
import { RouletteResult } from "./roulette-result";
import { WheelResultView } from "./wheel-result";

export function ResultRenderer({ result }: { result: VerifyResult | null }) {
  if (!result) return <EmptyState />;

  switch (result.game) {
    case "dice":
      return <DiceResult roll={result.roll} />;
    case "limbo":
      return <LimboResult multiplier={result.multiplier} />;
    case "crash":
      return <CrashResult crashPoint={result.crashPoint} />;
    case "mines":
      return <MinesResult mines={result.mines} gridSize={result.gridSize} />;
    case "plinko":
      return (
        <PlinkoResult
          path={result.path}
          bucket={result.bucket}
          multiplier={result.multiplier}
        />
      );
    case "keno":
      return <KenoResult drawn={result.drawn} />;
    case "roulette":
      return <RouletteResult pocket={result.pocket} />;
    case "flip":
      return <FlipResult outcomes={result.outcomes} />;
    case "wheel":
      return (
        <WheelResultView index={result.index} multiplier={result.multiplier} />
      );
    case "diamonds":
      return <DiamondsResult gems={result.gems} />;
    case "hilo":
    case "blackjack":
      return (
        <CardsResult
          cards={result.cards}
          label={result.game === "hilo" ? "Hilo Cards" : "Blackjack Cards"}
        />
      );
    case "dragon-tower":
      return <DragonResult levels={result.levels} />;
    default:
      return <EmptyState />;
  }
}
