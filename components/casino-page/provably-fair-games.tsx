"use client";

import { CasinoGameIcon } from "@/components/casino-page/casino-game-icon";
import { ClickNav } from "@/components/ui/click-nav";
import { Card } from "@/components/ui/card";
import type { CasinoMeta } from "@/lib/casinos/data";
import { HIDDEN_CASINOS } from "@/lib/provably-fair/casino-games-config";
import {
  extractHouseGames,
  getCasinoReviewPagePfGames,
  getHouseGameImageUrl,
  PF_GAME_ICON_ALIASES,
  pfGameToUiSlug,
  type HouseGameMeta,
} from "@/lib/provably-fair/house-games";
import { getOriginalThumbnail } from "@/lib/provably-fair/original-thumbnails";

const CASINO_SLUG_ALIASES: Record<string, string> = {
  bcgame: "bcgame",
};

type ProvablyFairGamesProps = {
  casinoSlug: string;
  houseGames?: HouseGameMeta[] | null;
  meta?: CasinoMeta | null;
};

/** Port of reference `ProvablyFairGames` (2-7hhq-z71oqb.js). */
export function ProvablyFairGames({
  casinoSlug,
  houseGames,
  meta,
}: ProvablyFairGamesProps) {
  const casinoId = CASINO_SLUG_ALIASES[casinoSlug] ?? casinoSlug;
  if (HIDDEN_CASINOS.has(casinoId)) {
    return null;
  }

  const resolvedHouseGames = houseGames ?? extractHouseGames(meta);
  const games = getCasinoReviewPagePfGames(casinoId, resolvedHouseGames);
  if (games.length === 0) {
    return null;
  }

  return (
    <Card
      id="provably-fair-games"
      variant="panel"
      blur
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          Provably Fair Games
        </h2>
        <span className="text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
          These are the games we actively support with our verifier and seed
          analyzer. The casino may offer additional provably fair games.
        </span>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide">
        <div className="flex w-max gap-4">
          {games.map((gameSlug) => {
            const uiSlug = pfGameToUiSlug(gameSlug);
            const thumbnail =
              getHouseGameImageUrl(resolvedHouseGames, gameSlug)?.trim() ||
              getOriginalThumbnail(casinoSlug, gameSlug) ||
              getOriginalThumbnail(casinoSlug, uiSlug);

            return (
              <ClickNav
                key={gameSlug}
                href={`/provably-fair/${casinoSlug}/${uiSlug}`}
                className="block h-[130px] w-[99px] shrink-0 overflow-hidden rounded-[10px] bg-[rgba(42,39,78,0.05)] transition-transform duration-200 hover:scale-105 dark:bg-white/[0.04]"
              >
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external CDN thumbnails match reference
                  <img
                    src={thumbnail}
                    alt={uiSlug}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CasinoGameIcon
                    name={PF_GAME_ICON_ALIASES[gameSlug] ?? gameSlug}
                    className="h-full w-full"
                    fill
                  />
                )}
              </ClickNav>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
