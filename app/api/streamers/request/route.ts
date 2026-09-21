import { NextResponse } from "next/server";
import { handleResponse } from "@/lib/api/client";
import { proxyToApi } from "@/lib/streamers/loaders";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { name?: unknown }).name !== "string" ||
    !(body as { name: string }).name.trim()
  ) {
    return NextResponse.json({ error: "Missing streamer name" }, { status: 400 });
  }

  try {
    const upstream = await proxyToApi("/api/streamers/request", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const payload = await handleResponse(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upstream error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
