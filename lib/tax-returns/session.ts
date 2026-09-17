import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { store } from "./store";
import type { PublicUser, User } from "./types";
import { sessionSecret } from "@/lib/security/config";

const COOKIE = "wingate_tax_returns";
const LONG_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const SHORT_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const value = sessionSecret();
  if (!value) throw new Error("WINGATE_TAX_SESSION_SECRET must be at least 32 characters in production");
  return value;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession(userId: string, rememberMe = false): Promise<void> {
  const ttl = rememberMe ? LONG_TTL_MS : SHORT_TTL_MS;
  const exp = Date.now() + ttl;
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(exp),
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readSessionUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    if (!sessionSecret()) return null;
  } catch {
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expRaw, mac] = parts;
  if (!/^[a-z0-9_-]+$/i.test(userId) || !/^\d+$/.test(expRaw)) return null;
  const payload = `${userId}.${expRaw}`;
  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(expRaw)) return null;
  return store.getUser(userId);
}

export function publicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, twoFactorSecret: _twoFactorSecret, ...rest } = user;
  return rest;
}
