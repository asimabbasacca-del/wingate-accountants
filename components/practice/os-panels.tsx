"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PublicUser } from "@/lib/tax-returns/types";
import { roleLabel } from "@/lib/practice/roles";
import {
  PROFILE_FIELDS,
  profileProgress,
  type AmlCase,
  type CmsPage,
  type DeadlineKind,
  type PracticeDump,
} from "@/lib/practice/types";
import type { Package } from "@/lib/packages/types";
import { PACKAGES, PACKAGE_GROUPS } from "@/lib/packages/data";

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/practice/${path}`, { credentials: "include", ...init });
  const data = (await response.json()) as { error?: string } & Record<string, unknown>;
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function post(path: string, body: unknown) {
  return api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

const ACTIONS = [
  "create_client",
  "create_job",
  "send_email",
  "send_engagement_letter",
  "request_documents",
  "create_folder",
  "assign_staff",
  "change_status",
  "create_tasks",
  "schedule_reminders",
] as const;

const DEADLINE_KINDS: DeadlineKind[] = [
  "self_assessment",
  "corporation_tax",
  "vat_return",
  "vat_payment",
  "paye",
  "cis",
  "confirmation_statement",
  "cgt",
  "annual_accounts",
];

export function PaymentsPanel({
  snapshot,
  onSaved,
}: {
  snapshot: PracticeDump;
  onSaved: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const year = new Date().toISOString().slice(0, 4);
  const paid = snapshot.invoices.filter((row) => row.status === "paid");
  const yearSum = paid.filter((row) => row.paidAt?.startsWith(year)).reduce((n, row) => n + row.amountGbp, 0);
  const rows = snapshot.invoices.filter((row) => {
    const hay = `${row.number} ${row.email} ${row.packageName}`.toLowerCase();
    if (query && !hay.includes(query.toLowerCase())) return false;
    if (status !== "all" && row.status !== status) return false;
    return true;
  });
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground">Revenue this year £{yearSum.toFixed(0)} · Stripe IDs on each invoice</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input className="w-48" placeholder="Search invoices" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="h-9 rounded-lg border border-input px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["all", "pending", "paid", "failed", "refunded", "cancelled"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/60">
                <td className="py-2">
                  {row.number}
                  <p className="text-xs text-muted-foreground">{row.stripePaymentId || "mock / pending"}</p>
                </td>
                <td>
                  {row.packageName}
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td>£{row.amountGbp.toFixed(2)}</td>
                <td>{row.status}</td>
                <td>
                  {row.status === "paid" ? (
                    <form
                      className="flex flex-wrap gap-1"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        await post("refund/", {
                          invoiceId: row.id,
                          amountGbp: Number(data.get("amount") || row.amountGbp),
                          reason: String(data.get("reason") || "Refund"),
                        });
                        onSaved(`Refunded ${row.number}.`);
                      }}
                    >
                      <Input name="amount" className="w-20" type="number" step="0.01" defaultValue={row.amountGbp} />
                      <Input name="reason" className="w-28" placeholder="Reason" />
                      <Button type="submit" variant="outline" className="h-9">
                        Refund
                      </Button>
                    </form>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="font-heading font-semibold">Subscriptions</h3>
      <ul className="space-y-2 text-sm">
        {snapshot.subscriptions.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
            <span>
              {row.email} · {row.packageId} · {row.interval} · {row.status}
            </span>
            <span className="flex gap-2">
              {row.status === "active" ? (
                <Button
                  variant="outline"
                  className="h-8"
                  onClick={() => void post("subscription/", { id: row.id, status: "paused" }).then(() => onSaved("Subscription paused."))}
                >
                  Pause
                </Button>
              ) : null}
              {row.status !== "cancelled" ? (
                <Button
                  variant="outline"
                  className="h-8"
                  onClick={() => void post("subscription/", { id: row.id, status: "cancelled" }).then(() => onSaved("Subscription cancelled."))}
                >
                  Cancel
                </Button>
              ) : null}
              {row.status !== "active" ? (
                <Button
                  className="h-8"
                  onClick={() => void post("subscription/", { id: row.id, status: "active" }).then(() => onSaved("Subscription resumed."))}
                >
                  Resume
                </Button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <h3 className="font-heading font-semibold">Abandoned checkout</h3>
      <ul className="space-y-2 text-sm">
        {snapshot.abandoned.length === 0 ? <li className="text-muted-foreground">No abandoned checkouts.</li> : null}
        {snapshot.abandoned.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
            <span>
              {row.name} · {row.email} · {row.packageName}
              {row.emailedAt ? ` · followed up ${row.emailedAt.slice(0, 10)}` : ""}
            </span>
            {!row.emailedAt ? (
              <Button
                className="h-8"
                onClick={() => void post("abandoned/follow-up/", { id: row.id }).then(() => onSaved("Follow-up email logged."))}
              >
                Send reminder
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CrmPanel({ snapshot, onSaved }: { snapshot: PracticeDump; onSaved: (message: string) => void }) {
  const columns = ["new", "contacted", "qualified", "proposal", "won", "lost", "client"] as const;
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const leads = snapshot.leads.filter((lead) => {
    if (source !== "all" && lead.source !== source) return false;
    const hay = `${lead.name} ${lead.email} ${lead.businessName} ${lead.notes}`.toLowerCase();
    return !query || hay.includes(query.toLowerCase());
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input className="w-56" placeholder="Search leads" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="h-9 rounded-lg border border-input px-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          {["all", "website", "referral", "google", "facebook", "linkedin", "direct"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 overflow-x-auto md:grid-cols-4">
        {columns.map((col) => (
          <div key={col} className="min-w-[12rem] rounded-xl border border-border bg-white p-3">
            <p className="text-xs font-semibold tracking-wide uppercase">{col}</p>
            {leads
              .filter((lead) => lead.status === col)
              .map((lead) => (
                <article key={lead.id} className="mt-2 rounded-lg border border-border p-2 text-sm">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      const i = columns.indexOf(col);
                      const next = columns[Math.min(i + 1, columns.length - 1)];
                      void post("lead/status/", { id: lead.id, status: next }).then(() => onSaved("Lead updated."));
                    }}
                  >
                    <strong>{lead.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {lead.source} · {lead.serviceInterest}
                    </p>
                  </button>
                  <form
                    className="mt-2 flex gap-1"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      await post("lead/note/", { id: lead.id, text: String(data.get("text") || "") });
                      event.currentTarget.reset();
                      onSaved("Note added.");
                    }}
                  >
                    <Input name="text" className="h-8" placeholder="Add note" required />
                    <Button type="submit" className="h-8 px-2">
                      +
                    </Button>
                  </form>
                </article>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeadlinesPanel({
  snapshot,
  staff,
  onSaved,
}: {
  snapshot: PracticeDump;
  staff: boolean;
  onSaved: (message: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">HMRC deadlines</h2>
        {staff ? (
          <Button onClick={() => void post("deadlines/remind/", {}).then((data) => onSaved(`${data.sent ?? 0} reminder emails logged.`))}>
            Send 30/14/7/1 day reminders
          </Button>
        ) : null}
      </div>
      <ul className="space-y-3 text-sm">
        {snapshot.deadlines.map((row) => {
          const days = Math.ceil((Date.parse(row.dueAt) - Date.now()) / 86400000);
          return (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 py-2">
              <span>
                {row.clientName} · {row.kind.replaceAll("_", " ")}
                <span className="block text-xs text-muted-foreground">
                  Reminders sent: {(row.remindersSent || []).join(", ") || "none"}
                </span>
              </span>
              <span className="font-medium">
                {row.status.replaceAll("_", " ")} · {row.dueAt.slice(0, 10)} · {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
              </span>
              {staff ? (
                <Button
                  variant="outline"
                  className="h-8"
                  onClick={() => void post("deadlines/", { id: row.id, clientName: row.clientName, kind: row.kind, dueAt: row.dueAt, status: "completed" }).then(() => onSaved("Marked complete."))}
                >
                  Complete
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {staff ? (
        <form
          className="grid gap-2 rounded-lg border border-dashed border-border p-3 sm:grid-cols-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await post("deadlines/", {
              clientName: String(data.get("clientName")),
              kind: String(data.get("kind")),
              dueAt: new Date(String(data.get("dueAt"))).toISOString(),
            });
            onSaved("Deadline added.");
            event.currentTarget.reset();
          }}
        >
          <Input name="clientName" placeholder="Client name" required />
          <select name="kind" className="h-9 rounded-lg border border-input px-2 text-sm">
            {DEADLINE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <Input name="dueAt" type="date" required />
          <Button type="submit">Add deadline</Button>
        </form>
      ) : null}
    </section>
  );
}

export function AmlPanel({
  snapshot,
  staff,
  onSaved,
}: {
  snapshot: PracticeDump;
  staff: boolean;
  onSaved: (message: string) => void;
}) {
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const rows = snapshot.aml.filter((row) => (status === "all" || row.status === status) && (risk === "all" || row.risk === risk));
  const mine = snapshot.aml[0];
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">AML / KYC / CDD</h2>
        {staff ? (
          <div className="flex gap-2">
            <select className="h-9 rounded-lg border border-input px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {["all", "pending", "under_review", "approved", "rejected"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select className="h-9 rounded-lg border border-input px-2 text-sm" value={risk} onChange={(e) => setRisk(e.target.value)}>
              {["all", "low", "medium", "high"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">
        Face match is staff-reviewed. There is no biometric or liveness vendor. ID, proof of address and a selfie stay on the tax file.
      </p>
      {staff
        ? rows.map((row) => <AmlStaffCard key={row.id} row={row} onSaved={onSaved} />)
        : mine
          ? <AmlClientForm row={mine} onSaved={onSaved} />
          : <AmlClientForm row={null} onSaved={onSaved} />}
    </section>
  );
}

function AmlStaffCard({ row, onSaved }: { row: AmlCase; onSaved: (message: string) => void }) {
  return (
    <article className="rounded-lg border border-border p-3 text-sm">
      <p className="font-medium">{row.clientName}</p>
      <p className="text-muted-foreground">
        {row.status} · {row.risk} risk · PEP {row.pep ? "yes" : "no"} · ID {row.idDocumentStatus} · POA {row.poaStatus} · selfie{" "}
        {row.selfieStatus} · face match {row.faceMatchConfirmed ? "confirmed" : "not confirmed"} · score {row.matchScore ?? "—"}%
      </p>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        {Object.entries(row.questionnaire || {}).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs text-muted-foreground">{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await post("aml/", {
            id: row.id,
            status: String(data.get("status")),
            risk: String(data.get("risk")),
            matchScore: Number(data.get("matchScore") || 0) || null,
            faceMatchConfirmed: data.get("face") === "on",
            idDocumentStatus: String(data.get("idDocumentStatus")),
            poaStatus: String(data.get("poaStatus")),
            selfieStatus: String(data.get("selfieStatus")),
            staffNotes: String(data.get("staffNotes") || ""),
          });
          onSaved(`${row.clientName} AML updated.`);
        }}
      >
        <select name="status" className="h-9 rounded-lg border border-input px-2" defaultValue={row.status}>
          {["pending", "under_review", "approved", "rejected"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="risk" className="h-9 rounded-lg border border-input px-2" defaultValue={row.risk}>
          {["low", "medium", "high"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Input name="matchScore" type="number" defaultValue={row.matchScore ?? ""} placeholder="Match %" />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="face" defaultChecked={row.faceMatchConfirmed} /> Staff confirm face match
        </label>
        <select name="idDocumentStatus" className="h-9 rounded-lg border border-input px-2" defaultValue={row.idDocumentStatus}>
          {["missing", "uploaded", "accepted", "rejected"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="poaStatus" className="h-9 rounded-lg border border-input px-2" defaultValue={row.poaStatus}>
          {["missing", "uploaded", "accepted", "rejected"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="selfieStatus" className="h-9 rounded-lg border border-input px-2" defaultValue={row.selfieStatus}>
          {["missing", "uploaded", "accepted", "rejected"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Input name="staffNotes" defaultValue={row.staffNotes} placeholder="Staff notes" />
        <Button type="submit" className="sm:col-span-4">
          Save review
        </Button>
      </form>
    </article>
  );
}

function AmlClientForm({ row, onSaved }: { row: AmlCase | null; onSaved: (message: string) => void }) {
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        await post("aml/questionnaire/", {
          questionnaire: {
            occupation: String(data.get("occupation") || ""),
            sourceOfFunds: String(data.get("sourceOfFunds") || ""),
            sourceOfWealth: String(data.get("sourceOfWealth") || ""),
            pep: String(data.get("pep") || "No"),
            actingForAnother: String(data.get("actingForAnother") || "No"),
            ukResident: String(data.get("ukResident") || "Yes"),
            expectedIncome: String(data.get("expectedIncome") || ""),
          },
        });
        onSaved("CDD questionnaire submitted for staff review.");
      }}
    >
      {row ? (
        <p className="text-sm">
          Status: {row.status}. ID {row.idDocumentStatus}, proof of address {row.poaStatus}, selfie {row.selfieStatus}. Upload those
          files in the tax portal document vault.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No AML case yet. Submit the questionnaire to open one.</p>
      )}
      <Input name="occupation" defaultValue={row?.questionnaire.occupation} placeholder="Occupation" required />
      <Input name="sourceOfFunds" defaultValue={row?.questionnaire.sourceOfFunds} placeholder="Source of funds" required />
      <Input name="sourceOfWealth" defaultValue={row?.questionnaire.sourceOfWealth} placeholder="Source of wealth" />
      <Input name="expectedIncome" defaultValue={row?.questionnaire.expectedIncome} placeholder="Expected annual income" />
      <label className="block text-sm">
        Politically exposed person?
        <select name="pep" className="mt-1 h-9 w-full rounded-lg border border-input px-2" defaultValue={row?.questionnaire.pep || "No"}>
          <option>No</option>
          <option>Yes</option>
        </select>
      </label>
      <label className="block text-sm">
        Acting for another person?
        <select name="actingForAnother" className="mt-1 h-9 w-full rounded-lg border border-input px-2" defaultValue={row?.questionnaire.actingForAnother || "No"}>
          <option>No</option>
          <option>Yes</option>
        </select>
      </label>
      <label className="block text-sm">
        UK resident?
        <select name="ukResident" className="mt-1 h-9 w-full rounded-lg border border-input px-2" defaultValue={row?.questionnaire.ukResident || "Yes"}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </label>
      <Button type="submit">Submit CDD questionnaire</Button>
    </form>
  );
}

export function CmsPanel({ pages, onSaved }: { pages: CmsPage[]; onSaved: (message: string) => void }) {
  const [id, setId] = useState(pages[0]?.id ?? "");
  const current = pages.find((page) => page.id === id) ?? pages[0];
  const [title, setTitle] = useState(current?.title ?? "");
  const [seoTitle, setSeoTitle] = useState(current?.seoTitle ?? "");
  const [description, setDescription] = useState(current?.description ?? "");
  const [html, setHtml] = useState(current?.html ?? "");
  const [published, setPublished] = useState(current?.published ?? true);
  useEffect(() => {
    const page = pages.find((row) => row.id === id) ?? pages[0];
    setTitle(page?.title ?? "");
    setSeoTitle(page?.seoTitle ?? "");
    setDescription(page?.description ?? "");
    setHtml(page?.html ?? "");
    setPublished(page?.published ?? true);
  }, [id, pages]);
  return (
    <div className="space-y-4">
      <form
        className="grid gap-2 rounded-xl border border-border bg-white p-5 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await post("cms/", {
            slug: String(data.get("slug")),
            kind: String(data.get("kind")),
            title: String(data.get("title")),
            seoTitle: String(data.get("seoTitle") || data.get("title")),
            description: String(data.get("description") || ""),
            html: String(data.get("html") || ""),
            published: true,
          });
          onSaved("New CMS record published.");
          event.currentTarget.reset();
        }}
      >
        <h2 className="font-heading text-lg font-semibold sm:col-span-2">Add page, FAQ, testimonial or post</h2>
        <Input name="slug" placeholder="slug (contact-us, faq-fees)" required />
        <select name="kind" className="h-9 rounded-lg border border-input px-2 text-sm">
          {["page", "post", "faq", "testimonial", "banner", "home"].map((kind) => (
            <option key={kind}>{kind}</option>
          ))}
        </select>
        <Input name="title" placeholder="Title / question / person" required />
        <Input name="seoTitle" placeholder="SEO title" />
        <Input name="description" className="sm:col-span-2" placeholder="SEO description" />
        <Textarea name="html" className="min-h-24 sm:col-span-2" placeholder="Body or quote" />
        <Button type="submit" className="sm:col-span-2">
          Publish new
        </Button>
      </form>
      <form
        className="space-y-3 rounded-xl border border-border bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          await post("cms/", { ...current, title, seoTitle, description, html, published });
          onSaved("CMS page published. The live site uses this copy without a deploy.");
        }}
      >
        <h2 className="font-heading text-lg font-semibold">Edit published copy</h2>
        <select className="h-9 w-full rounded-lg border border-input px-2 text-sm" value={current?.id} onChange={(e) => setId(e.target.value)}>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.kind} · /{page.slug}/ {page.published ? "" : "(draft)"}
            </option>
          ))}
        </select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="SEO description" />
        <Textarea className="min-h-40" value={html} onChange={(e) => setHtml(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
        </label>
        <Button type="submit">Save and publish</Button>
      </form>
    </div>
  );
}

export function PackagePanel({ onSaved }: { onSaved: (message: string) => void }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [error, setError] = useState("");
  async function reload() {
    const data = await api("packages/");
    setPackages((data.packages as Package[]) || []);
  }
  useEffect(() => {
    reload().catch((err: Error) => setError(err.message));
  }, []);
  return (
    <section className="space-y-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <form
        className="grid gap-2 rounded-xl border border-border bg-white p-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name"));
          const slug = String(data.get("slug") || name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          await post("packages/", {
            ...PACKAGES[0],
            id: slug,
            slug,
            name,
            groupId: String(data.get("groupId")),
            clientType: String(data.get("clientType") || "Limited company"),
            monthlyPrice: Number(data.get("monthlyPrice") || 0) || null,
            annualPrice: Number(data.get("annualPrice") || 0) || null,
            description: String(data.get("description") || ""),
            isActive: true,
          });
          onSaved("Package created. Public prices update from the database.");
          await reload();
          event.currentTarget.reset();
        }}
      >
        <h2 className="font-heading text-lg font-semibold sm:col-span-2">Add package</h2>
        <Input name="name" placeholder="Name" required />
        <Input name="slug" placeholder="slug" />
        <Input name="monthlyPrice" type="number" step="0.01" placeholder="Monthly £" />
        <Input name="annualPrice" type="number" step="0.01" placeholder="Annual £" />
        <select name="groupId" className="h-9 rounded-lg border border-input px-2 text-sm">
          {PACKAGE_GROUPS.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <Input name="clientType" placeholder="Client type" defaultValue="Limited company" />
        <Textarea name="description" className="sm:col-span-2" placeholder="Description" />
        <Button type="submit" className="sm:col-span-2">
          Create package
        </Button>
      </form>
      {packages.map((pkg) => (
        <form
          key={pkg.id}
          className="rounded-xl border border-border bg-white p-4 text-sm"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            await post("packages/", {
              ...pkg,
              name: String(data.get("name")),
              monthlyPrice: Number(data.get("monthlyPrice") || 0) || null,
              annualPrice: Number(data.get("annualPrice") || 0) || null,
              description: String(data.get("description")),
              isActive: data.get("active") === "on",
            });
            onSaved(`${pkg.name} saved.`);
            await reload();
          }}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Input name="name" defaultValue={pkg.name} />
            <Input name="monthlyPrice" type="number" step="0.01" defaultValue={pkg.monthlyPrice ?? ""} />
            <Input name="annualPrice" type="number" step="0.01" defaultValue={pkg.annualPrice ?? ""} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={pkg.isActive} /> Active (untick to archive)
            </label>
          </div>
          <Textarea name="description" className="mt-2" defaultValue={pkg.description} />
          <div className="mt-2 flex gap-2">
            <Button type="submit">Save</Button>
            {pkg.isActive ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void post("packages/", { ...pkg, isActive: false }).then(() => reload()).then(() => onSaved("Archived."))}
              >
                Archive
              </Button>
            ) : (
              <Button type="button" onClick={() => void post("packages/", { ...pkg, isActive: true }).then(() => reload()).then(() => onSaved("Activated."))}>
                Activate
              </Button>
            )}
          </div>
        </form>
      ))}
    </section>
  );
}

export function PromosPanel({ snapshot, onSaved }: { snapshot: PracticeDump; onSaved: (message: string) => void }) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <h2 className="font-heading text-lg font-semibold">Promotions</h2>
      <form
        className="grid gap-2 sm:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await post("promo/", {
            code: String(data.get("code")),
            kind: String(data.get("kind")),
            amount: Number(data.get("amount") || 0),
            usageLimit: data.get("usageLimit") ? Number(data.get("usageLimit")) : null,
            expiresAt: data.get("expiresAt") ? new Date(String(data.get("expiresAt"))).toISOString() : null,
            active: true,
          });
          onSaved("Promo saved.");
          event.currentTarget.reset();
        }}
      >
        <Input name="code" placeholder="CODE" required />
        <select name="kind" className="h-9 rounded-lg border border-input px-2 text-sm">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed £</option>
        </select>
        <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
        <Input name="usageLimit" type="number" placeholder="Usage limit" />
        <Input name="expiresAt" type="date" className="sm:col-span-2" />
        <Button type="submit" className="sm:col-span-2">
          Create or update promo
        </Button>
      </form>
      <ul className="space-y-2 text-sm">
        {snapshot.promos.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
            <span>
              <strong>{row.code}</strong> · {row.kind} {row.amount} · used {row.used}/{row.usageLimit ?? "∞"} · {row.active ? "active" : "off"}
            </span>
            <Button
              variant="outline"
              className="h-8"
              onClick={() => void post("promo/", { ...row, active: !row.active }).then(() => onSaved(`${row.code} ${row.active ? "turned off" : "turned on"}.`))}
            >
              {row.active ? "Deactivate" : "Activate"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AutomationPanel({ snapshot, onSaved }: { snapshot: PracticeDump; onSaved: (message: string) => void }) {
  const rule = snapshot.automations[0];
  const [steps, setSteps] = useState(rule?.steps ?? []);
  useEffect(() => setSteps(rule?.steps ?? []), [rule?.id, rule?.steps.length]);
  if (!rule) return <p className="text-sm text-muted-foreground">No automation rules yet.</p>;
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <h2 className="font-heading text-lg font-semibold">Service automation</h2>
      <p className="text-sm text-muted-foreground">
        Ordered steps run after Stripe (or mock) payment. This is a step list, not a Zapier canvas.
      </p>
      <ol className="space-y-2 text-sm">
        {steps.map((step, index) => (
          <li key={step.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
            <span className="w-6">{index + 1}.</span>
            <Input
              className="flex-1"
              value={step.label}
              onChange={(e) => setSteps(steps.map((item) => (item.id === step.id ? { ...item, label: e.target.value } : item)))}
            />
            <Input
              className="w-24"
              type="number"
              value={step.delayHours}
              onChange={(e) => setSteps(steps.map((item) => (item.id === step.id ? { ...item, delayHours: Number(e.target.value || 0) } : item)))}
            />
            <span className="text-xs text-muted-foreground">hours delay</span>
            <Button variant="outline" className="h-8" type="button" onClick={() => setSteps(steps.filter((item) => item.id !== step.id))}>
              Remove
            </Button>
          </li>
        ))}
      </ol>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSteps([
            ...steps,
            {
              id: `s_${Date.now()}`,
              action: String(data.get("action")) as (typeof ACTIONS)[number],
              label: String(data.get("label")),
              delayHours: Number(data.get("delayHours") || 0),
            },
          ]);
          event.currentTarget.reset();
        }}
      >
        <select name="action" className="h-9 rounded-lg border border-input px-2 text-sm">
          {ACTIONS.map((action) => (
            <option key={action}>{action}</option>
          ))}
        </select>
        <Input name="label" placeholder="Step label" required />
        <Input name="delayHours" className="w-24" type="number" placeholder="Hours" />
        <Button type="submit" variant="outline">
          Add step
        </Button>
      </form>
      <Button
        onClick={() =>
          void post("automation/", { id: rule.id, name: rule.name, packageId: rule.packageId, active: rule.active, steps }).then(() =>
            onSaved("Automation steps saved."),
          )
        }
      >
        Save rule
      </Button>
    </section>
  );
}

export function UsersPanel({
  users,
  actor,
  onSaved,
}: {
  users: PublicUser[];
  actor: PublicUser;
  onSaved: (message: string) => void;
}) {
  const roles = ["admin", "staff", "accountant", "marketing", "developer", "client"] as const;
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <h2 className="font-heading text-lg font-semibold">Users</h2>
      <form
        className="grid gap-2 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          await post("users/", {
            name: String(data.get("name")),
            email: String(data.get("email")),
            role: String(data.get("role")),
            password: String(data.get("password")),
          });
          onSaved("User created.");
          event.currentTarget.reset();
        }}
      >
        <Input name="name" placeholder="Name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <select name="role" className="h-9 rounded-lg border border-input px-2 text-sm">
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
          {actor.role === "super_admin" ? <option value="super_admin">Super Admin</option> : null}
        </select>
        <Input name="password" type="password" placeholder="Temporary password (10+ characters, letter and number)" required minLength={10} />
        <Button type="submit" className="sm:col-span-2">
          Create user
        </Button>
      </form>
      <ul className="space-y-2 text-sm">
        {users.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
            <span>
              {row.name} · {row.email} · {roleLabel(row.role)}
            </span>
            <select
              className="h-9 rounded-lg border border-input px-2"
              defaultValue={row.role}
              disabled={row.role === "super_admin" && actor.role !== "super_admin"}
              onChange={(e) => void post("users/role/", { userId: row.id, role: e.target.value }).then(() => onSaved("Role updated."))}
            >
              {["super_admin", ...roles].map((role) => (
                <option key={role} value={role} disabled={role === "super_admin" && actor.role !== "super_admin"}>
                  {roleLabel(role as PublicUser["role"])}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProfilePanel({
  user,
  snapshot,
  onboarding,
  onSaved,
}: {
  user: PublicUser;
  snapshot: PracticeDump;
  onboarding: ReturnType<typeof profileProgress>;
  onSaved: (message: string) => void;
}) {
  const profile = snapshot.profiles.find((row) => row.userId === user.id);
  const jobs = snapshot.jobs;
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground uppercase">Onboarding</p>
          <p className="mt-1 text-2xl font-semibold">{onboarding.percent}%</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground uppercase">Personal</p>
          <p className="mt-1 text-2xl font-semibold">{onboarding.personalPercent}%</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground uppercase">Business</p>
          <p className="mt-1 text-2xl font-semibold">{onboarding.businessPercent}%</p>
        </div>
      </div>
      {onboarding.outstanding.length ? (
        <p className="text-sm text-muted-foreground">Still needed: {onboarding.outstanding.join(", ")}.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Profile complete. Continue outstanding tax tasks in the tax portal.</p>
      )}
      <form
        className="grid gap-3 rounded-xl border border-border bg-white p-5 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const body: Record<string, string> = {};
          for (const field of PROFILE_FIELDS) body[field.key] = String(data.get(field.key) || "");
          await post("profile/", body);
          onSaved("Profile saved.");
        }}
      >
        {PROFILE_FIELDS.map((field) => (
          <label key={field.key} className="text-sm">
            {field.label}
            <Input name={field.key} className="mt-1" defaultValue={String(profile?.[field.key] || "")} />
          </label>
        ))}
        <Button type="submit" className="sm:col-span-2">
          Save profile
        </Button>
      </form>
      {jobs.length ? (
        <p className="text-sm">
          Open jobs: {jobs.map((job) => `${job.packageName} (${job.progress}%)`).join(", ")}.
        </p>
      ) : null}
    </section>
  );
}

export function DocumentsPanel({ onSaved }: { onSaved: (message: string) => void }) {
  const [result, setResult] = useState<string>("");
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h2 className="font-heading text-lg font-semibold">AI document check</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Classification uses the file name (P60, bank statement, ID). Confidence is a score, not a biometric check. Client
        uploads in the tax vault already run this automatically.
      </p>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const json = await post("classify/", { fileName: String(data.get("fileName")), mime: String(data.get("mime") || "") });
          setResult(
            `${json.label} · ${json.confidence} (${json.confidenceScore}%). Missing: ${((json.missing as string[]) || []).join(", ") || "none"}.`,
          );
          onSaved("Document classified.");
        }}
      >
        <Input name="fileName" placeholder="P60-2025.pdf" required />
        <Input name="mime" placeholder="application/pdf" />
        <Button type="submit">Classify</Button>
      </form>
      {result ? <p className="mt-3 text-sm">{result}</p> : null}
    </section>
  );
}

export function BillingPanel({ snapshot }: { snapshot: PracticeDump }) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-5">
      <h2 className="font-heading text-lg font-semibold">Invoices and subscriptions</h2>
      <ul className="space-y-2 text-sm">
        {snapshot.invoices.map((row) => (
          <li key={row.id}>
            {row.number} · {row.packageName} · £{row.amountGbp.toFixed(2)} · {row.status}
          </li>
        ))}
      </ul>
      <ul className="space-y-2 text-sm">
        {snapshot.subscriptions.map((row) => (
          <li key={row.id}>
            {row.packageId} · {row.interval} · {row.status}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{snapshot.settings.cancelPolicy}</p>
    </section>
  );
}
