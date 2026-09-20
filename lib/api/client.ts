import { getApiUrl } from "@/lib/api/config";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchInit = RequestInit & {
  /** Next.js fetch cache hint (server only). */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Override base URL (defaults to `getApiUrl()`). */
  baseUrl?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Parse FairGambling API envelopes.
 * Most routes return `{ status, data }`; some analytics routes return bare JSON.
 */
export async function handleResponse<T = unknown>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(
        `Invalid JSON from API (${response.status})`,
        response.status,
        text.slice(0, 200),
      );
    }
  }

  if (!response.ok) {
    const message =
      (isRecord(parsed) && typeof parsed.message === "string"
        ? parsed.message
        : null) ||
      (isRecord(parsed) && typeof parsed.error === "string"
        ? parsed.error
        : null) ||
      `API request failed (${response.status})`;
    throw new ApiError(message, response.status, parsed);
  }

  return parsed as T;
}

/** Low-level GET/POST against `${API_URL}${path}`. */
export async function apiFetch<T = unknown>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error(`apiFetch path must start with "/": ${path}`);
  }

  const { baseUrl, next, headers, ...rest } = init;
  const url = `${baseUrl ?? getApiUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
      ...(next ? { next } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(message, 0);
  }

  return handleResponse<T>(response);
}
