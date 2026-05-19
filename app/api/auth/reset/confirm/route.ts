import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request: Request) {
  const { token, newPassword } = (await request.json()) as { token?: string; newPassword?: string };
  if (!token || !newPassword) return NextResponse.json({ error: "Token and newPassword are required" }, { status: 400 });
  if (newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  await dbConnect();
  const user = await User.findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
  if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  user.resetExpires = null;
  await user.save();

  return NextResponse.json({ ok: true });
}
