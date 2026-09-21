"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StreamerRecord } from "@/lib/streamers/types";
import { CasinosByMarketValueTable } from "./casinos-by-mv-table";
import { MarketValueBubblePanel } from "./mv-bubble-panel";
import { NewsHeroCarousel } from "./news-hero-carousel";
import { StreamerLeaderboardPanel } from "./streamer-leaderboard-panel";

export function StreamersOverview({ streamers }: { streamers: StreamerRecord[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-[rgba(42,39,78,0.9)] dark:text-white/90">
          Latest Streamer News
        </h2>
        <Button
          theme="auto"
          variant="ghost"
          size="sm"
          rightIcon={<ArrowUpRight />}
          onClick={() => router.push("/streamers/news")}
        >
          View All
        </Button>
      </div>
      <NewsHeroCarousel />
      <StreamerLeaderboardPanel streamers={streamers} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CasinosByMarketValueTable streamers={streamers} />
        <MarketValueBubblePanel streamers={streamers} />
      </div>
    </div>
  );
}
