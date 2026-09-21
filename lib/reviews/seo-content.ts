import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SeoPostItem } from "@/components/seo/seo-details";

/** Matches live `/reviews` SeoProseDetails heading. */
export const REVIEWS_SEO_HEADING = "FairGambling Reviews";

/**
 * Optional related posts for `SeoPostsDetails` (not on live `/reviews`
 * currently; supported when CMS provides items).
 */
export const REVIEWS_SEO_POSTS: SeoPostItem[] = [];

/** Load static SEO HTML captured from the reference reviews page. */
export async function loadReviewsSeoHtml(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "lib/reviews/reviews-seo.html",
  );
  try {
    const html = await readFile(filePath, "utf8");
    return html.trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[reviews] loadReviewsSeoHtml: ${message}`);
    return "";
  }
}
