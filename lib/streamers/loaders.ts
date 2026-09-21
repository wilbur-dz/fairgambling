import { apiFetch, handleResponse } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/config";
import type {
  StreamerDbProfile,
  StreamerLiveNow,
  StreamerLiveStat,
} from "@/lib/streamers/types";

const REVALIDATE_SECONDS = 120;

type StreamerProfilesEnvelope = {
  status?: string;
  data?: {
    streamers?: StreamerDbProfile[];
    casinoLogos?: Record<string, string>;
  };
};

type LiveStreamRow = {
  slug: string;
  viewers?: number;
  uptime_min?: number;
  thumb_url?: string | null;
  title?: string | null;
};

type LiveStreamsEnvelope = {
  data?: LiveStreamRow[];
};

function profileToLiveStat(profile: StreamerDbProfile): StreamerLiveStat {
  const slug = profile.username.trim().toLowerCase();
  const hours = profile.hoursWatched30d ?? 0;
  const avg = profile.avgViewers30d ?? 0;
  const airtime = avg > 0 ? hours / avg : undefined;
  return {
    slug,
    platform: "kick",
    main_casino: profile.currentCasino ?? undefined,
    all_casinos: profile.currentCasino ?? undefined,
    avg_viewers_30d: profile.avgViewers30d ?? undefined,
    peak_viewers_30d: profile.peakViewers30d ?? undefined,
    hours_watched_30d: profile.hoursWatched30d ?? undefined,
    active_days_30d: profile.activeDays30d ?? undefined,
    last_streamed: profile.lastStreamed ?? undefined,
    followers: profile.followers ?? undefined,
    pfp_url: profile.imageUrl ?? null,
    peak_all_time: profile.peakAllTime ?? undefined,
    airtime_h_30d: airtime,
  };
}

export async function fetchStreamerProfilesBundle(): Promise<{
  profiles: StreamerDbProfile[];
  casinoLogos: Record<string, string>;
}> {
  const payload = await apiFetch<StreamerProfilesEnvelope>(
    "/api/streamer-profiles",
    { next: { revalidate: REVALIDATE_SECONDS } },
  );
  return {
    profiles: payload.data?.streamers ?? [],
    casinoLogos: payload.data?.casinoLogos ?? {},
  };
}

export async function fetchLiveNow(): Promise<Record<string, StreamerLiveNow>> {
  const payload = await apiFetch<LiveStreamsEnvelope>("/api/streamers/live", {
    next: { revalidate: 30 },
  });
  const map: Record<string, StreamerLiveNow> = {};
  for (const row of payload.data ?? []) {
    if (!row.slug) continue;
    map[row.slug.toLowerCase()] = {
      viewers: row.viewers,
      uptime_min: row.uptime_min,
      thumb_url: row.thumb_url,
      title: row.title,
    };
  }
  return map;
}

/** Kick 30d stats map keyed by slug — derived from profile rows when no public stats route exists. */
export async function fetchLiveStats(): Promise<
  Record<string, StreamerLiveStat>
> {
  const { profiles } = await fetchStreamerProfilesBundle();
  const map: Record<string, StreamerLiveStat> = {};
  for (const profile of profiles) {
    const stat = profileToLiveStat(profile);
    map[stat.slug] = stat;
  }
  return map;
}

export type StreamersPagePayload = {
  liveStats: Record<string, StreamerLiveStat>;
  liveNow: Record<string, StreamerLiveNow>;
  profiles: StreamerDbProfile[];
  casinoLogos: Record<string, string>;
};

export async function loadStreamersPageData(): Promise<StreamersPagePayload> {
  const [profilesBundle, liveNow] = await Promise.all([
    fetchStreamerProfilesBundle(),
    fetchLiveNow(),
  ]);

  const liveStats: Record<string, StreamerLiveStat> = {};
  for (const profile of profilesBundle.profiles) {
    const stat = profileToLiveStat(profile);
    liveStats[stat.slug] = stat;
  }

  return {
    liveStats,
    liveNow,
    profiles: profilesBundle.profiles,
    casinoLogos: profilesBundle.casinoLogos,
  };
}

/** Proxy helper for route handlers that forward to the upstream API host. */
export async function proxyToApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${getApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export { handleResponse };
