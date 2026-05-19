import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.SYNAPSE_AI_SERVICE_URL || "http://localhost:8000";

export async function GET() {
  const response = await fetch(`${AI_SERVICE_URL}/health`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
