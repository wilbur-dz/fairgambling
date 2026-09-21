import { getApiUrl } from "@/lib/api/config";

/** Port of reference `voteOnReview` (client). */
export async function voteOnReview(
  reviewId: string,
  vote: 0 | 1 | -1,
  accessToken: string | null,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(
    `${getApiUrl()}/api/reviews/${encodeURIComponent(reviewId)}/vote`,
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ vote }),
    },
  );
  if (!response.ok) {
    throw new Error(`vote failed (${response.status})`);
  }
}
