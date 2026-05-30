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

  // Store only a digest so a database leak does not expose usable reset tokens.
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.resetToken = tokenHash;
  user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Never return reset tokens in the API response.
  // The next production step is to deliver `token` through a mail provider.
  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, password reset instructions will be sent.",
  });
}
