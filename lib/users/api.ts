import { handleResponse } from "@/lib/api/client";
import type { UserProfile } from "@/lib/users/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

/** Normalize API / envelope → `UserProfile`. */
export function normalizeUserProfile(payload: unknown): UserProfile | null {
  const raw =
    isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  if (!isRecord(raw)) return null;

  const username = asString(raw.username);
  if (!username) return null;

  const connectedCasinos = Array.isArray(raw.connectedCasinos)
    ? raw.connectedCasinos
        .map((row) => {
          if (!isRecord(row)) return null;
          const slug = asString(row.slug);
          const name = asString(row.name, slug);
          if (!slug && !name) return null;
          return {
            slug: slug || name.toLowerCase(),
            name,
            username: asString(row.username),
            totalWagered: asString(row.totalWagered, "0"),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row != null)
    : [];

  return {
    username,
    memberSince: asString(raw.memberSince),
    totalReviews: asNumberOrNull(raw.totalReviews) ?? 0,
    totalWager: asNumberOrNull(raw.totalWager),
    totalClaimed: asNumberOrNull(raw.totalClaimed),
    ghostMode: asBoolean(raw.ghostMode),
    profilePictureUrl:
      raw.profilePictureUrl == null
        ? null
        : asString(raw.profilePictureUrl) || null,
    deactivated: asBoolean(raw.deactivated),
    connectedCasinos,
  };
}

/**
 * `GET /api/users/by-username/:username` (via Next rewrite).
 * Browser call with credentials for consistent session cookies.
 */
export async function fetchUserByUsername(
  username: string,
): Promise<UserProfile> {
  const trimmed = username.trim();
  if (!trimmed) throw new Error("Username required");

  const response = await fetch(
    `/api/users/by-username/${encodeURIComponent(trimmed)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await handleResponse<unknown>(response);
  const profile = normalizeUserProfile(payload);
  if (!profile) throw new Error("Invalid user profile payload");
  return profile;
}
