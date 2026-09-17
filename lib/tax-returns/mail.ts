import { createHmac } from "node:crypto";
import { randomUUID } from "node:crypto";
import { nowIso } from "./crypto";
import { FIRM_ID } from "./types";
import type { MailLog } from "./types";

import { sessionSecret } from "@/lib/security/config";

function secret(): string {
  const value = sessionSecret();
  if (!value) throw new Error("WINGATE_TAX_SESSION_SECRET must be at least 32 characters in production");
  return value;
}

export function hashSecret(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function appOrigin(): string {
  return process.env.WINGATE_TAX_APP_URL || "http://127.0.0.1:43191";
}

export function buildMail(input: Omit<MailLog, "id" | "firmId" | "createdAt">): MailLog {
  return {
    id: `mail_${randomUUID()}`,
    firmId: FIRM_ID,
    createdAt: nowIso(),
    ...input,
  };
}

export const MAIL_COPY = {
  verifySubject: "Verify your Wingate tax portal email",
  resetSubject: "Reset your Wingate tax portal password",
  twoFactorSubject: "Your Wingate sign-in code",
  reminderSubject: "A step is waiting on your Wingate tax return",
  renewalSubject: "Start next year’s Self Assessment with Wingate",
};
