# OWASP Top 10 assessment — Wingate Accountants website

Scope: the **Wingate** Next.js app in `wingate/` (public site, tax portal, Practice OS, Stripe, AML). CICADA at the repository root is a separate product and was not rewritten in this pass.

Date: 15 September 2026  
Branch: `cursor/wingate-owasp-hardening-9498`  
Method: static review of auth, payments, files, SQL, HTML rendering, headers, secrets, and dependencies, then defensive retests (expected-deny only — no exploit payloads).

---

## 1. Findings before hardening

### A01 Broken Access Control

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A01-1 | **Critical** | `lib/tax-returns/files.ts` (path join on `fileId`); `lib/tax-returns/controllers.ts` `file()` | A `fileId` of `../…` could read files outside the upload directory. | Reject ids that are not `[a-z0-9][a-z0-9_-]{7,79}`; same check before disk and Postgres blob IO. |
| A01-2 | **High** | `lib/practice/controllers.ts` `POST checkout/complete`; `lib/tax-returns/payment-service.ts` `confirm()` | A guessed `sessionId` (especially `mock_*`) could mark an invoice or order paid without Stripe confirmation. | Retrieve the Stripe session and require `payment_status === paid`. Mock sessions must match the stored `mock_` id. Mock complete is forbidden in production when Stripe is configured. |
| A01-3 | **High** | `app/api/stripe/webhook/route.ts` | Unsigned JSON was accepted when webhook secrets were missing, so anyone could POST a fake `checkout.session.completed`. | Signed `constructEvent` is required when secrets exist. Otherwise 503 unless **not** production **and** `STRIPE_ALLOW_UNSIGNED_WEBHOOK=1`. |
| A01-4 | **High** | `lib/practice/controllers.ts` `GET bootstrap` / `GET mail` | Staff and developer bootstrap included verification, reset and 2FA mail bodies. | `redactMail()` strips those bodies unless the viewer is the related account holder. Developers still see metadata only. |
| A01-5 | **Medium** | `lib/practice/controllers.ts` `POST users`; `components/practice/os-panels.tsx` | Creating a user defaulted the password to `WingateChangeMe1`. | Strong password is required (10+ characters, letter and number). The form no longer supplies a default. |

Public `POST lead`, `POST checkout` and `POST checkout/abandon` stay public (marketing capture) but now validate email and are rate-limited.

### A02 Cryptographic Failures

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A02-1 | **Critical** | `lib/tax-returns/session.ts`, `lib/tax-returns/mail.ts` | HMAC fell back to `wingate-tax-returns-demo-secret`, so production sessions could be forged if env was unset. | `sessionSecret()` requires ≥32 characters in production and rejects known placeholders. Missing secret fails closed. |
| A02-2 | **High** | Auth register / login 2FA / forgot / resend JSON | Verification and reset codes were returned in `preview` in every environment. | `preview` is returned only when `WINGATE_MAIL_PREVIEW` is enabled (default: non-production). |
| A02-3 | **Low** | Session cookie | `secure` was already production-only (needed for local HTTP). | Unchanged; HSTS is set when HTTPS or production. |

Passwords already used scrypt with a random salt (`lib/tax-returns/crypto.ts`).

### A03 Injection

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A03-1 | **High** | `components/cms-html.tsx` | CMS HTML was rendered with `dangerouslySetInnerHTML` and no sanitiser. | Allowlist sanitiser in `lib/security/html.ts`; CMS save also sanitises. |
| A03-2 | **Medium** | `app/[slug]/page.tsx` JSON-LD | `JSON.stringify` into a `<script>` can break out with `</script>`. | `safeJsonLd()` escapes `<`, `>` and `&`. |
| A03-3 | **Medium** | File download `Content-Disposition` | A filename with CR/LF or quotes could inject headers. | `safeFileName()` strips control characters. |
| A03-4 | **Medium** | `lib/packages/backend.ts` `rest()` | A hostile `SUPABASE_URL` or `../` path could turn REST calls into SSRF. | URL must be `https://*.supabase.co`. Paths with `://`, `//` or `..` are rejected. |

SQL in `lib/packages/backend.ts`, `lib/practice/pg.ts` and `lib/tax-returns/pg-store.ts` already used parameterised `$1` queries. No change required for SQLi.

### A04 Insecure Design

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A04-1 | **High** | Mock checkout + unsigned webhook | A prod-like deploy without Stripe secrets still treated payments as paid. | Mock complete blocked when Stripe is configured in production; unsigned webhooks refused. |
| A04-2 | **Medium** | Sign-in page | Demo passwords were printed on the public form. | Hidden when `NODE_ENV === "production"`. Local/demo README still documents them. |
| A04-3 | **Medium** | Auth endpoints | No throttling. | Middleware + controller sliding-window limits (20 requests / 15 minutes per IP on auth, lead and checkout). |
| A04-4 | **Low** | Email OTP 2FA | Not TOTP/WebAuthn. | Kept (product constraint). Codes are hashed at rest and no longer returned in production JSON. |

### A05 Security Misconfiguration

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A05-1 | **High** | App-wide | No CSP, HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy or Permissions-Policy. `X-Powered-By` was on. | `next.config.ts` `poweredByHeader: false` plus `headers()`. `middleware.ts` repeats the same headers and redirects HTTP→HTTPS in production (except localhost). |
| A05-2 | **Medium** | JSON APIs | Unexpected errors returned raw `err.message`. | `publicError()` hides internal messages in production. |
| A05-3 | **Low** | Uploads | Data-URL size was only checked after base64 decode. | Reject oversized strings before decode; 8MB decoded cap; 12MB request `Content-Length` cap. |

