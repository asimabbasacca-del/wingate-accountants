"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLANS, type Plan } from "@/lib/tax-returns/plans";
import type { OrderBundle, TaxDocumentKind } from "@/lib/tax-returns/types";
import { suggestedDocuments } from "@/lib/tax-returns/questionnaire";
import { api, type StatePayload } from "./api";
import { fileToDataUrl, money } from "./helpers";
import { PortalShell } from "./portal-shell";
import { QuestionnaireForm } from "./questionnaire-form";
import { SignaturePad } from "./signature-pad";
import { Stepper } from "./stepper";

const STEPS = [
  { id: "plan", label: "Plan" },
  { id: "pay", label: "Payment" },
  { id: "aml", label: "Identity" },
  { id: "letter", label: "Engagement" },
  { id: "questions", label: "Questions" },
  { id: "docs", label: "Documents" },
];

function stepOf(bundle: OrderBundle): string {
  const { order, aml, letter, questionnaire } = bundle;
  if (!order.planId) return "plan";
  if (order.payment.status !== "paid") return "pay";
  if (!aml || aml.status === "not_started") return "aml";
  if (!letter || letter.status !== "signed") return "letter";
  if (!questionnaire?.completedAt) return "questions";
  if (order.status === "documents_pending" || order.status === "questionnaire_complete") return "docs";
  return "done";
}

