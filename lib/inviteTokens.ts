import crypto from "crypto";

const SECRET = process.env.INVITE_TOKEN_SECRET || process.env.SESSION_SECRET || "fallback-invite-secret";

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashInviteToken(token: string): string {
  return crypto.createHash("sha256").update(token + SECRET).digest("hex");
}

