import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { nowIso } from "./crypto";
import { saveBinary } from "./files";
import { getPlan } from "./plans";
import { store } from "./store";
import { SITE } from "@/lib/site";
import type { EngagementLetter, TaxReturnOrder, User } from "./types";

const NAVY = rgb(0.12, 0.18, 0.32);
const GOLD = rgb(0.72, 0.55, 0.22);

async function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > max) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildEngagementPdf(order: TaxReturnOrder, client: User, letter: EngagementLetter): Promise<Buffer> {
  const plan = getPlan(order.planId);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: NAVY });
  page.drawRectangle({ x: 0, y: height - 96, width, height: 6, color: GOLD });
  page.drawText(SITE.legalName.toUpperCase(), { x: 48, y: height - 42, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Letter of engagement — Self Assessment", { x: 48, y: height - 64, size: 11, font, color: rgb(0.93, 0.9, 0.8) });

  let y = height - 130;
  const body = [
    `Date: ${new Date().toLocaleDateString("en-GB")}`,
    `Client: ${client.name}  ·  ${client.email}`,
    `Tax year: ${order.taxYear}`,
    `Service: ${plan?.name ?? "Self Assessment"} (${plan?.priceLabel ?? ""})`,
    "",
    "This letter sets out the work Wingate Accountants Limited will do for your personal Self Assessment return. It is not a copy of another firm’s terms.",
    "",
    "1. Scope. We will collect your answers and documents, prepare the Self Assessment, discuss the computation with you, and file with HMRC once you approve. Making Tax Digital for Income Tax (MTD) bridging is in development; until live MTD credentials are connected, a filing receipt is stored in your portal from the HMRC submission service used in this module.",
    "2. Your responsibilities. You confirm the figures and documents are complete and accurate. You remain legally responsible for the return.",
    "3. Identity checks. UK money-laundering rules require one photo identity document and two proofs of address from the last three months before we can file.",
    "4. Fees. The fee for the selected plan is payable before work starts. Additional work (enquiries, prior-year amendments, unprompted disclosures) is quoted separately.",
    "5. Limit of engagement. We prepare the return from information you supply. We do not audit source records unless you ask us to in writing.",
    "6. Data. Personal data is processed under our privacy policy and retained with the tax file as required by HMRC and AML rules.",
    "7. Signature. Drawing your name below is your electronic signature of this letter for the tax year stated.",
    "",
    SITE.address,
    `Company ${SITE.companyNumber}  ·  ICO ${SITE.ico}`,
    SITE.email,
  ];
  for (const paragraph of body) {
    const lines = paragraph ? await wrapText(paragraph, font, 10, width - 96) : [""];
    for (const line of lines) {
      if (y < 80) break;
      page.drawText(line, { x: 48, y, size: 10, font, color: NAVY });
      y -= 14;
    }
    y -= 4;
  }
  page.drawText("Client electronic signature", { x: 48, y: 70, size: 9, font: bold, color: NAVY });
  if (letter.signatureDataUrl) {
    try {
      const raw = letter.signatureDataUrl.split(",")[1];
      const bytes = Buffer.from(raw, "base64");
      const image = await pdf.embedPng(bytes);
      page.drawImage(image, { x: 48, y: 18, width: 160, height: 44 });
    } catch {
      page.drawText(letter.signerName ?? client.name, { x: 48, y: 40, size: 12, font, color: NAVY });
    }
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export const EngagementLetterService = {
  async generate(orderId: string): Promise<EngagementLetter> {
    const letter = await store.getLetter(orderId);
    const order = await store.getOrder(orderId);
    if (!letter || !order) throw new Error("Engagement letter missing");
    const client = await store.getUser(order.userId);
    if (!client) throw new Error("Client missing");
    const next = { ...letter, status: "generated" as const, generatedAt: nowIso() };
    const pdf = await buildEngagementPdf(order, client, next);
    const file = await store.addFile({
      orderId,
      originalName: `engagement-${order.taxYear}.pdf`,
      mimeType: "application/pdf",
      size: pdf.length,
    });
    await saveBinary(file.id, pdf);
    next.pdfFileId = file.id;
    await store.saveLetter(next);
    if (["aml_submitted", "engagement_pending", "paid"].includes(order.status)) {
      await store.saveOrder({ ...order, status: "engagement_pending" });
    }
    return next;
  },

  async sign(orderId: string, signerName: string, signatureDataUrl: string): Promise<EngagementLetter> {
    const letter = await store.getLetter(orderId);
    const order = await store.getOrder(orderId);
    if (!letter || !order) throw new Error("Engagement letter missing");
    if (!signatureDataUrl) throw new Error("Please draw your signature");
    const client = await store.getUser(order.userId);
    if (!client) throw new Error("Client missing");
    const signed: EngagementLetter = {
      ...letter,
      status: "signed",
      signerName,
      signatureDataUrl,
      signedAt: nowIso(),
    };
    const pdf = await buildEngagementPdf(order, client, signed);
    const file = await store.addFile({
      orderId,
      originalName: `engagement-signed-${order.taxYear}.pdf`,
      mimeType: "application/pdf",
      size: pdf.length,
    });
    await saveBinary(file.id, pdf);
    signed.pdfFileId = file.id;
    await store.saveLetter(signed);
    await store.saveOrder({ ...order, status: "engagement_signed" });
    return signed;
  },
};
