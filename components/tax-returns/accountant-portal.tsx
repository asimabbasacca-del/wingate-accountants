"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ListedOrder, OrderBundle, PublicUser } from "@/lib/tax-returns/types";
import { api, type StatePayload } from "./api";
import { money } from "./helpers";
import { ContactCard } from "./contact-card";
import { PortalShell } from "./portal-shell";

export function AccountantPortal() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [orders, setOrders] = useState<ListedOrder[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [bundle, setBundle] = useState<OrderBundle | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadList() {
    const me = await api<{ user: PublicUser | null; orders: ListedOrder[] }>("auth/me");
        if (!me.user) {
      router.replace("/sign-in/");
      return;
    }
    if (me.user.role !== "accountant") {
      router.replace("/portal/tax-returns/");
      return;
    }
    setUser(me.user);
    setOrders(me.orders ?? []);
    const first = selected ?? me.orders?.[0]?.id ?? null;
    if (first) await loadBundle(first);
  }

  async function loadBundle(orderId: string) {
    setSelected(orderId);
    const next = await api<StatePayload>(`state?orderId=${orderId}`);
    setBundle(next.bundle);
  }

  useEffect(() => {
    void loadList().catch((err) => setError(err instanceof Error ? err.message : "Could not load"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      if (selected) await loadBundle(selected);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell title="Your client files" email={user?.email} variant="accountant">
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="space-y-2">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => void loadBundle(order.id)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${selected === order.id ? "border-primary bg-card" : "border-border"}`}
            >
              <span className="block font-medium">{order.clientName ?? order.id.slice(0, 14)}</span>
              <span className="text-xs text-muted-foreground">{order.status.replaceAll("_", " ")}</span>
            </button>
          ))}
        </aside>
        {bundle ? (
          <div className="space-y-5">
            <header className="rounded-2xl border border-border p-5">
              <ContactCard
                viewer="accountant"
                clientName={bundle.client?.name}
                clientEmail={bundle.client?.email}
              />
              <p className="mt-4 text-sm">
                {bundle.order.taxYear} · {bundle.order.status.replaceAll("_", " ")} · AML {bundle.aml?.status}
              </p>
            </header>
            <section className="rounded-2xl border border-border p-5">
              <h2 className="font-heading text-lg font-semibold">Questionnaire</h2>
              {bundle.questionnaire ? (
                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                  <div>NINO {bundle.questionnaire.answers.nino || "—"}</div>
                  <div>Employment {money(bundle.questionnaire.answers.employmentPay)}</div>
                  <div>Self-employed profit {money(bundle.questionnaire.answers.selfEmploymentTurnover - bundle.questionnaire.answers.selfEmploymentExpenses)}</div>
                  <div>CIS {money(bundle.questionnaire.answers.cisGross)}</div>
                  <div>Rental {money(bundle.questionnaire.answers.rentalIncome)}</div>
                  <div>Dividends {money(bundle.questionnaire.answers.dividends)}</div>
                  <div>Estimate {bundle.questionnaire.estimate ? money(bundle.questionnaire.estimate.netPosition) : "—"}</div>
                </dl>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No answers yet.</p>
              )}
            </section>
            <section className="rounded-2xl border border-border p-5">
              <h2 className="font-heading text-lg font-semibold">Documents</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {bundle.documents.map((doc) => (
                  <li key={doc.id}>
                    <a className="underline" href={`/api/tax-returns/files/?id=${doc.fileId}`}>{doc.fileName}</a> ({doc.kind})
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-border p-5">
              <h2 className="font-heading text-lg font-semibold">Messages with {bundle.client?.name ?? "the client"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">This is a direct thread with the client on this tax file.</p>
              <div className="mt-2 space-y-2 text-sm">
                {bundle.messages.map((item) => (
                  <p key={item.id} className="rounded-lg bg-muted px-3 py-2">
                    <span className="font-medium">
                      {item.authorRole === "accountant" ? "You" : bundle.client?.name ?? "Client"}:{" "}
                    </span>
                    {item.body}
                  </p>
                ))}
              </div>
              <Textarea className="mt-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Message ${bundle.client?.name ?? "the client"} or add a file note`} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void run(async () => { await api("aml/review", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, status: "approved", notes: "Pack reviewed" }) }); })}
                >
                  Approve AML
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !note.trim()}
                  onClick={() => void run(async () => { await api("accountant/request-info", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, body: note }) }); setNote(""); })}
                >
                  Request missing info
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => void run(async () => { await api("accountant/prepare", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, narrative: note }) }); })}
                >
                  Prepare return
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => void run(async () => { await api("hmrc/submit", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) }); })}
                >
                  File with HMRC
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy || !note.trim()}
                  onClick={() => void run(async () => { await api("messages", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, body: note }) }); setNote(""); })}
                >
                  Send to client
                </Button>
              </div>
            </section>
            {bundle.submission?.receiptId ? (
              <p className="text-sm">Receipt: {bundle.submission.receiptId}. {bundle.submission.detail}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a client file.</p>
        )}
      </div>
    </PortalShell>
  );
}
