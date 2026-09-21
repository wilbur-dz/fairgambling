import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  CasinoComplaintBreakdown,
  CasinoComplaintStats,
  CategoryComplaintBreakdown,
  ComplaintBucketCounts,
  ComplaintDetailCasino,
  ComplaintDetailRecord,
  ComplaintStatusEvent,
  ComplaintsGlobalStats,
  PublicComplaint,
  PublicComplaintDetail,
  PublicComplaintsList,
} from "@/lib/complaints/types";
import { casinoRouteSlug } from "@/lib/reviews/format";
import {
  DEFAULT_RESOLUTION_HOW_IT_WORKS,
  enrichResolutionStepsWithStats,
  normalizeResolutionWorkflowPayload,
  type ResolutionHowItWorksContent,
} from "@/lib/complaints/resolution-workflow";

/** Reference `COMPLAINT_FIELD_LIMITS` (486705). */
export const COMPLAINT_FIELD_LIMITS = {
  titleMin: 8,
  titleMax: 180,
  descriptionMin: 1,
  descriptionMax: 10_000,
} as const;

export type CreateComplaintDraftInput = {
  casinoId: number;
  category: string;
  title: string;
  description: string;
  disputedAmount?: string | number | null;
  disputedCurrency?: string | null;
  incidentDate?: string | null;
  privacyMode?: "public" | "private";
};

export class ComplaintDuplicateError extends Error {
  existingComplaintId: number;

  constructor(message: string, existingComplaintId: number) {
    super(message);
    this.name = "ComplaintDuplicateError";
    this.existingComplaintId = existingComplaintId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asOptionalNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = asNumber(value, Number.NaN);
  return Number.isFinite(n) ? n : null;
}

function asOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s || null;
}

function unwrapData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) return payload.data;
  return payload;
}

function normalizeComplaintRow(raw: unknown): PublicComplaint | null {
  if (!isRecord(raw)) return null;
  const id = raw.id;
  if (id == null || id === "") return null;
  return {
    id: String(id),
    casinoName: asOptionalString(raw.casinoName),
    casinoSlug: asOptionalString(raw.casinoSlug ?? raw.slug),
    casinoLogoUrl: asOptionalString(raw.casinoLogoUrl ?? raw.logoUrl),
    category: asOptionalString(raw.category),
    title: asOptionalString(raw.title),
    status: asOptionalString(raw.status),
    disputedAmount:
      (raw.disputedAmount as number | string | null | undefined) ??
      (raw.amount as number | string | null | undefined) ??
      null,
    disputedCurrency: asOptionalString(raw.disputedCurrency ?? raw.currency),
    submittedAt: asOptionalString(raw.submittedAt ?? raw.createdAt),
    updatedAt: asOptionalString(raw.updatedAt),
    casinoDeadlineAt: asOptionalString(raw.casinoDeadlineAt),
    userReplyDeadlineAt: asOptionalString(raw.userReplyDeadlineAt),
    receiptDeadlineAt: asOptionalString(raw.receiptDeadlineAt),
  };
}

function normalizeBucketCounts(raw: unknown): ComplaintBucketCounts | null {
  if (!isRecord(raw)) return null;
  return {
    all: asNumber(raw.all ?? raw.total),
    active: asNumber(raw.active ?? raw.open),
    unresolved: asNumber(raw.unresolved),
    resolved: asNumber(raw.resolved),
    dismissed: asNumber(raw.dismissed ?? raw.rejected),
  };
}

function normalizeComplaintsList(payload: unknown): PublicComplaintsList {
  const data = unwrapData(payload);
  let rowsRaw: unknown[] = [];
  let total = 0;

  if (Array.isArray(data)) {
    rowsRaw = data;
    total = data.length;
  } else if (isRecord(data)) {
    if (Array.isArray(data.rows)) rowsRaw = data.rows;
    else if (Array.isArray(data.complaints)) rowsRaw = data.complaints;
    else if (Array.isArray(data.data)) rowsRaw = data.data;
    total = asNumber(data.total ?? data.count, rowsRaw.length);
  }

  const rows = rowsRaw
    .map(normalizeComplaintRow)
    .filter((row): row is PublicComplaint => row != null);

  if (total <= 0) total = rows.length;

  let counts: ComplaintBucketCounts | null = null;
  if (isRecord(data) && data.counts) {
    counts = normalizeBucketCounts(data.counts);
  }

  return { rows, total, counts };
}

