import { NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getAuthedUser(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await dbConnect();
  return User.findById(payload.userId);
}

export async function GET(request: Request) {
  const user = await getAuthedUser(request);
  if (!user) return unauthorized();

  return NextResponse.json({
    savedQueries: (user.savedQueries || []).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  });
}

export async function POST(request: Request) {
  const user = await getAuthedUser(request);
  if (!user) return unauthorized();

  const body = (await request.json()) as {
    name?: string;
    query?: string;
    category?: string | null;
    tags?: string[];
    topK?: number;
  };

  const name = body.name?.trim();
  const query = body.query?.trim();

  if (!name || !query) {
    return NextResponse.json(
      { error: "Name and query are required." },
      { status: 400 }
    );
  }

  const tags = (body.tags || [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
  const topK = Math.max(1, Math.min(20, body.topK ?? 10));

  const savedQuery = {
    id: crypto.randomUUID(),
    name,
    query,
    category: body.category?.trim() || null,
    tags,
    topK,
  };

  user.savedQueries = [...(user.savedQueries || []), savedQuery];
  await user.save();

  return NextResponse.json({ success: true, savedQuery });
}

export async function DELETE(request: Request) {
  const user = await getAuthedUser(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Saved query id is required." }, { status: 400 });
  }

  const originalCount = (user.savedQueries || []).length;
  user.savedQueries = (user.savedQueries || []).filter((item) => item.id !== id);

  if (user.savedQueries.length === originalCount) {
    return NextResponse.json({ error: "Saved query not found." }, { status: 404 });
  }

  await user.save();

  return NextResponse.json({ success: true, deleted: true, id });
}
