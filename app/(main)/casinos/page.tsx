import { CasinosView } from "@/components/casinos/casinos-view";
import { loadCasinosPageData } from "@/lib/casinos/loaders";
import {
  CASINOS_SEO_HEADING,
  CASINOS_SEO_POSTS,
  loadCasinosSeoHtml,
} from "@/lib/casinos/seo-content";

/**
 * Casinos (Ranking) page — composition matches reference:
 * CasinosView + SeoProseDetails below the list.
 */
export default async function CasinosPage() {
  const [{ bundle, ratingsMap }, seoHtml] = await Promise.all([
    loadCasinosPageData(),
    loadCasinosSeoHtml(),
  ]);

  return (
    <CasinosView
      initialBundle={bundle}
      initialRatingsMap={ratingsMap}
      seoHeading={CASINOS_SEO_HEADING}
      seoHtml={seoHtml}
      seoPosts={CASINOS_SEO_POSTS}
    />
  );
}
