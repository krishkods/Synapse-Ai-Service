import { NextResponse } from "next/server";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

const AI_SERVICE_URL = process.env.SYNAPSE_AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: Request) {
  const body = await request.json();
  const token = extractTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const userId = body.user_id || payload?.userId;
  if (userId) {
    headers["X-User-ID"] = userId;
    body.user_id = userId;
  }

  const response = await fetch(`${AI_SERVICE_URL}/ai/query`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
