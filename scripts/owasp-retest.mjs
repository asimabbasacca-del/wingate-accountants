#!/usr/bin/env node
/**
 * Defensive OWASP retest — expected-deny, headers, and auth checks only.
 * No exploit payloads.
 */
const origin = process.argv[2] || "http://127.0.0.1:43191";

function fail(name, detail) {
  console.error(`FAIL  ${name}: ${detail}`);
  process.exitCode = 1;
}

function ok(name, detail) {
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function request(path, init = {}) {
  const reqHeaders = { ...(init.headers || {}) };
  if (!reqHeaders["x-forwarded-for"] && !reqHeaders["X-Forwarded-For"]) {
    reqHeaders["x-forwarded-for"] = "203.0.113.10";
  }
  const response = await fetch(`${origin}${path}`, { redirect: "manual", ...init, headers: reqHeaders });
  const headers = Object.fromEntries(response.headers.entries());
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, headers, text, json };
}

async function main() {
  console.log(`OWASP defensive retest → ${origin}\n`);

  const home = await request("/");
  const csp = home.headers["content-security-policy"] || "";
  const xfo = home.headers["x-frame-options"] || "";
  const nosniff = home.headers["x-content-type-options"] || "";
  const powered = home.headers["x-powered-by"];
  if (home.status >= 200 && home.status < 400 && csp.includes("frame-ancestors 'none'")) ok("CSP", "frame-ancestors none");
  else fail("CSP", `status=${home.status} csp=${csp.slice(0, 80)}`);
  if (/deny/i.test(xfo)) ok("X-Frame-Options", xfo);
  else fail("X-Frame-Options", xfo || "missing");
  if (nosniff === "nosniff") ok("X-Content-Type-Options", nosniff);
  else fail("X-Content-Type-Options", nosniff || "missing");
  if (!powered) ok("X-Powered-By", "removed");
  else fail("X-Powered-By", powered);

  const webhook = await request("/api/stripe/webhook/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs_test" } } }),
  });
  if (webhook.status === 503 || webhook.status === 400) ok("Unsigned webhook refused", `HTTP ${webhook.status}`);
  else fail("Unsigned webhook refused", `HTTP ${webhook.status} ${webhook.text.slice(0, 120)}`);

  const portal = await request("/portal/os/payments/");
  if (portal.status === 307 || portal.status === 308 || portal.status === 302) {
    const loc = portal.headers.location || "";
    if (loc.includes("sign-in") || loc.includes("login")) ok("Unauthenticated OS payments redirect", `${portal.status} → ${loc}`);
    else ok("Unauthenticated OS payments redirect", `${portal.status} → ${loc}`);
  } else if (portal.status === 401 || portal.status === 403) ok("Unauthenticated OS payments denied", `HTTP ${portal.status}`);
  else fail("Unauthenticated OS payments", `HTTP ${portal.status}`);

  const files = await request("/api/tax-returns/files/?id=file_test");
  if (files.status === 401 || files.status === 400 || files.status === 404) {
    ok("Unauthenticated file download denied", `HTTP ${files.status}`);
  } else fail("Unauthenticated file download denied", `HTTP ${files.status} ${files.text.slice(0, 120)}`);

  const traversal = await request("/api/tax-returns/files/?id=%2e%2e%2fpackage.json");
  if (traversal.status === 401 || traversal.status === 400 || traversal.status === 404) {
    ok("Unsafe file id rejected", `HTTP ${traversal.status}`);
  } else fail("Unsafe file id rejected", `HTTP ${traversal.status} ${traversal.text.slice(0, 120)}`);

  const login = await request("/api/tax-returns/auth/login/", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.11" },
    body: JSON.stringify({ email: "nobody@example.com", password: "not-the-password" }),
  });
  if (login.status === 401) ok("Unknown login rejected", "HTTP 401");
  else fail("Unknown login rejected", `HTTP ${login.status} ${login.text.slice(0, 120)}`);
  if (login.json && login.json.preview) fail("Login must not return preview codes", JSON.stringify(login.json.preview));
  else ok("Login JSON has no mail preview", "");

  const weak = await request("/api/tax-returns/auth/register/", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.12" },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "User",
      email: "weak-pass@example.com",
      mobile: "07700900000",
      password: "short",
      confirmPassword: "short",
      acceptTerms: true,
      acceptPrivacy: true,
    }),
  });
  if (weak.status === 400) ok("Weak password rejected", "HTTP 400");
  else fail("Weak password rejected", `HTTP ${weak.status} ${weak.text.slice(0, 120)}`);

  const lead = await request("/api/practice/lead/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Test", email: "not-an-email", message: "hi" }),
  });
  if (lead.status === 400) ok("Invalid lead email rejected", "HTTP 400");
  else fail("Invalid lead email rejected", `HTTP ${lead.status}`);

  let limited = false;
  for (let i = 0; i < 24; i += 1) {
    const hit = await request("/api/tax-returns/auth/login/", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.99" },
      body: JSON.stringify({ email: "rate@example.com", password: "x" }),
    });
    if (hit.status === 429) {
      limited = true;
      break;
    }
  }
  if (limited) ok("Auth rate limit", "HTTP 429 after repeated POSTs");
  else fail("Auth rate limit", "did not return 429 after 24 login POSTs");

  if (process.exitCode === 1) {
    console.error("\nDefensive retest failed.");
    process.exit(1);
  }
  console.log("\nAll defensive checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
