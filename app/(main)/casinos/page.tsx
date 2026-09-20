import { CasinosView } from "@/components/casinos/casinos-view";
import { loadCasinosPageData } from "@/lib/casinos/loaders";

/**
 * Casinos (Ranking) page — composition matches reference `CasinosView`.
 * See `/CASINOS_MODULES.md` for per-module data sources.
 */
export default async function CasinosPage() {
  const { bundle, ratingsMap } = await loadCasinosPageData();

  return (
    <CasinosView initialBundle={bundle} initialRatingsMap={ratingsMap} />
  );
}
