"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "./api";

export function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const plan = search.get("plan") ?? "";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ preview?: { code: string }; email: string }>("auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobile,
          password,
          confirmPassword,
          acceptTerms,
          acceptPrivacy,
        }),
      });
      const params = new URLSearchParams({ email: result.email });
      if (plan) params.set("plan", plan);
      if (result.preview?.code) params.set("code", result.preview.code);
      router.push(`/verify-email/?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          First name
          <Input className="mt-1 h-10" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Last name
          <Input className="mt-1 h-10" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
      </div>
      <label className="block text-sm">
        Email address
        <Input className="mt-1 h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="block text-sm">
        Mobile number
        <Input className="mt-1 h-10" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
      </label>
      <label className="block text-sm">
        Password
        <Input className="mt-1 h-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        <span className="mt-1 block text-xs text-muted-foreground">At least 10 characters, including a letter and a number.</span>
      </label>
      <label className="block text-sm">
        Confirm password
        <Input className="mt-1 h-10" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={10} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input className="mt-1" type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} required />
        <span>
          I agree to the{" "}
          <Link className="underline" href="/tax-returns/engagement-terms/">
            Terms &amp; Conditions
          </Link>
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input className="mt-1" type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} required />
        <span>
          I agree to the{" "}
          <Link className="underline" href="/privacy-policy/">
            Privacy Policy
          </Link>
        </span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Creating account…" : "Create client account"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-primary underline" href={plan ? `/sign-in/?plan=${plan}` : "/sign-in/"}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "";
  const plan = search.get("plan") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [needsCode, setNeedsCode] = useState(false);
  const [previewCode, setPreviewCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function afterLogin(role: string) {
    if (plan && role === "client") {
      const started = await api<{ order: { payment: { status: string } } }>("orders/start", {
        method: "POST",
        body: JSON.stringify({ planId: plan }),
      });
      router.push(started.order.payment.status === "paid" ? "/portal/tax-returns/" : "/tax-returns/onboarding/");
      return;
    }
    if (role === "super_admin" || role === "admin") router.push("/portal/os/overview/");
    else if (role === "marketing") router.push("/portal/os/cms/");
    else if (role === "developer") router.push("/portal/os/developer/");
    else if (role === "accountant" || role === "staff") router.push("/portal/os/jobs/");
    else router.push(next || "/portal/tax-returns/");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{
        user?: { role: string };
        requiresTwoFactor?: boolean;
        needsVerification?: boolean;
        email?: string;
        preview?: { code: string };
      }>("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe, code: needsCode ? code : undefined }),
      });
      if (result.requiresTwoFactor) {
        setNeedsCode(true);
        setPreviewCode(result.preview?.code ?? "");
        return;
      }
      if (result.user) await afterLogin(result.user.role);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const params = new URLSearchParams({ email });
        if (plan) params.set("plan", plan);
        router.push(`/verify-email/?${params.toString()}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Email address
        <Input className="mt-1 h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="block text-sm">
        Password
        <Input className="mt-1 h-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {needsCode ? (
        <label className="block text-sm">
          Two-factor code
          <Input className="mt-1 h-10" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} required />
          {previewCode ? (
            <span className="mt-1 block text-xs text-muted-foreground">Demonstration inbox code: {previewCode}</span>
          ) : null}
        </label>
      ) : null}
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Remember me
        </label>
        <Link className="text-primary underline" href="/forgot-password/">
          Forgot password
        </Link>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Please wait…" : needsCode ? "Confirm code" : "Sign in"}
      </Button>
      <div className="grid gap-2">
        <Button type="button" variant="outline" className="h-10 w-full" disabled title="Google login will be connected when the firm’s OAuth credentials are added.">
          Google login (not connected)
        </Button>
        <Button type="button" variant="outline" className="h-10 w-full" disabled title="Microsoft login will be connected when the firm’s OAuth credentials are added.">
          Microsoft login (not connected)
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        New client?{" "}
        <Link className="font-medium text-primary underline" href={plan ? `/sign-up/?plan=${plan}` : "/sign-up/"}>
          Sign up
        </Link>
      </p>
      {process.env.NODE_ENV !== "production" ? (
        <p className="text-xs text-muted-foreground">
          Demo client: client@wingateaccountants.co.uk / WingateClient2026. Demo accountant:
          accountant@wingateaccountants.co.uk / WingateStaff2026.
        </p>
      ) : null}
    </form>
  );
}

export function VerifyEmailForm() {
  const router = useRouter();
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const plan = search.get("plan") ?? "";
  const [code, setCode] = useState(search.get("code") ?? search.get("token") ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(search.get("code") ?? "");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("auth/verify-email", { method: "POST", body: JSON.stringify({ code, token: code, email }) });
      router.push(`/sign-in/?verified=1${plan ? `&plan=${plan}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify email");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ preview?: { code: string } }>("auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (result.preview?.code) {
        setPreview(result.preview.code);
        setCode(result.preview.code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We sent a verification email to <strong>{email || "your inbox"}</strong>. Enter the six-digit code to open your
        client account.
      </p>
      {preview ? (
        <p className="rounded-lg bg-secondary px-3 py-2 text-sm">
          Demonstration inbox: use code <strong>{preview}</strong>. SMTP is not connected on this preview.
        </p>
      ) : null}
      <label className="block text-sm">
        Verification code
        <Input className="mt-1 h-10" value={code} onChange={(e) => setCode(e.target.value)} required />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Checking…" : "Verify email"}
      </Button>
      <button type="button" className="text-sm text-primary underline" onClick={() => void resend()} disabled={busy || !email}>
        Resend verification email
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ preview?: { code: string; link: string } }>("auth/forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
      setPreview(result.preview?.code ?? "");
      setLink(result.preview?.link ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-3 text-sm">
        <p>If that email is on a Wingate client account, we have sent a reset code.</p>
        {preview ? (
          <p className="rounded-lg bg-secondary px-3 py-2">
            Demonstration inbox code: <strong>{preview}</strong>
            {link ? (
              <>
                {" "}
                · <Link className="underline" href={link.replace(/^https?:\/\/[^/]+/, "")}>Open reset page</Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Email address
        <Input className="mt-1 h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Sending…" : "Send reset email"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [code, setCode] = useState(search.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("auth/reset", {
        method: "POST",
        body: JSON.stringify({ token: code, code, password, confirmPassword }),
      });
      router.push("/sign-in/?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Reset code
        <Input className="mt-1 h-10" value={code} onChange={(e) => setCode(e.target.value)} required />
      </label>
      <label className="block text-sm">
        New password
        <Input className="mt-1 h-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
      </label>
      <label className="block text-sm">
        Confirm password
        <Input className="mt-1 h-10" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={10} />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
