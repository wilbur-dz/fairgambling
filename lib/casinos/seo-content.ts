import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SeoPostItem } from "@/components/seo/seo-details";

/** Matches live `/casinos` SeoProseDetails heading. */
export const CASINOS_SEO_HEADING =
  "Best Crypto Casino in 2026: 40 Bitcoin Casinos Compared";

/**
 * Optional related posts for `SeoPostsDetails` (not currently on live
 * `/casinos`, but supported when CMS provides items).
 */
export const CASINOS_SEO_POSTS: SeoPostItem[] = [];

/** Load static SEO HTML captured from the reference casinos page. */
export async function loadCasinosSeoHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "lib/casinos/casinos-seo.html",
  );
  try {
    const html = await readFile(filePath, "utf8");
    return html.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[casinos] loadCasinosSeoHtml: ${message}`);
    return "";
  }
}
