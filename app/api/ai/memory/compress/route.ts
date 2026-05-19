import { NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

const AI_SERVICE_URL = process.env.SYNAPSE_AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  const body = await request.json();
  const { user_id } = body as { user_id?: string };
  const url = new URL(request.url);
  const queryUserId = url.searchParams.get("user_id");
  const token = extractTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  const effectiveUserId = user_id || queryUserId || payload?.userId;

  if (!effectiveUserId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (payload?.userId) {
    headers["X-User-ID"] = payload.userId;
  }

  const response = await fetch(`${AI_SERVICE_URL}/ai/compress?user_id=${encodeURIComponent(effectiveUserId)}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: effectiveUserId }),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
