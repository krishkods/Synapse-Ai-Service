import { NextResponse } from "next/server";
import crypto from "crypto";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  await dbConnect();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return NextResponse.json({ ok: true }); // don't reveal user existence

  // create reset token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // In production, email the token. For now, return it for dev/testing.
  return NextResponse.json({ ok: true, resetToken: token });
}
