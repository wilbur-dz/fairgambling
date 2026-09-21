"use client";

import { useState } from "react";
import { ExpandGamesButton } from "@/components/casino-page/expand-games-button";
import { GameTileCard } from "@/components/casino-page/game-tile-card";
import { SectionBlock } from "@/components/casino-page/section-block";
import { CATEGORY_WEIGHTS } from "@/lib/casinos/categories";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import type { CasinoMetaHouseGame, CasinoRatingDetail } from "@/lib/casinos/data";
import {
  formatHouseGameCompactNumber,
  parseHouseGameMaxMultiplier,
  parseHouseGameRtp,
} from "@/lib/provably-fair/house-games";
import { getOriginalThumbnail } from "@/lib/provably-fair/original-thumbnails";

const INITIAL_VISIBLE = 12;

type HouseGamesSectionProps = {
  casino: CasinoDetail;
  rating: CasinoRatingDetail | null;
};

/** Port of reference `HouseGamesSection` (2-7hhq-z71oqb.js 2704–2753). */
export function HouseGamesSection({ casino, rating }: HouseGamesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const houseGames = casino.meta?.games?.houseGames ?? [];

  if (houseGames.length === 0) {
    return null;
  }

  const visible = expanded ? houseGames : houseGames.slice(0, INITIAL_VISIBLE);
  const category = rating?.categories?.games;

  return (
    <SectionBlock
      id="house-games"
      title="House Games"
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {visible.map((game) => (
          <HouseGameTile
            key={game.slug ?? game.name ?? "game"}
            casinoSlug={casino.slug}
            game={game}
          />
        ))}
      </div>

      {houseGames.length > INITIAL_VISIBLE ? (
        <ExpandGamesButton
          expanded={expanded}
          label="Show All Games"
          onClick={() => setExpanded((value) => !value)}
        />
      ) : null}
    </SectionBlock>
  );
}

function HouseGameTile({
  casinoSlug,
  game,
}: {
  casinoSlug: string;
  game: CasinoMetaHouseGame;
}) {
  const rtp = parseHouseGameRtp(game.rtp);
  const maxMultiplier = parseHouseGameMaxMultiplier(game.maxMultiplier);
  const sub =
    maxMultiplier != null
      ? `${formatHouseGameCompactNumber(maxMultiplier)}x Max`
      : null;
  const thumbnail =
    game.imageUrl?.trim() ||
    getOriginalThumbnail(casinoSlug, game.slug ?? "") ||
    null;

  return (
    <GameTileCard
      stackOnMobile
      thumbnail={thumbnail}
      name={game.name ?? game.slug ?? "Game"}
      rtp={rtp}
      sub={sub}
    />
  );
}