export function OnboardingWizard() {
  const router = useRouter();
  const search = useSearchParams();
  const [payload, setPayload] = useState<StatePayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");

  async function refresh() {
    const next = await api<StatePayload>("state");
    setPayload(next);
    return next;
  }

  useEffect(() => {
    void (async () => {
      try {
        const next = await refresh();
        if (!next.user) {
          router.replace("/sign-in/?next=/tax-returns/onboarding/");
          return;
        }
        if (next.user.role === "accountant") {
          router.replace("/portal/accountant/");
          return;
        }
        if (!next.bundle) {
          await api("orders/start", {
            method: "POST",
            body: JSON.stringify({ planId: search.get("plan") || undefined }),
          });
          await refresh();
        } else if (search.get("plan") && !next.bundle.order.planId) {
          await api("orders/plan", {
            method: "POST",
            body: JSON.stringify({ orderId: next.bundle.order.id, planId: search.get("plan") }),
          });
          await refresh();
        }
        if (search.get("paid") === "1" && next.bundle && next.bundle.order.payment.status !== "paid") {
          await api("payments/confirm", {
            method: "POST",
            body: JSON.stringify({ orderId: next.bundle.order.id, sessionId: next.bundle.order.payment.sessionId }),
          });
          await refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load onboarding");
      }
    })();
  }, [router, search]);

  const bundle = payload?.bundle;
  const current = bundle ? stepOf(bundle) : "plan";

  useEffect(() => {
    if (payload?.user?.name && !cardName) setCardName(payload.user.name);
  }, [payload?.user?.name, cardName]);

  useEffect(() => {
    if (current === "done" && bundle) router.replace("/portal/tax-returns/");
  }, [current, bundle, router]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      throw err;
    } finally {
      setBusy(false);
    }
  }

  if (!payload?.user || !bundle) {
    return (
      <PortalShell title="Start your tax return" variant="onboarding">
        <p className="text-sm text-muted-foreground">{error || "Loading your file…"}</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Your 2025–26 tax return" email={payload.user.email} variant="onboarding">
      <Stepper steps={STEPS} current={current === "done" ? "docs" : current} />
      {error ? <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      {current === "plan" ? (
        <section className="mt-8 space-y-4">
          <h1 className="font-heading text-3xl font-semibold">Choose how we prepare your return</h1>
          <p className="text-sm text-muted-foreground">Individuals only. Limited companies and LLPs use a separate engagement.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {(payload.plans ?? PLANS).map((plan: Plan) => (
              <button
                key={plan.id}
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await api("orders/plan", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id, planId: plan.id }) });
                  })
                }
                className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary"
              >
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{plan.bestFor.split(",")[0]}</p>
                <h2 className="font-heading mt-2 text-xl font-semibold">{plan.name}</h2>
                <p className="mt-2 text-2xl font-semibold">{plan.priceLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {current === "pay" ? (
        <section className="mt-8 max-w-md space-y-4">
          <h1 className="font-heading text-3xl font-semibold">Payment</h1>
          <p className="text-sm text-muted-foreground">
            {bundle.order.amountGbp ? money(bundle.order.amountGbp) : ""} for your selected plan. Stripe Checkout is used when
            keys are configured; otherwise this demo confirms a test payment.
          </p>
          <label className="block text-sm">
            Name on card
            <Input className="mt-1 h-10" value={cardName} onChange={(e) => setCardName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Card number
            <Input className="mt-1 h-10" defaultValue="4242 4242 4242 4242" readOnly />
          </label>
          <Button
            className="h-11 w-full"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const checkout = await api<{ provider: string; url?: string; sessionId: string }>("payments/checkout", {
                  method: "POST",
                  body: JSON.stringify({ orderId: bundle.order.id }),
                });
                if (checkout.provider === "stripe" && checkout.url) {
                  window.location.href = checkout.url;
                  return;
                }
                await api("payments/confirm", {
                  method: "POST",
                  body: JSON.stringify({ orderId: bundle.order.id, sessionId: checkout.sessionId }),
                });
              })
            }
          >
            {busy ? "Taking payment…" : "Pay and continue"}
          </Button>
        </section>
      ) : null}

      {current === "aml" ? <AmlStep orderId={bundle.order.id} busy={busy} onSubmit={(body) => void run(async () => { await api("aml", { method: "POST", body: JSON.stringify(body) }); })} /> : null}

      {current === "letter" ? (
        <section className="mt-8 space-y-4">
          <h1 className="font-heading text-3xl font-semibold">Engagement letter</h1>
          <p className="text-sm text-muted-foreground">
            We generate a Wingate letter of engagement for this tax year. Draw your signature to accept.{" "}
            <Link className="underline" href="/tax-returns/engagement-terms/">Read the terms</Link>.
          </p>
          {bundle.letter?.pdfFileId ? (
            <a className="text-sm font-medium text-primary underline" href={`/api/tax-returns/files/?id=${bundle.letter.pdfFileId}`}>
              Download the letter (PDF)
            </a>
          ) : (
            <Button
              variant="outline"
              className="h-10"
              disabled={busy}
              onClick={() => void run(async () => { await api("engagement/generate", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) }); })}
            >
              Generate letter
            </Button>
          )}
          <SignaturePad onChange={setSignature} />
          <Button
            className="h-11"
            disabled={busy || !signature}
            onClick={() =>
              void run(async () => {
                if (!bundle.letter?.pdfFileId) {
                  await api("engagement/generate", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) });
                }
                await api("engagement/sign", {
                  method: "POST",
                  body: JSON.stringify({
                    orderId: bundle.order.id,
                    signerName: payload.user?.name,
                    signatureDataUrl: signature,
                  }),
                });
              })
            }
          >
            Sign and continue
          </Button>
        </section>
      ) : null}

      {current === "questions" && bundle.questionnaire ? (
        <section className="mt-8">
          <QuestionnaireForm
            initial={bundle.questionnaire.answers}
            estimate={bundle.questionnaire.estimate}
            busy={busy}
            onSave={async (answers, currentSection, complete) => {
              await run(async () => {
                await api("questionnaire", {
                  method: "POST",
                  body: JSON.stringify({ orderId: bundle.order.id, answers, currentSection, complete }),
                });
              });
            }}
          />
        </section>
      ) : null}

      {current === "docs" ? (
        <DocsStep
          bundle={bundle}
          busy={busy}
          onUpload={(kind, file) =>
            void run(async () => {
              const dataUrl = await fileToDataUrl(file);
              await api("documents", {
                method: "POST",
                body: JSON.stringify({ orderId: bundle.order.id, kind, fileName: file.name, dataUrl }),
              });
            })
          }
          onDone={() =>
            void run(async () => {
              await api("documents/complete", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) });
              router.push("/portal/tax-returns/");
            })
          }
        />
      ) : null}
    </PortalShell>
  );
}

