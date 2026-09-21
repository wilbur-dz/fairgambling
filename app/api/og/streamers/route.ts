import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api/config";

/** Proxy OG snapshot images for the streamers share modal. */
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const path = `/api/og/streamers${search ? `?${search}` : ""}`;
  const upstream = await fetch(`${getApiUrl()}${path}`, {
    headers: { Accept: "image/*,application/json" },
    cache: "no-store",
  });

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}
