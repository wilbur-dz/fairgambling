import { apiFetch } from "@/lib/api/client";

export type StreamerHistoryDay = {
  day: string;
  peak_viewers: number;
  avg_viewers: number;
  hours_watched: number;
  air_time_h: number;
  followers: number;
};

export type StreamerWeeklyRow = {
  week: string;
  avg_viewers: number;
  peak_viewers: number;
  hours_watched: number;
  followers: number;
};

export type StreamerStreamRow = {
  started_at: string;
  title: string;
  hours_watched: number;
  peak_viewers: number;
  avg_viewers: number;
  airtime_m: number;
  followers_gain: number;
  thumb_url?: string | null;
  vod_url?: string | null;
};

type Envelope<T> = { data?: T };

function slugify(username: string): string {
  return username.trim().toLowerCase();
}

export async function fetchStreamerHistory(
  username: string,
): Promise<StreamerHistoryDay[]> {
  const slug = slugify(username);
  const payload = await apiFetch<Envelope<StreamerHistoryDay[]>>(
    `/api/streamers/${encodeURIComponent(slug)}/history`,
    { next: { revalidate: 120 } },
  );
  return payload.data ?? [];
}

export async function fetchStreamerWeekly(
  username: string,
): Promise<StreamerWeeklyRow[]> {
  const slug = slugify(username);
  const payload = await apiFetch<Envelope<StreamerWeeklyRow[]>>(
    `/api/streamers/${encodeURIComponent(slug)}/weekly`,
    { next: { revalidate: 120 } },
  );
  return payload.data ?? [];
}

export async function fetchStreamerStreams(
  username: string,
): Promise<StreamerStreamRow[]> {
  const slug = slugify(username);
  const payload = await apiFetch<Envelope<StreamerStreamRow[]>>(
    `/api/streamers/${encodeURIComponent(slug)}/streams`,
    { next: { revalidate: 120 } },
  );
  return payload.data ?? [];
}

export type StreamerProfilePayload = {
  history: StreamerHistoryDay[];
  weekly: StreamerWeeklyRow[];
  streams: StreamerStreamRow[];
};

export async function loadStreamerProfileData(
  username: string,
): Promise<StreamerProfilePayload> {
  const [history, weekly, streams] = await Promise.all([
    fetchStreamerHistory(username),
    fetchStreamerWeekly(username),
    fetchStreamerStreams(username),
  ]);
  return { history, weekly, streams };
}