function AmlStep({
  orderId,
  busy,
  onSubmit,
}: {
  orderId: string;
  busy: boolean;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [idKind, setIdKind] = useState<"passport" | "driving_licence">("passport");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [poa1, setPoa1] = useState<File | null>(null);
  const [poa2, setPoa2] = useState<File | null>(null);
  const [dated1, setDated1] = useState("");
  const [dated2, setDated2] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);

  async function captureSelfie() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, 640, 480);
    stream.getTracks().forEach((track) => track.stop());
    setSelfie(canvas.toDataURL("image/jpeg"));
  }

  return (
    <section className="mt-8 space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Identity checks</h1>
      <p className="text-sm text-muted-foreground">
        UK AML rules: one passport or driving licence, plus two proofs of address from the last three months. A live selfie is
        optional. Staff confirm the likeness — there is no facial-recognition vendor.{" "}
        <Link className="underline" href="/tax-returns/aml-policy/">AML policy</Link>
      </p>
      <fieldset className="flex gap-2">
        <Button type="button" variant={idKind === "passport" ? "default" : "outline"} onClick={() => setIdKind("passport")}>Passport</Button>
        <Button type="button" variant={idKind === "driving_licence" ? "default" : "outline"} onClick={() => setIdKind("driving_licence")}>Driving licence</Button>
      </fieldset>
      <label className="block text-sm">Photo ID<input className="mt-1 block w-full text-sm" type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} /></label>
      <label className="block text-sm">Proof of address 1<input className="mt-1 block w-full text-sm" type="file" accept="image/*,.pdf" onChange={(e) => setPoa1(e.target.files?.[0] ?? null)} /></label>
      <Input type="date" className="h-10" value={dated1} onChange={(e) => setDated1(e.target.value)} />
      <label className="block text-sm">Proof of address 2<input className="mt-1 block w-full text-sm" type="file" accept="image/*,.pdf" onChange={(e) => setPoa2(e.target.files?.[0] ?? null)} /></label>
      <Input type="date" className="h-10" value={dated2} onChange={(e) => setDated2(e.target.value)} />
      <Button type="button" variant="outline" className="h-10" onClick={() => void captureSelfie()}>
        {selfie ? "Selfie captured" : "Optional live selfie"}
      </Button>
      <Button
        className="h-11 w-full"
        disabled={busy || !idFile || !poa1 || !poa2 || !dated1 || !dated2}
        onClick={() =>
          void (async () => {
            onSubmit({
              orderId,
              idKind,
              idFileName: idFile!.name,
              idDataUrl: await fileToDataUrl(idFile!),
              poa: [
                { kind: "bank_statement", fileName: poa1!.name, dated: dated1, dataUrl: await fileToDataUrl(poa1!) },
                { kind: "utility_bill", fileName: poa2!.name, dated: dated2, dataUrl: await fileToDataUrl(poa2!) },
              ],
              selfieFileName: selfie ? "selfie.jpg" : undefined,
              selfieDataUrl: selfie ?? undefined,
            });
          })()
        }
      >
        Submit identity pack
      </Button>
    </section>
  );
}

function DocsStep({
  bundle,
  busy,
  onUpload,
  onDone,
}: {
  bundle: OrderBundle;
  busy: boolean;
  onUpload: (kind: TaxDocumentKind, file: File) => void;
  onDone: () => void;
}) {
  const suggested = suggestedDocuments(bundle.questionnaire?.answers ?? ({} as never));
  return (
    <section className="mt-8 space-y-4">
      <h1 className="font-heading text-3xl font-semibold">Upload your records</h1>
      <p className="text-sm text-muted-foreground">P60, P45, SA302, bank statements, invoices or a rental spreadsheet. You can finish later in the portal.</p>
      <ul className="space-y-3">
        {suggested.map((item) => (
          <li key={item.kind + item.label} className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium">{item.label}</p>
            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(item.kind, file);
              }}
            />
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{bundle.documents.length} file(s) on this return.</p>
      {bundle.documents.length ? (
        <ul className="space-y-1 text-sm">
          {bundle.documents.map((doc) => (
            <li key={doc.id}>
              {doc.fileName}
              {doc.classifiedAs ? ` · recognised as ${doc.classifiedAs}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <Button className="h-11" disabled={busy} onClick={onDone}>
        Send to my accountant
      </Button>
    </section>
  );
}
