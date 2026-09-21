"use client";

import Image from "next/image";
import type { Rank, Suit } from "@/lib/blackjack/types";

type PlayingCardProps = {
  suit?: Suit;
  value?: Rank | "";
};

const SUIT_ICON: Record<Suit, string> = {
  club: "/icons/card-club.svg",
  spades: "/icons/card-spades.svg",
  heart: "/icons/card-heart.svg",
  diamond: "/icons/card-diamond.svg",
};

/** Face-up playing card (86×120). */
export function PlayingCard({ suit = "heart", value = "A" }: PlayingCardProps) {
  const empty = !value;
  const red = suit === "heart" || suit === "diamond";

  return (
    <div className="flex h-[120px] w-[86px] flex-col items-start justify-start rounded-lg bg-white px-2.5 py-3.5 shadow-[0px_0px_0px_1px_rgba(190,171,253,0.5)_inset,-1.3px_-1.3px_0px_0px_rgba(190,171,253,1)_inset,-3px_-2px_4px_0px_rgba(190,171,253,0.25)_inset]">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-6 w-[17px] items-center justify-center text-[17px] font-semibold leading-6 ${
            empty
              ? "h-auto w-auto text-[30px] text-zinc-300"
              : red
                ? "text-red-600"
                : "text-zinc-900"
          }`}
        >
          {empty ? "?" : value}
        </div>
        <div>
          {empty ? (
            <Image
              src="/icons/card-empty.svg"
              alt="Empty card"
              width={20}
              height={20}
            />
          ) : (
            <Image
              src={SUIT_ICON[suit]}
              alt={suit}
              width={20}
              height={20}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Face-down card with brand mark. */
export function CardBack() {
  return (
    <div
      className="relative flex h-[120px] w-[86px] items-center justify-center overflow-hidden rounded-lg shadow-[0px_0px_0px_1px_rgba(190,171,253,0.5)_inset,-1.3px_-1.3px_0px_0px_rgba(190,171,253,1)_inset,-3px_-2px_4px_0px_rgba(190,171,253,0.25)_inset]"
      style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <div className="relative z-10 opacity-65">
        <Image
          src="/icons/logo-dark.svg"
          alt="FairGambling"
          width={30}
          height={27}
        />
      </div>
    </div>
  );
}
