"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/tax-returns/types";
import { roleLabel } from "@/lib/practice/roles";
import { profileProgress, type PracticeDump } from "@/lib/practice/types";
import {
  AmlPanel,
  AutomationPanel,
  BillingPanel,
  CmsPanel,
  CrmPanel,
  DeadlinesPanel,
  DocumentsPanel,
  PackagePanel,
  PaymentsPanel,
  ProfilePanel,
  PromosPanel,
  UsersPanel,
} from "./os-panels";

type Bootstrap = {
  user: PublicUser;
  home: string;
  onboarding: ReturnType<typeof profileProgress>;
  snapshot: PracticeDump & { mail?: unknown[]; users?: PublicUser[] };
};

const NAV: { href: string; label: string; roles: string[] }[] = [
  { href: "/portal/os/overview/", label: "Overview", roles: ["super_admin", "admin", "staff", "accountant"] },
  { href: "/portal/os/users/", label: "Users", roles: ["super_admin", "admin"] },
  { href: "/portal/os/clients/", label: "Clients", roles: ["super_admin", "admin", "staff", "accountant"] },
  { href: "/portal/os/jobs/", label: "Jobs", roles: ["super_admin", "admin", "staff", "accountant"] },
  { href: "/portal/os/aml/", label: "AML", roles: ["super_admin", "admin", "staff", "accountant", "client"] },
  { href: "/portal/os/deadlines/", label: "HMRC deadlines", roles: ["super_admin", "admin", "staff", "accountant", "client"] },
  { href: "/portal/os/documents/", label: "AI documents", roles: ["super_admin", "admin", "staff", "accountant"] },
  { href: "/portal/os/crm/", label: "CRM", roles: ["super_admin", "admin"] },
  { href: "/portal/os/payments/", label: "Payments", roles: ["super_admin", "admin"] },
  { href: "/portal/os/packages/", label: "Packages", roles: ["super_admin", "admin"] },
  { href: "/portal/os/promos/", label: "Promotions", roles: ["super_admin", "admin"] },
  { href: "/portal/os/automation/", label: "Automation", roles: ["super_admin", "admin"] },
  { href: "/portal/os/cms/", label: "Website CMS", roles: ["super_admin", "admin", "marketing"] },
  { href: "/portal/os/audit/", label: "Audit log", roles: ["super_admin", "admin", "developer"] },
  { href: "/portal/os/developer/", label: "Developer", roles: ["super_admin", "developer"] },
  { href: "/portal/os/progress/", label: "My progress", roles: ["client"] },
  { href: "/portal/os/profile/", label: "My profile", roles: ["client"] },
  { href: "/portal/os/billing/", label: "My billing", roles: ["client"] },
];

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/practice/${path}`, { credentials: "include", ...init });
  const data = (await response.json()) as { error?: string } & Record<string, unknown>;
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function PracticeApp({ section }: { section: string }) {
  const router = useRouter();
  const path = usePathname();
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function reload() {
    const data = (await api("bootstrap/")) as Bootstrap;
    setBoot(data);
  }

  async function saved(message: string) {
    setNotice(message);
    await reload();
  }

  useEffect(() => {
    reload().catch((err: Error) => setError(err.message));
  }, [path]);

  if (error === "Access Denied") {
    router.replace("/portal/denied/");
    return null;
  }
  if (error === "Please sign in") {
    router.replace("/sign-in/?next=/portal/");
    return null;
  }
  if (!boot) return <p className="px-4 py-16 text-sm text-muted-foreground">Loading the Wingate operating system…</p>;

  const { user, snapshot, onboarding } = boot;
  const nav = NAV.filter((item) => item.roles.includes(user.role));
  const revenue = snapshot.invoices.filter((row) => row.status === "paid");
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);
  const sum = (rows: typeof revenue) => rows.reduce((n, row) => n + row.amountGbp, 0);
  const staff = user.role === "super_admin" || user.role === "admin" || user.role === "staff" || user.role === "accountant";

  return (
    <div className="min-h-screen bg-[#F3F6F5]">
      <div className="border-b border-border bg-[#0F172A] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs tracking-wide text-white/60 uppercase">Wingate practice OS</p>
            <h1 className="font-heading text-xl font-semibold">{roleLabel(user.role)} dashboard</h1>
          </div>
          <p className="text-sm text-white/80">{user.name}</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[13rem_1fr]">
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm ${path === item.href ? "bg-primary text-primary-foreground" : "hover:bg-white"}`}
            >
              {item.label}
            </Link>
          ))}
          {user.role === "client" ? (
            <Link href="/portal/tax-returns/" className="block rounded-lg px-3 py-2 text-sm hover:bg-white">
              Tax portal
            </Link>
          ) : null}
          {staff ? (
            <Link href="/portal/accountant/" className="block rounded-lg px-3 py-2 text-sm hover:bg-white">
              Tax files
            </Link>
          ) : null}
        </nav>
        <div className="space-y-6">
          {notice ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p> : null}
          {error && error !== "Access Denied" ? <p className="text-sm text-destructive">{error}</p> : null}

          {section === "overview" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card label="Revenue today" value={`£${sum(revenue.filter((r) => r.paidAt?.startsWith(today))).toFixed(0)}`} />
              <Card label="Revenue this month" value={`£${sum(revenue.filter((r) => r.paidAt?.startsWith(month))).toFixed(0)}`} />
              <Card label="Revenue this year" value={`£${sum(revenue.filter((r) => r.paidAt?.startsWith(year))).toFixed(0)}`} />
              <Card label="Active jobs" value={String(snapshot.jobs.filter((j) => j.status !== "completed").length)} />
              <Card label="Upcoming deadlines" value={String(snapshot.deadlines.filter((d) => d.status !== "completed").length)} />
              <Card label="CRM leads" value={String(snapshot.leads.length)} />
              <Card label="AML pending" value={String(snapshot.aml.filter((a) => a.status !== "approved").length)} />
              <Card label="Failed payments" value={String(snapshot.invoices.filter((i) => i.status === "failed").length)} />
            </div>
          ) : null}

          {section === "payments" ? <PaymentsPanel snapshot={snapshot} onSaved={(message) => void saved(message)} /> : null}
          {section === "crm" ? <CrmPanel snapshot={snapshot} onSaved={(message) => void saved(message)} /> : null}
          {section === "jobs" || section === "progress" ? (
            <section className="space-y-4">
              {snapshot.jobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs yet.</p> : null}
              {snapshot.jobs.map((job) => (
                <article key={job.id} className="rounded-xl border border-border bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-heading text-lg font-semibold">
                      {job.clientName} — {job.packageName}
                    </h2>
                    <p className="text-sm">
                      {job.progress}% · {job.status.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
                  </div>
                  <ol className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
                    {job.stages.map((stage) => (
                      <li key={stage.id} className={stage.done ? "text-primary" : "text-muted-foreground"}>
                        {stage.done ? "✓" : "○"} {stage.label}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </section>
          ) : null}
          {section === "deadlines" ? (
            <DeadlinesPanel snapshot={snapshot} staff={staff} onSaved={(message) => void saved(message)} />
          ) : null}
          {section === "aml" ? <AmlPanel snapshot={snapshot} staff={staff} onSaved={(message) => void saved(message)} /> : null}
          {section === "cms" ? <CmsPanel pages={snapshot.cms} onSaved={(message) => void saved(message)} /> : null}
          {section === "packages" ? <PackagePanel onSaved={(message) => void saved(message)} /> : null}
          {section === "promos" ? <PromosPanel snapshot={snapshot} onSaved={(message) => void saved(message)} /> : null}
          {section === "automation" ? <AutomationPanel snapshot={snapshot} onSaved={(message) => void saved(message)} /> : null}
          {section === "users" ? (
            <UsersPanel users={snapshot.users ?? []} actor={user} onSaved={(message) => void saved(message)} />
          ) : null}
          {section === "documents" ? <DocumentsPanel onSaved={(message) => void saved(message)} /> : null}
          {section === "profile" ? (
            <ProfilePanel user={user} snapshot={snapshot} onboarding={onboarding} onSaved={(message) => void saved(message)} />
          ) : null}
          {section === "audit" ? (
            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="font-heading text-lg font-semibold">Audit log</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {snapshot.audit.map((row) => (
                  <li key={row.id}>
                    {row.createdAt.replace("T", " ").slice(0, 16)} · {row.userEmail} · {row.action} · {row.details}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {section === "developer" ? (
            <section className="rounded-xl border border-border bg-white p-5 text-sm">
              <h2 className="font-heading text-lg font-semibold">Developer</h2>
              <p className="mt-2">
                Stripe mode: {snapshot.settings.stripeMode}. Webhook: <code>/api/stripe/webhook/</code>
              </p>
              <p className="mt-2 text-muted-foreground">
                Client tax files, AML questionnaires and payment card data are not shown on this dashboard.
              </p>
              <p className="mt-2">Audit events: {snapshot.audit.length}. MTD bridging remains in development.</p>
            </section>
          ) : null}
          {section === "clients" ? (
            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="font-heading text-lg font-semibold">Assigned clients</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {snapshot.jobs.map((job) => (
                  <li key={job.id}>
                    {job.clientName} · {job.packageName} · {job.status.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {section === "billing" ? <BillingPanel snapshot={snapshot} /> : null}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
