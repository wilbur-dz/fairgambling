import type { StreamerNewsArticle } from "@/lib/streamers/types";

function probeImageSize(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const timer = setTimeout(() => {
      img.src = "";
      resolve(null);
    }, 4000);
    img.onload = () => {
      clearTimeout(timer);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

function isWideCover(
  size: { width: number; height: number } | null,
): size is { width: number; height: number } {
  if (!size) return false;
  return (
    size.width >= 1280 &&
    size.height > 0 &&
    size.width / size.height >= 1.6
  );
}

/** Prefer wide cover images for the overview hero carousel. */
export async function pickWideCoverArticles(
  articles: StreamerNewsArticle[],
  limit = 4,
  probe: (url: string) => Promise<{ width: number; height: number } | null> =
    probeImageSize,
): Promise<StreamerNewsArticle[]> {
  const slice = articles.slice(0, 12);
  const sizes = await Promise.all(
    slice.map(async (row) =>
      row.coverImageUrl ? probe(row.coverImageUrl) : null,
    ),
  );
  const wide = slice.filter((row, index) => isWideCover(sizes[index]));
  const pool = wide.length > 0 ? wide : slice;
  return pool.slice(0, limit);
}
