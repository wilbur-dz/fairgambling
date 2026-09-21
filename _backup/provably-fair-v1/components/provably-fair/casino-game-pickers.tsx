"use client";

import Image from "next/image";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { Dropdown } from "@/components/ui/dropdown";
import {
  ANALYZER_EXCLUDED,
  ANALYZER_SUPPORTED,
  STAKE_GAMES,
  type StakeGameId,
} from "@/lib/provably-fair/constants";
import { FieldLabel } from "@/components/bonus-calculator/field";

const GAME_ICON: Record<string, string> = {
  dice: "/casino-games/dice.svg",
  limbo: "/casino-games/limbo.svg",
  plinko: "/casino-games/plinko.svg",
  mines: "/casino-games/mines.svg",
  keno: "/casino-games/keno.svg",
  blackjack: "/casino-games/blackjack.svg",
  crash: "/casino-games/crash.svg",
  hilo: "/casino-games/hilo.svg",
  tower: "/casino-games/tower.svg",
  roulette: "/casino-games/roulette.svg",
  flip: "/casino-games/flip.svg",
  wheel: "/casino-games/wheel.svg",
};

function GameIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const src = GAME_ICON[icon];
  if (!src) {
    return (
      <span
        className="inline-block rounded-full bg-[#8874ff]/30"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="opacity-90"
    />
  );
}

type CasinoGamePickersProps = {
  game: StakeGameId;
  onGameChange: (game: StakeGameId) => void;
  mode?: "verifier" | "analyzer";
};

export function CasinoGamePickers({
  game,
  onGameChange,
  mode = "verifier",
}: CasinoGamePickersProps) {
  const games =
    mode === "analyzer"
      ? STAKE_GAMES.filter(
          (g) =>
            ANALYZER_SUPPORTED.has(g.id) && !ANALYZER_EXCLUDED.has(g.id),
        )
      : STAKE_GAMES;

  return (
    <div className="flex flex-col gap-4">
      <FieldLabel label="Casino">
        <Dropdown
          theme="auto"
          block
          disabled
          size="md"
          sizeConfig={{ radius: 22, paddingY: 9.5, iconSize: 16 }}
          options={[{ value: "stake", label: "Stake" }]}
          value="stake"
          onChange={() => {}}
          renderIcon={() => (
            <CasinoLogo slug="stake" name="Stake" size={18} theme="auto" />
          )}
        />
      </FieldLabel>
      <FieldLabel label="Game">
        <Dropdown
          theme="auto"
          block
          size="md"
          sizeConfig={{ radius: 22, paddingY: 9.5, iconSize: 18 }}
          options={games.map((g) => ({
            value: g.id,
            label: g.label,
            icon: <GameIcon icon={g.icon} />,
          }))}
          value={game}
          onChange={(id) => onGameChange(id as StakeGameId)}
          renderIcon={(value) => {
            const meta = STAKE_GAMES.find((g) => g.id === value);
            return meta ? <GameIcon icon={meta.icon} /> : null;
          }}
        />
      </FieldLabel>
    </div>
  );
}
