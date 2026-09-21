import type {
  LeaderboardCasinoWager,
  LeaderboardEntry,
  LeaderboardPayload,
} from "@/lib/leaderboard/data";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  const s = asString(value).trim();
  return s || null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  return fallback;
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

function normalizeCasinoWagers(
  raw: unknown,
): LeaderboardCasinoWager[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const rows = raw
    .map((row) => {
      if (!isRecord(row)) return null;
      const casino = asString(row.casino);
      if (!casino) return null;
      return { casino, wager: asNumber(row.wager) };
    })
    .filter((row): row is LeaderboardCasinoWager => row != null);
  return rows.length > 0 ? rows : undefined;
}

/** Map one API entry → UI entry. */
export function normalizeLeaderboardEntry(
  raw: unknown,
  index = 0,
): LeaderboardEntry | null {
  if (!isRecord(raw)) return null;

  const username = asString(raw.username, `player-${index + 1}`);
  const rank = asNumber(raw.rank, index + 1);
  const casinoWagers = normalizeCasinoWagers(raw.casinoWagers);

  return {
    rank,
    userId: asString(raw.userId, username),
    username,
    avatarUrl: asOptionalString(raw.avatarUrl),
    deactivated: asBoolean(raw.deactivated),
    wager: asNumber(raw.wager),
    casinos: Array.isArray(raw.casinos)
      ? raw.casinos.map((c) => asString(c)).filter(Boolean)
      : [],
    prize: asOptionalString(raw.prize),
    casinoWagers,
  };
}

function normalizeLeaderboardData(
  payload: unknown,
): LeaderboardPayload | null {
  const data = unwrapData(payload);
  if (!isRecord(data) || !Array.isArray(data.entries)) return null;

  const entries = data.entries
    .map((raw, index) => normalizeLeaderboardEntry(raw, index))
    .filter((e): e is LeaderboardEntry => e != null);

  const currentUser =
    data.currentUser == null
      ? null
      : normalizeLeaderboardEntry(data.currentUser);

  return {
    entries,
    currentUser,
    periodLabel: asOptionalString(data.periodLabel) ?? undefined,
    periodStartedAt: asOptionalString(data.periodStartedAt) ?? undefined,
    periodEndsAt: asOptionalString(data.periodEndsAt) ?? undefined,
    prizePoolUsd:
      data.prizePoolUsd == null ? undefined : asNumber(data.prizePoolUsd),
  };
}

/**
 * Map `GET /api/leaderboard/current` envelope:
 * `{ status, data: { currentUser, entries } }`
 */
export function normalizeCurrentLeaderboard(
  payload: unknown,
): LeaderboardPayload | null {
  return normalizeLeaderboardData(payload);
}

/**
 * Map `GET /api/leaderboard/past?limit=` envelope
 * (includes `periodLabel`, `periodStartedAt`, `periodEndsAt`, `prizePoolUsd`).
 */
export function normalizePastLeaderboard(
  payload: unknown,
): LeaderboardPayload | null {
  return normalizeLeaderboardData(payload);
}