function normalizeComplaintDetailRecord(raw: unknown): ComplaintDetailRecord | null {
  const base = normalizeComplaintRow(raw);
  if (!base || !isRecord(raw)) return null;
  return {
    ...base,
    description: asOptionalString(raw.description ?? raw.body),
    caseSummary: asOptionalString(raw.caseSummary),
    displayHandle: asOptionalString(raw.displayHandle),
    verdict: asOptionalString(raw.verdict),
    verdictReasoning: asOptionalString(raw.verdictReasoning),
    verdictPublishedAt: asOptionalString(raw.verdictPublishedAt),
    privacyMode: asOptionalString(raw.privacyMode),
    incidentDate: asOptionalString(raw.incidentDate),
    settledAmount:
      (raw.settledAmount as number | string | null | undefined) ?? null,
    settledAt: asOptionalString(raw.settledAt),
    closedAt: asOptionalString(raw.closedAt),
  };
}

function normalizeStatusEvent(raw: unknown): ComplaintStatusEvent | null {
  if (!isRecord(raw)) return null;
  const id = asNumber(raw.id, Number.NaN);
  const toStatus = asOptionalString(raw.toStatus);
  const createdAt = asOptionalString(raw.createdAt);
  if (!Number.isFinite(id) || !toStatus || !createdAt) return null;
  return {
    id,
    fromStatus: asOptionalString(raw.fromStatus),
    toStatus,
    actorType: asOptionalString(raw.actorType) ?? "system",
    reason: asOptionalString(raw.reason),
    createdAt,
  };
}

function normalizePublicComplaintDetail(payload: unknown): PublicComplaintDetail | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const complaintRaw = isRecord(data.complaint) ? data.complaint : data;
  const complaint = normalizeComplaintDetailRecord(complaintRaw);
  if (!complaint) return null;

  let casino: ComplaintDetailCasino | null = null;
  if (isRecord(data.casino)) {
    const casinoId = asNumber(data.casino.id, Number.NaN);
    const slug = asOptionalString(data.casino.slug);
    const name = asOptionalString(data.casino.name);
    if (Number.isFinite(casinoId) && slug && name) {
      casino = {
        id: casinoId,
        slug,
        name,
        logoUrl: asOptionalString(data.casino.logoUrl),
      };
    }
  }

  const statusEvents = (Array.isArray(data.statusEvents) ? data.statusEvents : [])
    .map(normalizeStatusEvent)
    .filter((row): row is ComplaintStatusEvent => row != null);

  return {
    complaint,
    casino,
    messages: Array.isArray(data.messages) ? data.messages : [],
    statusEvents,
    evidence: Array.isArray(data.evidence) ? data.evidence : [],
    isOwner: Boolean(data.isOwner),
  };
}

function normalizeCasinoStats(payload: unknown): CasinoComplaintStats | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;

  const totalDisputes = asNumber(
    data.totalDisputes ?? data.total ?? data.complaintCount,
  );
  const resolved = asNumber(data.resolved);
  const open = asNumber(data.open ?? data.openComplaintCount);
  const fundsRecoveredUsd = asNumber(
    data.fundsRecoveredUsd ?? data.fundsRecovered,
  );
  const avgResponseHours = asOptionalNumber(
    data.avgResponseHours ?? data.avgResolutionHours,
  );

  if (
    totalDisputes <= 0 &&
    resolved <= 0 &&
    open <= 0 &&
    fundsRecoveredUsd <= 0
  ) {
    return null;
  }

  return {
    totalDisputes,
    resolved,
    open,
    avgResponseHours,
    fundsRecoveredUsd,
  };
}

