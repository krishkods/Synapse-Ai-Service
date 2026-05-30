import { NextResponse } from "next/server";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";
import { normalizePlanName } from "@/lib/plan-config";

export async function GET(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(payload.userId).select("name email plan createdAt");
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 404 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: normalizePlanName(user.plan),
      createdAt: user.createdAt,
    },
  });
}
