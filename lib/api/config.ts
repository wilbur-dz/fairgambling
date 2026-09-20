/** Resolve FairGambling API host (server prefers `API_URL`). */
export function getApiUrl(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "https://api.fairgambling.com";
  return raw.replace(/\/$/, "");
}

/** Browser-safe host (must be `NEXT_PUBLIC_*`). */
export function getPublicApiUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    "https://api.fairgambling.com";
  return raw.replace(/\/$/, "");
}
