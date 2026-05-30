import crypto from "crypto";

const API_KEY_PREFIX = "synp";

export function generateApiKey() {
  const publicPart = crypto.randomBytes(6).toString("hex");
  const secretPart = crypto.randomBytes(24).toString("hex");
  const rawKey = `${API_KEY_PREFIX}_${publicPart}_${secretPart}`;

  return {
    rawKey,
    prefix: `${API_KEY_PREFIX}_${publicPart}`,
    lastFour: rawKey.slice(-4),
    keyHash: hashApiKey(rawKey),
  };
}

export function hashApiKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function extractApiKey(request: Request) {
  const direct = request.headers.get("x-api-key")?.trim();
  if (direct) {
    return direct;
  }

  const authHeader = request.headers.get("authorization")?.trim();
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith(`${API_KEY_PREFIX}_`)) {
      return token;
    }
  }

  return null;
}