export type ListPublicComplaintsParams = {
  page?: number;
  limit?: number;
  casinoId?: number | string;
  bucket?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

function buildListQuery(params: ListPublicComplaintsParams): URLSearchParams {
  const search = new URLSearchParams();
  search.set("page", String(Math.max(1, params.page ?? 1)));
  search.set("limit", String(Math.min(100, Math.max(1, params.limit ?? 7))));
  if (params.casinoId != null && params.casinoId !== "") {
    search.set("casinoId", String(params.casinoId));
  }
  if (params.bucket) search.set("bucket", params.bucket);
  if (params.category) search.set("category", params.category);
  if (params.search) search.set("search", params.search);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search;
}

function authHeaders(accessToken?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

/** Browser: same-origin `/api/*` (Next `rewrites` → remote API). Do not prepend API host. */
function resolveClientApiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? path : `/${path}`;
}

async function clientGetJson(path: string, accessToken?: string | null) {
  const response = await fetch(resolveClientApiPath(path), {
    method: "GET",
    headers: authHeaders(accessToken),
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }
  return (await response.json()) as unknown;
}

async function clientPostJson(
  path: string,
  body: unknown,
  accessToken?: string | null,
) {
  const response = await fetch(resolveClientApiPath(path), {
    method: "POST",
    headers: authHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new ApiError(message || response.statusText, response.status);
  }
  return (await response.json()) as unknown;
}

async function clientPatchJson(
  path: string,
  body: unknown,
  accessToken?: string | null,
) {
  const response = await fetch(resolveClientApiPath(path), {
    method: "PATCH",
    headers: authHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new ApiError(message || response.statusText, response.status);
  }
  return (await response.json()) as unknown;
}

/** Port of reference `getCasinoStats(slug)`. */
export async function getCasinoComplaintStats(
  slug: string,
): Promise<CasinoComplaintStats | null> {
  const safe = encodeURIComponent(casinoRouteSlug(slug));
  const paths = [
    `/api/complaints/casinos/${safe}/stats`,
    `/api/complaints/stats/casino/${safe}`,
    `/api/casinos/slug/${safe}/complaints/stats`,
  ];

  for (const path of paths) {
    try {
      const payload = await apiFetch<unknown>(path, {
        method: "GET",
        next: { revalidate: 60, tags: [`casino-complaint-stats-${safe}`] },
      });
      const stats = normalizeCasinoStats(payload);
      if (stats) return stats;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) continue;
    }
  }
  return null;
}

/** Port of reference `listPublicComplaints`. */
export async function listPublicComplaints(
  params: ListPublicComplaintsParams,
): Promise<PublicComplaintsList> {
  const query = buildListQuery(params);
  const paths = [
    `/api/complaints/public?${query}`,
    `/api/complaints?${query}`,
  ];

  for (const path of paths) {
    try {
      const payload = await apiFetch<unknown>(path, {
        method: "GET",
        next: { revalidate: 30 },
      });
      const list = normalizeComplaintsList(payload);
      return list;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) continue;
    }
  }

  return { rows: [], total: 0, counts: null };
}

/** Client-side list (ComplaintsTab + hub browser). */
export async function listPublicComplaintsClient(
  params: ListPublicComplaintsParams,
): Promise<PublicComplaintsList> {
  const query = buildListQuery(params);
  const urls = [
    `/api/complaints/public?${query}`,
    `/api/complaints?${query}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) continue;
      const payload = (await response.json()) as unknown;
      return normalizeComplaintsList(payload);
    } catch {
      // try next
    }
  }

  return { rows: [], total: 0, counts: null };
}

function normalizeCasinoBreakdownRow(raw: unknown) {
  if (!isRecord(raw)) return null;
  const casinoId = asNumber(raw.casinoId ?? raw.id, Number.NaN);
  const name = asOptionalString(raw.name ?? raw.casinoName);
  const slug = asOptionalString(raw.slug);
  if (!Number.isFinite(casinoId) || !name || !slug) return null;
  return {
    casinoId,
    name,
    slug,
    logoUrl: asOptionalString(raw.logoUrl),
    total: asNumber(raw.total),
    open: asNumber(raw.open),
    resolved: asNumber(raw.resolved),
    unresolved: asNumber(raw.unresolved),
    rejected: asOptionalNumber(raw.rejected),
  };
}

function normalizeCasinoBreakdown(payload: unknown): CasinoComplaintBreakdown {
  const data = unwrapData(payload);
  const rowsRaw = isRecord(data) && Array.isArray(data.rows) ? data.rows : [];
  const rows = rowsRaw
    .map(normalizeCasinoBreakdownRow)
    .filter(
      (row): row is NonNullable<ReturnType<typeof normalizeCasinoBreakdownRow>> =>
        row != null,
    );
  return { rows };
}

function normalizeCategoryBreakdown(
  payload: unknown,
): CategoryComplaintBreakdown {
  const data = unwrapData(payload);
  const rowsRaw = isRecord(data) && Array.isArray(data.rows) ? data.rows : [];
  const rows = rowsRaw
    .map((raw) => {
      if (!isRecord(raw)) return null;
      const category = asOptionalString(raw.category);
      if (!category) return null;
      return {
        category,
        total: asNumber(raw.total),
        open: asNumber(raw.open),
        resolved: asNumber(raw.resolved),
        unresolved: asNumber(raw.unresolved),
        rejected: asOptionalNumber(raw.rejected),
      };
    })
    .filter(
      (row): row is CategoryComplaintBreakdown["rows"][number] => row != null,
    );
  return { rows };
}

function normalizeGlobalComplaintStats(
  payload: unknown,
): ComplaintsGlobalStats | null {
  const data = unwrapData(payload);
  if (!isRecord(data)) return null;
  return {
    totalDisputes: asNumber(data.totalDisputes ?? data.total),
    resolved: asNumber(data.resolved),
    fundsRecoveredUsd: asNumber(data.fundsRecoveredUsd ?? data.fundsRecovered),
    avgResolutionHours: asOptionalNumber(
      data.avgResolutionHours ?? data.avgResponseHours,
    ),
  };
}

/** Port of reference `getCasinoBreakdown` (`GET /api/complaints/stats/casino-breakdown`). */
export async function getCasinoBreakdown(): Promise<CasinoComplaintBreakdown> {
  try {
    const payload = await clientGetJson("/api/complaints/stats/casino-breakdown");
    return normalizeCasinoBreakdown(payload);
  } catch {
    return { rows: [] };
  }
}

/** @deprecated Use `getCasinoBreakdown`. */
export const getCasinoBreakdownClient = getCasinoBreakdown;

/** Server/RSC: `${API_URL}` via `apiFetch`. */
export async function getCasinoBreakdownServer(): Promise<CasinoComplaintBreakdown> {
  try {
    const payload = await apiFetch<unknown>(
      "/api/complaints/stats/casino-breakdown",
      { method: "GET", next: { revalidate: 60 } },
    );
    return normalizeCasinoBreakdown(payload);
  } catch {
    return { rows: [] };
  }
}

/** Port of reference `getCategoryBreakdown`. */
export async function getCategoryBreakdown(
  casinoId?: number,
): Promise<CategoryComplaintBreakdown> {
  const query =
    casinoId != null
      ? `?casinoId=${encodeURIComponent(String(casinoId))}`
      : "";
  try {
    const payload = await clientGetJson(
      `/api/complaints/stats/category-breakdown${query}`,
    );
    return normalizeCategoryBreakdown(payload);
  } catch {
    return { rows: [] };
  }
}

/** @deprecated Use `getCategoryBreakdown`. */
export const getCategoryBreakdownClient = getCategoryBreakdown;

/** Server/RSC: `${API_URL}` via `apiFetch`. */
export async function getCategoryBreakdownServer(
  casinoId?: number,
): Promise<CategoryComplaintBreakdown> {
  const query =
    casinoId != null
      ? `?casinoId=${encodeURIComponent(String(casinoId))}`
      : "";
  try {
    const payload = await apiFetch<unknown>(
      `/api/complaints/stats/category-breakdown${query}`,
      { method: "GET", next: { revalidate: 60 } },
    );
    return normalizeCategoryBreakdown(payload);
  } catch {
    return { rows: [] };
  }
}

/** Port of reference `getGlobalStats` (complaints hub summary). */
export async function getComplaintsGlobalStatsClient(): Promise<ComplaintsGlobalStats | null> {
  try {
    const payload = await clientGetJson("/api/complaints/stats/global");
    return normalizeGlobalComplaintStats(payload);
  } catch {
    return null;
  }
}

export type MyComplaintsParams = {
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
};

/** Port of reference `getMyComplaints`. */
export async function getMyComplaintsClient(
  params: MyComplaintsParams,
  accessToken: string | null,
): Promise<PublicComplaintsList> {
  if (!accessToken) return { rows: [], total: 0 };

  const search = new URLSearchParams();
  search.set("page", String(Math.max(1, params.page ?? 1)));
  search.set("limit", String(Math.min(100, Math.max(1, params.limit ?? 20))));
  if (params.includeDrafts) search.set("includeDrafts", "true");

  try {
    const payload = await clientGetJson(
      `/api/complaints/mine?${search}`,
      accessToken,
    );
    return normalizeComplaintsList(payload);
  } catch {
    return { rows: [], total: 0 };
  }
}

/** Port of reference `withdrawComplaint`. */
export async function withdrawComplaintClient(
  complaintId: string,
  input: { reason: string; note?: string },
  accessToken: string | null,
): Promise<void> {
  if (!accessToken) {
    throw new Error("Sign in to withdraw a complaint.");
  }
  await clientPostJson(
    `/api/complaints/${encodeURIComponent(complaintId)}/withdraw`,
    input,
    accessToken,
  );
}

/** Loads resolution workflow copy + live queue stats for `ResolutionHowItWorks`. */
export async function getResolutionHowItWorksClient(): Promise<ResolutionHowItWorksContent> {
  const base = { ...DEFAULT_RESOLUTION_HOW_IT_WORKS, steps: [...DEFAULT_RESOLUTION_HOW_IT_WORKS.steps] };

  let remoteSteps: ReturnType<typeof normalizeResolutionWorkflowPayload> = [];
  for (const path of [
    "/api/complaints/resolution-workflow",
    "/api/complaints/workflow",
  ]) {
    try {
      const payload = await clientGetJson(`${path}`);
      remoteSteps = normalizeResolutionWorkflowPayload(payload);
      if (remoteSteps.length >= 3) break;
    } catch {
      // optional CMS endpoint — fall back to defaults
    }
  }

  const [globalStats, listPreview] = await Promise.all([
    getComplaintsGlobalStatsClient(),
    listPublicComplaintsClient({ page: 1, limit: 1 }),
  ]);

  const steps = enrichResolutionStepsWithStats(
    remoteSteps.length >= 3 ? remoteSteps : base.steps,
    listPreview.counts ?? null,
    globalStats,
  );

  return {
    ...base,
    steps,
  };
}

/** Client-side casino stats. */
export async function getCasinoComplaintStatsClient(
  slug: string,
): Promise<CasinoComplaintStats | null> {
  const safe = encodeURIComponent(casinoRouteSlug(slug));
  const urls = [
    `/api/complaints/casinos/${safe}/stats`,
    `/api/complaints/stats/casino/${safe}`,
    `/api/casinos/slug/${safe}/complaints/stats`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) continue;
      const payload = (await response.json()) as unknown;
      return normalizeCasinoStats(payload);
    } catch {
      // try next
    }
  }
  return null;
}

/** Public case file (`GET /api/complaints/:id/public`). */
export async function getPublicComplaint(
  id: string,
): Promise<PublicComplaintDetail | null> {
  if (!/^[0-9]+$/.test(id)) return null;
  const safe = encodeURIComponent(id);
  try {
    const payload = await apiFetch<unknown>(
      `/api/complaints/${safe}/public`,
      { method: "GET", next: { revalidate: 30 } },
    );
    return normalizePublicComplaintDetail(payload);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return null;
  }
}

export async function getPublicComplaintClient(
  id: string,
): Promise<PublicComplaintDetail | null> {
  if (!/^[0-9]+$/.test(id)) return null;
  try {
    const payload = await clientGetJson(
      `/api/complaints/${encodeURIComponent(id)}/public`,
    );
    return normalizePublicComplaintDetail(payload);
  } catch {
    return null;
  }
}

/** Owner draft / private view (`GET /api/complaints/:id`). */
export async function getComplaintClient(
  id: string,
  accessToken?: string | null,
): Promise<ComplaintDetailRecord | null> {
  if (!/^[0-9]+$/.test(id)) return null;
  try {
    const payload = await clientGetJson(
      `/api/complaints/${encodeURIComponent(id)}`,
      accessToken,
    );
    const data = unwrapData(payload);
    return normalizeComplaintDetailRecord(
      isRecord(data) && isRecord(data.complaint) ? data.complaint : data,
    );
  } catch {
    return null;
  }
}

export async function createComplaintDraftClient(
  input: CreateComplaintDraftInput,
  accessToken?: string | null,
): Promise<ComplaintDetailRecord> {
  const payload = await clientPostJson(
    `/api/complaints`,
    input,
    accessToken,
  );
  const data = unwrapData(payload);
  const row = normalizeComplaintDetailRecord(
    isRecord(data) && isRecord(data.complaint) ? data.complaint : data,
  );
  if (!row) throw new ApiError("Invalid complaint response", 500);
  return row;
}

export async function updateComplaintDraftClient(
  id: string,
  input: Partial<CreateComplaintDraftInput>,
  accessToken?: string | null,
): Promise<ComplaintDetailRecord> {
  if (!/^[0-9]+$/.test(id)) {
    throw new ApiError("Invalid complaint id", 400);
  }
  const payload = await clientPatchJson(
    `/api/complaints/${encodeURIComponent(id)}`,
    input,
    accessToken,
  );
  const data = unwrapData(payload);
  const row = normalizeComplaintDetailRecord(
    isRecord(data) && isRecord(data.complaint) ? data.complaint : data,
  );
  if (!row) throw new ApiError("Invalid complaint response", 500);
  return row;
}

export async function submitComplaintClient(
  id: string,
  accessToken?: string | null,
  body: Record<string, unknown> = {},
): Promise<ComplaintDetailRecord> {
  if (!/^[0-9]+$/.test(id)) {
    throw new ApiError("Invalid complaint id", 400);
  }
  const response = await fetch(
    `/api/complaints/${encodeURIComponent(id)}/submit`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (response.status === 409) {
    const json = (await response.json().catch(() => ({}))) as {
      code?: string;
      existingComplaintId?: number;
      error?: string;
    };
    if (
      json.code === "COMPLAINT_DUPLICATE" &&
      typeof json.existingComplaintId === "number"
    ) {
      throw new ComplaintDuplicateError(
        json.error || "Duplicate complaint detected",
        json.existingComplaintId,
      );
    }
  }
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new ApiError(message || response.statusText, response.status);
  }
  const payload = (await response.json()) as unknown;
  const data = unwrapData(payload);
  const row = normalizeComplaintDetailRecord(
    isRecord(data) && isRecord(data.complaint) ? data.complaint : data,
  );
  if (!row) throw new ApiError("Invalid complaint response", 500);
  return row;
}

export function buildComplaintStatsFallback(input: {
  complaintCount: number;
  openComplaintCount: number;
}): CasinoComplaintStats | null {
  if (input.complaintCount <= 0) return null;
  const resolved = Math.max(0, input.complaintCount - input.openComplaintCount);
  return {
    totalDisputes: input.complaintCount,
    resolved,
    open: input.openComplaintCount,
    avgResponseHours: null,
    fundsRecoveredUsd: 0,
  };
}
