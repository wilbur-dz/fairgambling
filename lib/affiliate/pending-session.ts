"use client";

import type { PendingVerification } from "@/lib/affiliate/data";

const PREFIX = "fg-pending-verification-";
const DEFAULT_TTL_MS = 15 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read a non-expired pending casino verification session. */
export function getPendingSession(
  casinoSlug: string,
): PendingVerification | null {
  const slug = casinoSlug.trim();
  if (!slug || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const expiresAt =
      typeof parsed.expiresAt === "number" ? parsed.expiresAt : 0;
    if (!expiresAt || Date.now() >= expiresAt) {
      localStorage.removeItem(`${PREFIX}${slug}`);
      return null;
    }
    const username =
      typeof parsed.username === "string" ? parsed.username : "";
    if (!username) return null;
    return {
      casinoSlug: slug,
      username,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function setPendingSession(
  casinoSlug: string,
  username: string,
  ttlMs = DEFAULT_TTL_MS,
): PendingVerification {
  const slug = casinoSlug.trim();
  const name = username.trim();
  if (!slug || !name) {
    throw new Error("Casino slug and username are required");
  }
  const session: PendingVerification = {
    casinoSlug: slug,
    username: name,
    expiresAt: Date.now() + Math.max(60_000, ttlMs),
  };
  try {
    localStorage.setItem(`${PREFIX}${slug}`, JSON.stringify(session));
  } catch {
    // ignore
  }
  return session;
}

export function clearPendingSession(casinoSlug: string) {
  const slug = casinoSlug.trim();
  if (!slug || typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${PREFIX}${slug}`);
  } catch {
    // ignore
  }
}
