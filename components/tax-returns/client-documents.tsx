"use client";

import { Button } from "@/components/ui/button";
import { api } from "./api";
import { fileToDataUrl } from "./helpers";
import { PortalShell } from "./portal-shell";
import { useTaxPortal } from "./use-tax-portal";

export function ClientDocuments() {
  const { payload, error, busy, run } = useTaxPortal("/sign-in/?next=/portal/tax-returns/documents/");
  const bundle = payload?.bundle;
  const dash = payload?.dashboard;

  if (!payload?.user) {
    return (
      <PortalShell title="Documents">
        <p className="text-sm text-muted-foreground">{error || "Loading your document vault…"}</p>
      </PortalShell>
    );
  }

  if (!bundle) {
    return (
      <PortalShell title="Document vault" email={payload.user.email}>
        <p className="text-sm text-muted-foreground">Purchase a package to open a vault for this tax year.</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Document vault" email={payload.user.email}>
      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <p className="text-sm text-muted-foreground">
        Files stay on your Wingate tax file. Uploads are classified from the file name so your accountant sees a suggested
        type.
      </p>
      {dash?.missingDocuments.length ? (
        <div className="mt-4 rounded-xl border border-accent/40 bg-card p-4">
          <p className="text-sm font-medium">Still expected</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {dash.missingDocuments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">The missing-document checker has nothing extra to ask for.</p>
      )}
      <ul className="mt-6 space-y-2 text-sm">
        {bundle.letter?.pdfFileId ? (
          <li>
            <a className="text-primary underline" href={`/api/tax-returns/files/?id=${bundle.letter.pdfFileId}`}>
              Engagement letter
            </a>
          </li>
        ) : bundle.letter?.status === "signed" ? (
          <li>Engagement letter signed</li>
        ) : (
          <li className="text-muted-foreground">Engagement letter not generated yet</li>
        )}
        {bundle.submission?.sa100FileId ? (
          <li>
            <a className="text-primary underline" href={`/api/tax-returns/files/?id=${bundle.submission.sa100FileId}`}>
              Tax return working copy (SA100)
            </a>
          </li>
        ) : null}
        {bundle.submission?.sa302FileId ? (
          <li>
            <a className="text-primary underline" href={`/api/tax-returns/files/?id=${bundle.submission.sa302FileId}`}>
              HMRC calculation (SA302)
            </a>
          </li>
        ) : null}
        {bundle.submission?.receiptId ? <li>HMRC receipt {bundle.submission.receiptId}</li> : <li className="text-muted-foreground">No HMRC receipt yet</li>}
        {bundle.documents.map((doc) => (
          <li key={doc.id}>
            <a className="underline" href={`/api/tax-returns/files/?id=${doc.fileId}`}>
              {doc.fileName}
            </a>
            <span className="text-muted-foreground">
              {" "}
              · {doc.classifiedAs} ({doc.classificationConfidence} confidence)
            </span>
          </li>
        ))}
      </ul>
      <label className="mt-6 block text-sm">
        Upload to the vault
        <input
          className="mt-1 block w-full text-sm"
          type="file"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            void run(async () => {
              await api("documents", {
                method: "POST",
                body: JSON.stringify({
                  orderId: bundle.order.id,
                  kind: "other",
                  fileName: file.name,
                  dataUrl: await fileToDataUrl(file),
                }),
              });
            });
          }}
        />
      </label>
      {["questionnaire_complete", "documents_pending", "info_requested"].includes(bundle.order.status) ? (
        <Button
          className="mt-4 h-10"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await api("documents/complete", { method: "POST", body: JSON.stringify({ orderId: bundle.order.id }) });
            })
          }
        >
          Send vault to my accountant
        </Button>
      ) : null}
    </PortalShell>
  );
}
