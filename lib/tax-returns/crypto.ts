import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

const DUMMY_HASH = "00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000";

export function verifyPasswordDummy(password: string): void {
  verifyPassword(password, DUMMY_HASH);
}

export function passwordMeetsPolicy(password: string): boolean {
  return password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function ninoLooksValid(value: string): boolean {
  return /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/i.test(value.replace(/\s+/g, ""));
}

export function gbp(value: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function monthsAgo(isoDate: string, months: number): boolean {
  const dated = new Date(isoDate);
  if (Number.isNaN(dated.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return dated >= cutoff;
}

export function randomToken(): string {
  return randomBytes(24).toString("hex");
}

export function sixDigitCode(): string {
  return String(100000 + (randomBytes(4).readUInt32BE(0) % 900000));
}
