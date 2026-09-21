import { CompareView } from "@/components/casinos/compare-view";
import { loadCasinosPageData } from "@/lib/casinos/loaders";

/** Casinos Compare page — port of reference `CompareView`. */
export default async function CasinosComparePage() {
  const { bundle, ratingsMap } = await loadCasinosPageData();

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <CompareView initialBundle={bundle} initialRatingsMap={ratingsMap} />
    </main>
  );
}
