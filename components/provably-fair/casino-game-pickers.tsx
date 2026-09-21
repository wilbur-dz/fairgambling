"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CasinoLogo } from "@/components/ui/casino-logo";
import {
  ANALYZER_EXCLUDED,
  ANALYZER_SUPPORTED,
  STAKE_GAMES,
  type StakeGameId,
} from "@/lib/provably-fair/constants";

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

function GameIcon({ icon, size = 20 }: { icon: string; size?: number }) {
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
      className="h-full w-full object-cover"
      unoptimized
    />
  );
}

type CasinoGamePickersProps = {
  game: StakeGameId;
  onGameChange: (game: StakeGameId) => void;
  mode?: "verifier" | "analyzer";
  /** Compact pill row for the toolbar (mock/9). */
  compact?: boolean;
};

function CompactSelect({
  label,
  valueLabel,
  icon,
  open,
  onToggle,
  children,
}: {
  label: string;
  valueLabel: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 220,
  });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  }, [open]);

  return (
    <div className="relative min-w-0">
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 self-stretch rounded-[50px] border-[0.5px] border-[#e4e4e7] bg-[#e4e4e7]/30 px-3 py-2.5 backdrop-blur-[35.5px] transition-colors hover:bg-[#e4e4e7]/50 dark:border-white/20 dark:bg-white/[0.01] dark:hover:bg-white/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
            {label}
          </span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
            {icon}
          </span>
          <span className="truncate text-[12px] font-medium text-[#2a274e] dark:text-white">
            {valueLabel}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[rgba(42,39,78,0.5)] transition-transform dark:text-white/50 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[80] max-h-[280px] overflow-y-auto rounded-[16px] border border-[rgba(42,39,78,0.1)] bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#161c32]"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
              role="listbox"
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function CasinoGamePickers({
  game,
  onGameChange,
  mode = "verifier",
  compact = false,
}: CasinoGamePickersProps) {
  const [casinoOpen, setCasinoOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  const games =
    mode === "analyzer"
      ? STAKE_GAMES.filter(
          (g) => ANALYZER_SUPPORTED.has(g.id) && !ANALYZER_EXCLUDED.has(g.id),
        )
      : STAKE_GAMES;

  const current = STAKE_GAMES.find((g) => g.id === game) ?? STAKE_GAMES[0];

  useEffect(() => {
    if (!casinoOpen && !gameOpen) return;
    const close = () => {
      setCasinoOpen(false);
      setGameOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [casinoOpen, gameOpen]);

  if (!compact) {
    // Fallback stacked (unused in mock/9 layout) — keep for analyzer internals if needed
    return null;
  }

  return (
    <div
      className="grid flex-1 grid-cols-2 gap-3 sm:gap-5"
      onClick={(e) => e.stopPropagation()}
    >
      <CompactSelect
        label="Casino:"
        valueLabel="Stake"
        icon={
          <CasinoLogo slug="stake" name="Stake" size={20} theme="auto" />
        }
        open={casinoOpen}
        onToggle={() => {
          setCasinoOpen((v) => !v);
          setGameOpen(false);
        }}
      >
        <button
          type="button"
          role="option"
          aria-selected
          className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[13px] text-[#2a274e] dark:text-white"
          onClick={() => setCasinoOpen(false)}
        >
          <CasinoLogo slug="stake" name="Stake" size={18} theme="auto" />
          Stake
        </button>
      </CompactSelect>

      <CompactSelect
        label="Game:"
        valueLabel={current.label}
        icon={<GameIcon icon={current.icon} />}
        open={gameOpen}
        onToggle={() => {
          setGameOpen((v) => !v);
          setCasinoOpen(false);
        }}
      >
        {games.map((g) => (
          <button
            key={g.id}
            type="button"
            role="option"
            aria-selected={g.id === game}
            className={`flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-[13px] transition-colors hover:bg-[rgba(136,116,255,0.1)] ${
              g.id === game
                ? "bg-[rgba(136,116,255,0.12)] text-[#8874ff]"
                : "text-[#2a274e] dark:text-white"
            }`}
            onClick={() => {
              onGameChange(g.id);
              setGameOpen(false);
            }}
          >
            <span className="h-5 w-5 overflow-hidden rounded-full">
              <GameIcon icon={g.icon} />
            </span>
            {g.label}
          </button>
        ))}
      </CompactSelect>
    </div>
  );
}