### A06 Vulnerable and Outdated Components

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A06-1 | **Critical** | `package.json` `next@16.3.2` / `eslint-config-next@16.3.2` | Next.js 16.3.2 is in the range for GHSA-p293-qw3h-jr36 and GHSA-2xp9-vwfh-vxw4 (RCE / DoS). | Upgrade to `16.3.5`. |

### A07 Identification and Authentication Failures

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A07-1 | **Medium** | Register / reset / create user | Password minimum was 8 characters with no complexity. | 10+ characters with a letter and a number (`passwordMeetsPolicy`). |
| A07-2 | **Medium** | `login()` | Unknown emails returned 401 without a dummy verify (timing oracle). | `verifyPasswordDummy()` on unknown users. Same generic error message. |
| A07-3 | **Medium** | Login failures | Not logged. | `securityLog("login_failed", …)` plus staff mail for known accounts. |
| A07-4 | **High** | OTP in JSON | See A02-2. | Mail preview gated. |

Session cookies are `httpOnly`, `sameSite=lax`, HMAC-SHA256, expiry encoded in the token.

### A08 Software and Data Integrity Failures

Covered by A01-2 / A01-3 (unsigned webhook and mock complete). Stripe events are verified with the webhook signing secret.

### A09 Security Logging and Monitoring Failures

| ID | Severity | Location | Risk | Fix applied |
| --- | --- | --- | --- | --- |
| A09-1 | **Medium** | Auth / webhook | Failed logins, rejected webhooks and rate limits were silent. | JSON security logs (`src: wingate-security`) for those events. Practice OS already audits CMS, users, AML and payments. |

### A10 Server-Side Request Forgery

Covered by A03-4. Outbound fetch is only to a validated `https://*.supabase.co` REST URL. Postgres uses `ssl: { rejectUnauthorized: true }`.

### Secrets scan

- `wingate/.env.local` is gitignored and must **not** be committed.
- `env.example` contains placeholders only.
- If live Supabase or Stripe keys were ever pasted into chat or a ticket, **rotate them in the vendor dashboard**. This report does not reprint those values.
- Demo portal passwords remain for **local/demo** only and are hidden on the production sign-in UI.

---

## 2. Architecture improvements in this pass

- Security headers: CSP, HSTS (production/HTTPS), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
- Rate limiting on auth, lead, checkout, package-selection and Stripe webhooks.
- HTTPS redirect in production (non-localhost).
- Generic API errors in production.
- Structured security logging.
- Stronger password policy and no default staff password.
- File-id allowlist, HTML sanitiser, JSON-LD escaping, filename sanitising.
- Next.js patched to 16.3.5.

---

## 3. Residual risk (accepted / product constraints)

These remain **by design** after the retest. They are not unpatched holes in the original list.

| Item | Severity | Why it remains |
| --- | --- | --- |
| Email OTP 2FA (not TOTP) | Low | Product uses emailed codes. Codes are hashed; production APIs do not return them. |
| CSP `script-src 'unsafe-inline'` | Low | Next.js inline boot scripts. `object-src 'none'` and `frame-ancestors 'none'` still apply. |
| In-memory rate limit | Low | Per Node instance. Use a shared store (Redis/Upstash) if you run multiple Vercel instances and need a global cap. |
| Demo users in local seed | Low | Required for the local tax portal. Hidden on the production sign-in page. Change those passwords before a real client go-live. |
| Local HMAC fallback | Info | Only when `NODE_ENV !== "production"`. Production refuses to boot sessions without a 32+ character secret. |

---

## 4. Retest (defensive)

Command: `node scripts/owasp-retest.mjs http://127.0.0.1:43191`

Run against the hardened preview on 15 September 2026. Checks are expected-deny / header / status only (no exploit payloads).

```
PASS  CSP — frame-ancestors none
PASS  X-Frame-Options — DENY
PASS  X-Content-Type-Options — nosniff
PASS  X-Powered-By — removed
PASS  Unsigned webhook refused — HTTP 503
PASS  Unauthenticated OS payments redirect — 307 → /sign-in/?next=/portal/os/
PASS  Unauthenticated file download denied — HTTP 401
PASS  Unsafe file id rejected — HTTP 401
PASS  Unknown login rejected — HTTP 401
PASS  Login JSON has no mail preview
PASS  Weak password rejected — HTTP 400
PASS  Invalid lead email rejected — HTTP 400
PASS  Auth rate limit — HTTP 429 after repeated POSTs

All defensive checks passed.
```

`npm audit` in `wingate/` after the Next.js 16.3.5 upgrade: **0 vulnerabilities**.

A follow-up fix awaits rejected promises in `dispatchTaxReturns` so unauthenticated file/state calls return JSON 401 instead of an empty HTTP 500.

---

## 5. Operator checklist before go-live

1. Set `WINGATE_TAX_SESSION_SECRET` to ≥32 random characters in Vercel Production and Preview.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Do not set `STRIPE_ALLOW_UNSIGNED_WEBHOOK`.
3. Leave `WINGATE_MAIL_PREVIEW` unset or `0`.
4. Confirm `DATABASE_URL` uses `sslmode=require`.
5. Rotate any Supabase service-role key that may have been exposed outside `.env.local`.
6. Replace seeded demo users before serving real clients.
