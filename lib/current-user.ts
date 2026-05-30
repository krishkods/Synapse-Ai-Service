import User from "@/models/User";
import dbConnect from "@/lib/mongoose";
import { extractTokenFromRequest, verifyToken } from "@/lib/auth";

export async function getCurrentUserFromRequest(request: Request) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  await dbConnect();

  return User.findById(payload.userId).select(
    "name email plan createdAt"
  );
}

export async function requireCurrentUser(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return null;
  }

  return user;
}
