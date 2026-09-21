import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CasinoPageView } from "@/components/casino-page/casino-page-view";
import { isValidCasinoSlug } from "@/lib/casinos/casino-page";
import { loadCasinoPageData } from "@/lib/casinos/casino-page-loaders";
import { casinoRouteSlug } from "@/lib/reviews/format";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = casinoRouteSlug(raw ?? "");
  if (!isValidCasinoSlug(slug)) {
    return { title: "Casino not found" };
  }

  const data = await loadCasinoPageData(slug);
  if (!data) {
    return { title: "Casino not found" };
  }

  const score =
    data.rating?.totalScore != null
      ? ` · ${data.rating.totalScore.toFixed(0)}/100`
      : "";

  return {
    title: `${data.casino.name} Review${score}`,
    description: `${data.casino.name} crypto casino review — FairGambling rating, bonuses, games, and safety.`,
  };
}

/**
 * Generic casino detail page at `/${slug}`.
 * Composition matches reference: SectionNav + CasinoProfile + CasinoTabs.
 */
export default async function CasinoSlugPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = casinoRouteSlug(raw ?? "");
  if (!isValidCasinoSlug(slug)) notFound();

  const data = await loadCasinoPageData(slug);
  if (!data) notFound();

  return <CasinoPageView data={data} />;
}
