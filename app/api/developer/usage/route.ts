import { NextResponse } from "next/server";

import ApiKey from "@/models/ApiKey";
import { requireCurrentUser } from "@/lib/current-user";
import { getDeveloperUsage } from "@/lib/developer-access";
import dbConnect from "@/lib/mongoose";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const user = await requireCurrentUser(request);
  if (!user) {
    return unauthorized();
  }

  await dbConnect();

  const [{ plan, usage, projectCount }, activeKeys] = await Promise.all([
    getDeveloperUsage(user._id.toString(), user.plan),
    ApiKey.countDocuments({
      userId: user._id,
      isActive: true,
      revokedAt: null,
    }),
  ]);

  return NextResponse.json({
    plan,
    usage,
    projectCount,
    activeKeys,
  });
}
