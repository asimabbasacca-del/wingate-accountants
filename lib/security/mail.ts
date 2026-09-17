import type { MailLog, UserRole } from "@/lib/tax-returns/types";

const SENSITIVE_KINDS = new Set(["email_verify", "password_reset", "two_factor", "security"]);

export function redactMail(items: MailLog[], viewerId: string, role: UserRole): MailLog[] {
  return items.map((item) => {
    if (!SENSITIVE_KINDS.has(item.kind)) return item;
    if (item.relatedUserId && item.relatedUserId === viewerId) return item;
    if (role === "client") return item;
    return {
      ...item,
      body: "[redacted — verification, reset and security mail is only shown to the account holder]",
    };
  });
}
