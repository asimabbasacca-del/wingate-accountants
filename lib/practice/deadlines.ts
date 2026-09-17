import { nowIso } from "@/lib/tax-returns/crypto";
import { store } from "@/lib/tax-returns/store";
import { practiceStore } from "./store";
import type { DeadlineStatus, HmrcDeadline } from "./types";

export const REMINDER_WINDOWS = [30, 14, 7, 1] as const;

export function daysUntil(dueAt: string): number {
  return Math.ceil((Date.parse(dueAt) - Date.now()) / 86400000);
}

export function deadlineStatus(dueAt: string, current: string): DeadlineStatus {
  if (current === "completed") return "completed";
  const days = daysUntil(dueAt);
  if (days < 0) return "overdue";
  if (days <= 14) return "due_soon";
  return "upcoming";
}

export function reminderWindow(days: number, already: number[]): number | null {
  if (days < 0 && !already.includes(0)) return 0;
  for (const window of REMINDER_WINDOWS) {
    if (days <= window && days >= 0 && !already.includes(window)) return window;
  }
  return null;
}

function kindLabel(kind: HmrcDeadline["kind"]): string {
  return kind.replaceAll("_", " ");
}

export async function sendDueReminders(): Promise<{ sent: number; ids: string[] }> {
  const snap = await practiceStore.snapshot();
  const ids: string[] = [];
  for (const row of snap.deadlines) {
    if (row.status === "completed") continue;
    const days = daysUntil(row.dueAt);
    const sentWindows = row.remindersSent ?? [];
    const window = reminderWindow(days, sentWindows);
    if (window == null) continue;
    const client = row.clientId ? await store.getUser(row.clientId) : null;
    const to = client?.email || "accountant@wingateaccountants.co.uk";
    const when = window === 0 ? "is overdue" : `is due in ${window} day${window === 1 ? "" : "s"}`;
    await store.addMail({
      to,
      subject: `HMRC ${kindLabel(row.kind)} ${when}`,
      body: `${row.clientName}: ${kindLabel(row.kind)} is due on ${row.dueAt.slice(0, 10)}. Open the portal to upload records or mark the filing complete.`,
      kind: "deadline_reminder",
      relatedUserId: row.clientId || undefined,
    });
    await practiceStore.saveDeadline({
      ...row,
      status: deadlineStatus(row.dueAt, row.status),
      lastReminderAt: nowIso(),
      remindersSent: [...sentWindows, window],
    });
    ids.push(row.id);
  }
  return { sent: ids.length, ids };
}
