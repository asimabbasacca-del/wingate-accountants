"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "./api";
import { money } from "./helpers";
import { PortalShell } from "./portal-shell";
import { useTaxPortal } from "./use-tax-portal";

function Timeline({ steps }: { steps: { id: string; label: string; state: string }[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step) => (
        <li key={step.id} className="flex gap-3 text-sm">
          <span
            className={`mt-0.5 size-2.5 shrink-0 rounded-full ${
              step.state === "done" ? "bg-primary" : step.state === "current" ? "bg-accent" : "bg-border"
            }`}
          />
          <span className={step.state === "upcoming" ? "text-muted-foreground" : ""}>
            {step.label}
            {step.state === "current" ? " — in progress" : step.state === "done" ? " — done" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ClientPortal() {
  const router = useRouter();
  const { payload, error, busy, run } = useTaxPortal();
  const [password, setPassword] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState("");

  const bundle = payload?.bundle;
  const dash = payload?.dashboard;
  if (!payload?.user || !dash) {
    return (
      <PortalShell title="My Tax Portal">
        <p className="text-sm text-muted-foreground">{error || "Loading your tax portal…"}</p>
      </PortalShell>
    );
  }

  const onboardingOpen = !bundle || ["account_created", "plan_selected", "payment_pending", "paid", "aml_pending", "aml_submitted", "engagement_pending", "engagement_signed", "questionnaire_in_progress", "questionnaire_complete", "documents_pending"].includes(bundle.order.status);

  return (
    <PortalShell title="My Tax Portal" email={payload.user.email}>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Current Service</p>
          <p className="font-heading mt-2 text-lg font-semibold">{dash.currentService}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Current Tax Year</p>
          <p className="font-heading mt-2 text-lg font-semibold">{dash.currentTaxYear}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tax Return Status</p>
          <p className="font-heading mt-2 text-lg font-semibold">{dash.status}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">AML status</p>
          <p className="font-heading mt-2 text-lg font-semibold">{dash.amlStatus.replace("_", " ")}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Outstanding Tasks</p>
          {dash.outstandingTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing waiting on you.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {dash.outstandingTasks.map((task) => (
                <li key={task.id}>
                  <Link className="text-primary underline" href={task.href}>
                    {task.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {onboardingOpen ? (
            <Button className="mt-4 h-10" onClick={() => router.push("/tax-returns/onboarding/")}>
              Continue onboarding
            </Button>
          ) : null}
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Messages</p>
          <p className="font-heading mt-2 text-2xl">{dash.unreadMessages}</p>
          <p className="mt-1 text-sm text-muted-foreground">Messages from your Wingate accountant.</p>
          <Link className="mt-3 inline-block text-sm text-primary underline" href="/portal/tax-returns/messages/">
            Open secure messages
          </Link>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Uploaded Documents</p>
          <p className="font-heading mt-2 text-2xl">{dash.uploadedDocuments}</p>
          <p className="mt-1 text-sm text-muted-foreground">Held in your document vault.</p>
          <Link className="mt-3 inline-block text-sm text-primary underline" href="/portal/tax-returns/documents/">
            Open document vault
          </Link>
        </article>
      </div>

      {bundle?.order.status === "awaiting_client_approval" && bundle.order.taxSummary ? (
        <section className="mt-6 rounded-2xl border border-accent/40 bg-card p-6">
          <h2 className="font-heading text-xl font-semibold">Approve your tax return</h2>
          <p className="mt-2 text-sm">{bundle.order.taxSummary.narrative}</p>
          <p className="font-heading mt-4 text-2xl">
            {bundle.order.taxSummary.taxDue > 0
              ? `${money(bundle.order.taxSummary.taxDue)} to pay`
              : `${money(bundle.order.taxSummary.refundDue)} refund`}
          </p>
          <Button
            className="mt-4 h-11"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                await api("client/approve", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) });
              })
            }
          >
            I approve these figures
          </Button>
        </section>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Progress tracker</h2>
          <div className="mt-4">
            <Timeline steps={dash.timeline} />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Invoices</h2>
          {dash.invoices.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No invoices yet. Choose a package to raise the first fee.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {dash.invoices.map((invoice) => (
                <li key={invoice.id} className="flex justify-between gap-3">
                  <span>{invoice.description}</span>
                  <span>
                    {money(invoice.amountGbp)} · {invoice.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="font-heading mt-6 text-base font-semibold">Next tax year</h3>
          <p className="mt-2 text-sm text-muted-foreground">{dash.renewalNote}</p>
        </section>
      </div>

      {dash.missingDocuments.length ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Missing-document checker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on your questionnaire answers, we still expect:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {dash.missingDocuments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Two-factor authentication</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When this is on, we email a six-digit code after your password. Demo accounts can turn this on with the same
          password they used to sign in.
        </p>
        <p className="mt-2 text-sm">Status: {payload.user.twoFactorEnabled ? "On" : "Off"}</p>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await api("auth/2fa", {
                method: "POST",
                body: JSON.stringify({ enabled: !payload.user?.twoFactorEnabled, password }),
              });
              setTwoFactorMessage(payload.user?.twoFactorEnabled ? "Two-factor is off." : "Two-factor is on.");
              setPassword("");
            });
          }}
        >
          <Input
            className="h-10 sm:max-w-xs"
            type="password"
            placeholder="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button className="h-10" disabled={busy}>
            {payload.user.twoFactorEnabled ? "Turn off 2FA" : "Turn on 2FA"}
          </Button>
        </form>
        {twoFactorMessage ? <p className="mt-2 text-sm text-muted-foreground">{twoFactorMessage}</p> : null}
      </section>
    </PortalShell>
  );
}
