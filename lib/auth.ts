import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  name: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const message = "Missing required JWT_SECRET environment variable.";
    console.error(message);
    throw new Error(message);
  }

  return secret;
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch {
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
