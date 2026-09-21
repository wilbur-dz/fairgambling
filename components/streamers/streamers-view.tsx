"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AllStreamersPanel } from "@/components/streamers/all-streamers/all-streamers-panel";
import { StreamersNewsTab } from "@/components/streamers/news/streamers-news-tab";
import { StreamersOverview } from "@/components/streamers/overview/streamers-overview";
import { Tabs, NAV_TABS_SIZE_CONFIG } from "@/components/ui/tabs";
import { registerRemoteCasinoLogos } from "@/lib/casinos/logos";
import {
  ALL_STREAMERS,
  mergeDbProfiles,
  mergeLiveStats,
} from "@/lib/streamers/data";
import type {
  StreamerDbProfile,
  StreamerLiveNow,
  StreamerLiveStat,
  StreamerNewsArticle,
} from "@/lib/streamers/types";

export {
  CasinoTag,
  DegenBadge,
  LiveBadge,
  MoneyLegend,
  MoneyTypeBadge,
  PlatformLogo,
  StreamerAvatar,
  StreamerCasinoIcon,
  pfpUrl,
} from "@/components/streamers/shared";

const PAGE_TABS = ["Overview", "All Streamers", "News"] as const;

export type StreamersViewProps = {
  liveStats: Record<string, StreamerLiveStat>;
  liveNow: Record<string, StreamerLiveNow>;
  profiles: StreamerDbProfile[];
  casinoLogos: Record<string, string>;
  initialPage?: string;
  newsArticles?: StreamerNewsArticle[] | null;
};

export function StreamersView({
  liveStats,
  liveNow,
  profiles,
  casinoLogos,
  initialPage = "Overview",
  newsArticles,
}: StreamersViewProps) {
  registerRemoteCasinoLogos(casinoLogos);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialPage);
  const openedOnNewsRoute = initialPage === "News";

  const streamers = useMemo(
    () =>
      mergeLiveStats(mergeDbProfiles(ALL_STREAMERS, profiles), liveStats, liveNow),
    [liveStats, liveNow, profiles],
  );

  const onTabChange = (tab: string) => {
    if (tab === "News" && !openedOnNewsRoute) {
      router.push("/streamers/news");
      return;
    }
    if (tab !== "News" && openedOnNewsRoute) {
      router.push(tab === "All Streamers" ? "/streamers?tab=all" : "/streamers");
      return;
    }
    setActiveTab(tab);
  };

  return (
    <main className="flex w-full flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <Tabs
        theme="auto"
        tabs={PAGE_TABS.map((id) => ({ id, label: id }))}
        activeId={activeTab}
        onChange={onTabChange}
        fill
        size="md"
        sizeConfig={NAV_TABS_SIZE_CONFIG}
        className="flex w-full sm:inline-flex sm:w-fit"
      />
      {activeTab === "News" ? (
        <StreamersNewsTab initial={newsArticles} streamers={streamers} />
      ) : activeTab === "All Streamers" ? (
        <AllStreamersPanel streamers={streamers} />
      ) : (
        <StreamersOverview streamers={streamers} />
      )}
    </main>
  );
}
