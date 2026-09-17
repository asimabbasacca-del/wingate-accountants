import { NextRequest, NextResponse } from "next/server";
import { clientIp, contentSecurityPolicy, isProduction, SECURITY_HEADERS } from "@/lib/security/config";
import { rateLimit } from "@/lib/security/rate-limit";
import { securityLog } from "@/lib/security/log";

function withHeaders(response: NextResponse, https: boolean): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(https));
  if (https || isProduction()) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
}

const AUTH_PATHS = [
  "/api/tax-returns/auth/login",
  "/api/tax-returns/auth/register",
  "/api/tax-returns/auth/forgot",
  "/api/tax-returns/auth/reset",
  "/api/tax-returns/auth/resend-verification",
  "/api/practice/lead",
  "/api/practice/checkout",
  "/api/practice/checkout/abandon",
  "/api/package-selection",
];

export function middleware(request: NextRequest) {
  const https = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const host = request.headers.get("host") || "";
  const local = host.startsWith("127.0.0.1") || host.startsWith("localhost");
  if (isProduction() && !https && !local) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return withHeaders(NextResponse.redirect(url, 308), true);
  }

  const len = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(len) && len > 12 * 1024 * 1024) {
    return withHeaders(NextResponse.json({ error: "Request too large" }, { status: 413 }), https);
  }

  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const ip = clientIp(request);

  if (request.method === "POST" && path === "/api/stripe/webhook") {
    const limited = rateLimit(`mw:webhook:${ip}`, 120, 60 * 1000);
    if (!limited.ok) {
      securityLog("rate_limited", { name: "webhook", ip });
      const denied = NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
      denied.headers.set("Retry-After", String(limited.retryAfterSec));
      return withHeaders(denied, https);
    }
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    const sensitive = AUTH_PATHS.some((item) => path === item || path.startsWith(`${item}/`));
    if (sensitive) {
      const limited = rateLimit(`mw:${path}:${ip}`, 20, 15 * 60 * 1000);
      if (!limited.ok) {
        securityLog("rate_limited", { name: path, ip });
        const denied = NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
        denied.headers.set("Retry-After", String(limited.retryAfterSec));
        return withHeaders(denied, https);
      }
    }
  }
  return withHeaders(NextResponse.next(), https);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
