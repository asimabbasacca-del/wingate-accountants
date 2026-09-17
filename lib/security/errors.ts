import { isProduction } from "./config";
import { securityLog } from "./log";

export function publicError(err: unknown): { message: string; status: number } {
  const known = typeof err === "object" && err !== null && "status" in err;
  const status = known ? Number((err as { status: number }).status) || 400 : 500;
  if (!known) {
    securityLog("unhandled_error", { message: err instanceof Error ? err.message : "unknown" });
    return { message: isProduction() ? "Request failed" : err instanceof Error ? err.message : "Request failed", status: 500 };
  }
  const message = err instanceof Error ? err.message : "Request failed";
  return { message, status };
}
