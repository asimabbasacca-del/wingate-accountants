export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function mailPreviewEnabled(): boolean {
  if (process.env.WINGATE_MAIL_PREVIEW === "1") return true;
  if (process.env.WINGATE_MAIL_PREVIEW === "0") return false;
  return !isProduction();
}

export function sessionSecret(): string | null {
  const value = (process.env.WINGATE_TAX_SESSION_SECRET || "").trim();
  if (value.length >= 32 && value !== "replace-with-a-long-random-string" && value !== "wingate-tax-returns-demo-secret") {
    return value;
  }
  if (isProduction()) return null;
  return "wingate-local-dev-only-not-for-production-use";
}

export function contentSecurityPolicy(https: boolean): string {
  const parts = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];
  if (https || isProduction()) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "off",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export function clientIp(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "local";
}
