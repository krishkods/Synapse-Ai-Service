import { NextResponse } from "next/server";

import ApiKey from "@/models/ApiKey";
import { requireCurrentUser } from "@/lib/current-user";
import dbConnect from "@/lib/mongoose";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ keyId: string }> }
) {
  const user = await requireCurrentUser(request);
  if (!user) {
    return unauthorized();
  }

  const { keyId } = await context.params;

  await dbConnect();

  const apiKey = await ApiKey.findOne({
    _id: keyId,
    userId: user._id,
  });

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  apiKey.isActive = false;
  apiKey.revokedAt = new Date();
  await apiKey.save();

  return NextResponse.json({
    success: true,
    revoked: true,
    keyId,
  });
}
