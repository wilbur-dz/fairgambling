import type { Metadata } from "next";
import { StreamersView } from "@/components/streamers/streamers-view";
import { getStreamerNews } from "@/lib/streamers/news";
import { loadStreamersPageData } from "@/lib/streamers/loaders";

export const metadata: Metadata = {
  title: "Streamer News",
  description: "Latest news on crypto casino streamers, deals, drama, and milestones.",
  alternates: {
    canonical: "https://www.fairgambling.com/streamers/news",
  },
};

export default async function StreamersNewsPage() {
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
      initialPage="News"
      newsArticles={newsArticles}
    />
  );
}
