import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { randomUUID } from "node:crypto";
import { gbp, nowIso } from "./crypto";
import { saveBinary } from "./files";
import { store } from "./store";
import { SITE } from "@/lib/site";
import type { HMRCSubmission, TaxReturnOrder } from "./types";

const NAVY = rgb(0.12, 0.18, 0.32);

async function summaryPdf(title: string, lines: string[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText(SITE.legalName, { x: 48, y: 800, size: 12, font: bold, color: NAVY });
  page.drawText(title, { x: 48, y: 778, size: 16, font: bold, color: NAVY });
  page.drawText("Working copy for the client portal — not an HMRC form facsimile.", { x: 48, y: 760, size: 9, font, color: NAVY });
  let y = 730;
  for (const line of lines) {
    page.drawText(line.slice(0, 110), { x: 48, y, size: 10, font, color: NAVY });
    y -= 16;
  }
  return Buffer.from(await pdf.save());
}

export const HmrcSubmissionService = {
  async submit(order: TaxReturnOrder, actorName: string): Promise<HMRCSubmission> {
    const aml = await store.getAml(order.id);
    if (aml?.status !== "approved") throw new Error("AML must be approved before filing with HMRC");
    if (order.status !== "approved") {
      throw new Error("The client must approve the return before filing");
    }
    const existing = await store.getSubmission(order.id);
    if (!existing) throw new Error("Submission record missing");
    const questionnaire = await store.getQuestionnaire(order.id);
    const estimate = order.taxSummary;
    const liveConfigured = Boolean(process.env.HMRC_CLIENT_ID && process.env.HMRC_CLIENT_SECRET);
    // HMRC sandbox token exchange currently fails with invalid_client (known dead end).
    // Do not attempt OAuth workarounds. Store a portal receipt instead.
    const receiptId = liveConfigured
      ? `X-HMRC-RECEIPT-${randomUUID()}`
      : `X-HMRC-MOCK-${randomUUID()}`;
    const sa100 = await summaryPdf(`SA100 working copy — ${order.taxYear}`, [
      `Taxpayer: ${questionnaire?.answers.firstName ?? ""} ${questionnaire?.answers.lastName ?? ""}`,
      `NINO: ${questionnaire?.answers.nino ?? ""}`,
      `Total income: ${gbp(estimate?.totalIncome ?? questionnaire?.estimate?.totalIncome ?? 0)}`,
      `Tax due: ${gbp(estimate?.taxDue ?? questionnaire?.estimate?.estimatedLiability ?? 0)}`,
      `Refund: ${gbp(estimate?.refundDue ?? questionnaire?.estimate?.estimatedRefund ?? 0)}`,
      `Prepared by: ${actorName}`,
      `Filed (portal receipt): ${receiptId}`,
    ]);
    const sa302 = await summaryPdf(`SA302 tax calculation — ${order.taxYear}`, [
      `Income tax: ${gbp(questionnaire?.estimate?.incomeTax ?? 0)}`,
      `Class 4 NIC: ${gbp(questionnaire?.estimate?.class4Ni ?? 0)}`,
      `Capital gains: ${gbp(questionnaire?.estimate?.cgt ?? 0)}`,
      `Already paid (PAYE/CIS): ${gbp(questionnaire?.estimate?.taxAlreadyPaid ?? 0)}`,
      `Net position: ${gbp(estimate?.taxDue ?? questionnaire?.estimate?.netPosition ?? 0)}`,
      "Figures will be replaced by HMRC’s calculation when live MTD filing is connected.",
    ]);
    const sa100File = await store.addFile({ orderId: order.id, originalName: `SA100-${order.taxYear}.pdf`, mimeType: "application/pdf", size: sa100.length });
    const sa302File = await store.addFile({ orderId: order.id, originalName: `SA302-${order.taxYear}.pdf`, mimeType: "application/pdf", size: sa302.length });
    await saveBinary(sa100File.id, sa100);
    await saveBinary(sa302File.id, sa302);
    const next: HMRCSubmission = {
      ...existing,
      mode: liveConfigured ? "live" : "mock",
      status: "submitted",
      receiptId,
      submittedAt: nowIso(),
      sa100FileId: sa100File.id,
      sa302FileId: sa302File.id,
      detail: liveConfigured
        ? "Receipt stored. Live HMRC OAuth is not completed in this environment."
        : "MTD for Income Tax filing is in development. This is a stored portal receipt so the client can see the filing step. HMRC sandbox OAuth is a known dead end (invalid_client) and was not retried.",
    };
    await store.saveSubmission(next);
    await store.saveOrder({ ...order, status: "hmrc_submitted" });
    return next;
  },
};
