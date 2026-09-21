"use client";

import { useMemo, useState } from "react";
import { ExpandGamesButton } from "@/components/casino-page/expand-games-button";
import { GameTileCard } from "@/components/casino-page/game-tile-card";
import { SectionBlock } from "@/components/casino-page/section-block";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import type {
  CasinoMetaProviderGame,
  CasinoRatingDetail,
} from "@/lib/casinos/data";
import { getGameThumbnail } from "@/lib/casinos/game-thumbnails";
import {
  formatHouseGameCompactNumber,
  parseHouseGameRtp,
} from "@/lib/provably-fair/house-games";

const INITIAL_VISIBLE = 6;

type SlotTile = CasinoMetaProviderGame & { thumbnail: string };

type SlotsSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

function parseMaxBet(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }
  const parsed = parseFloat(String(raw).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function collectSlotTiles(casino: CasinoDetail): SlotTile[] {
  const providers = casino.meta?.games?.providers ?? [];
  if (!Array.isArray(providers)) return [];

  return providers
    .flatMap((provider) => provider.games ?? [])
    .map((game) => {
      const name = game.name ?? "";
      const thumbnail = getGameThumbnail(name);
      if (!thumbnail) return null;
      return { ...game, thumbnail };
    })
    .filter((game): game is SlotTile => game != null);
}

/** Port of reference `SlotsSection` (2-7hhq-z71oqb.js 2754–2797). */
export function SlotsSection({ casino, rating }: SlotsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const slots = useMemo(() => collectSlotTiles(casino), [casino]);

  if (slots.length === 0) {
    return null;
  }

  const visible = expanded ? slots : slots.slice(0, INITIAL_VISIBLE);
  const category = rating?.categories?.games;

  return (
    <SectionBlock
      id="slots"
      title="Slots"
      weight={CATEGORY_WEIGHTS.games}
      score={category?.score ?? 0}
      pending={category?.pending}
      subcategories={category?.subcategories?.map((s) => ({
        name: s.name,
        score: s.score,
        weight: s.weight ?? "0",
        pending: s.pending,
      }))}
      rows={[]}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((game) => {
          const name = game.name ?? "Slot";
          const maxBet = parseMaxBet(game.maxBet);
          const sub =
            maxBet != null
              ? `$${formatHouseGameCompactNumber(maxBet)} Max`
              : null;

          return (
            <GameTileCard
              key={name}
              thumbnail={game.thumbnail}
              name={name}
              rtp={parseHouseGameRtp(game.rtp)}
              sub={sub}
            />
          );
        })}
      </div>

      {slots.length > INITIAL_VISIBLE ? (
        <ExpandGamesButton
          expanded={expanded}
          label="Show All Slots"
          onClick={() => setExpanded((value) => !value)}
        />
      ) : null}
    </SectionBlock>
  );
}
