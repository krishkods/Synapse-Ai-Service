import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

export async function PATCH(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const { name, password } = data as { name?: string; password?: string };

  await dbConnect();

  const user = await User.findById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Validations
  if (name) {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters." }, { status: 400 });
    }
    user.name = trimmed;
  }

  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
  }

  await user.save();

  return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
}
