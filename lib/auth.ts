import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "synapse_secret_example";
const JWT_EXPIRES_IN = "7d";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  name: string;
};

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|; )synapse_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
