import type { InvoiceView, OrderBundle, OutstandingTask, PublicUser } from "@/lib/tax-returns/types";
import type { Plan } from "@/lib/tax-returns/plans";
import type { TimelineStep } from "@/lib/tax-returns/intelligence";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const [pathname, query] = path.split("?");
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const url = `/api/tax-returns/${clean}/${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (response.headers.get("content-type")?.includes("application/pdf") || response.headers.get("content-disposition")) {
    throw new Error("Unexpected binary response");
  }
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new ApiError(data.error || "Request failed", response.status);
  return data;
}

export type DashboardPayload = {
  title: string;
  currentService: string;
  currentTaxYear: string;
  nextTaxYear: string;
  status: string;
  outstandingTasks: OutstandingTask[];
  unreadMessages: number;
  uploadedDocuments: number;
  invoices: InvoiceView[];
  timeline: TimelineStep[];
  missingDocuments: string[];
  amlStatus: string;
  renewalNote: string;
};

export type StatePayload = {
  user: PublicUser | null;
  bundle: OrderBundle | null;
  plans: Plan[];
  orders?: unknown;
  dashboard?: DashboardPayload;
};
