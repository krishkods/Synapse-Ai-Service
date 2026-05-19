import { NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

const AI_SERVICE_URL = process.env.SYNAPSE_AI_SERVICE_URL || "http://localhost:8000";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  const token = extractTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  const headers: Record<string, string> = {};
  if (payload?.userId) {
    headers["X-User-ID"] = payload.userId;
  }

  const targetUrl = `${AI_SERVICE_URL}/ai/clusters/${encodeURIComponent(userId)}`;
  const response = await fetch(targetUrl, { headers });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
