import type { Metadata } from "next";
import { StreamersView } from "@/components/streamers/streamers-view";
import { getStreamerNews } from "@/lib/streamers/news";
import { loadStreamersPageData } from "@/lib/streamers/loaders";

export const metadata: Metadata = {
  title: "Streamers",
  description:
    "Track crypto casino streamers — live Kick stats, market value estimates, casino deals, and streamer news.",
  alternates: {
    canonical: "https://www.fairgambling.com/streamers",
  },
};

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function resolveInitialTab(tab: string | undefined): string {
  if (tab === "all") return "All Streamers";
  if (tab === "news") return "News";
  return "Overview";
}

export default async function StreamersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [pageData, newsArticles] = await Promise.all([
    loadStreamersPageData(),
    getStreamerNews(),
  ]);

  return (
    <StreamersView
      liveStats={pageData.liveStats}
      liveNow={pageData.liveNow}
      profiles={pageData.profiles}
      casinoLogos={pageData.casinoLogos}
      initialPage={resolveInitialTab(params.tab)}
      newsArticles={newsArticles}
    />
  );
}
