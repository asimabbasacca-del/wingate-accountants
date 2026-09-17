# Wingate tax returns portal

Self Assessment purchase and onboarding for **Wingate Accountants Limited**. This is a page and feature of the firm website — not a separate SaaS product.

## Public sales page

**Online Tax Return Preparation Service** at `/online-tax-return-preparation-service/` is the primary onboarding journey for Self Assessment and personal tax clients.

`/tax-returns/` redirects there. Header **SIGN IN** / **SIGN UP** appear on every page. Logged-in clients see Dashboard, Messages, Documents and Logout.

## Client journey

1. View tax return packages
2. Sign up (first name, last name, email, mobile, password, terms and privacy)
3. Verify email
4. Sign in to My Tax Portal
5. Purchase a package
6. Sign the engagement letter
7. Complete AML / KYC
8. Upload documents (classified from the file name)
9. Complete the tax questionnaire
10. Track progress and outstanding tasks
11. Message the named Wingate accountant
12. Approve the tax return
13. Download the working copy, SA302 and HMRC receipt

Onboarding wizard: `/tax-returns/onboarding/`  
Client portal: `/portal/tax-returns/`  
Accountant: `/portal/accountant/`

## Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Client | `client@wingateaccountants.co.uk` | `WingateClient2026` |
| Accountant | `accountant@wingateaccountants.co.uk` | `WingateStaff2026` |

Demo accounts are pre-verified. New sign-ups must verify email (this preview shows the code on screen because SMTP is not connected).

## Local data

JSON store (local preview): `wingate/data/tax-returns.json`  
Uploads (local preview): `wingate/data/uploads/`  
On Supabase/Vercel: `wingate_tax_json_store` + `wingate_tax_file_blobs` (see `docs/LAUNCH.md`).

## Environment

Copy `env.example`. None of these are required for the preview:

- `STRIPE_SECRET_KEY` — live Checkout
- `WINGATE_TAX_APP_URL` — success/cancel URLs for Stripe and verification links
- `WINGATE_TAX_SESSION_SECRET` — cookie HMAC
- `HMRC_CLIENT_ID` / `HMRC_CLIENT_SECRET` — do not retry sandbox OAuth (`invalid_client`). MTD for Income Tax bridging is **in development**.

Google and Microsoft login buttons are visible but disabled until the firm’s OAuth credentials are added. Do not treat them as working social login.

## Code

- API: `app/api/tax-returns/[...path]/route.ts` → `lib/tax-returns/controllers.ts`
- UI: `components/tax-returns/`
- SQL (create-only): `supabase/migrations/001_wingate_tax_returns.sql` (included in `supabase/APPLY_IN_SUPABASE.sql`)

Keep `firm_id` on every row so each Wingate client file stays on the correct firm.
