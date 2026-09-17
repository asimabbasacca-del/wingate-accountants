import { randomUUID } from "node:crypto";
import { monthsAgo, nowIso } from "./crypto";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, parseDataUrl, saveBinary } from "./files";
import { store } from "./store";
import type { AMLVerification, AmlDocument, OrderStatus } from "./types";

function assertUpload(dataUrl: string, fileName: string): { bytes: Buffer; mimeType: string } {
  const { bytes, mimeType } = parseDataUrl(dataUrl);
  if (bytes.length > MAX_UPLOAD_BYTES) throw new Error("Each file must be 8MB or smaller");
  if (!ALLOWED_UPLOAD_TYPES.has(mimeType)) throw new Error(`File type not accepted for ${fileName}`);
  return { bytes, mimeType };
}

async function storeUpload(orderId: string, fileName: string, dataUrl: string): Promise<AmlDocument["fileId"]> {
  const { bytes, mimeType } = assertUpload(dataUrl, fileName);
  const file = await store.addFile({ orderId, originalName: fileName, mimeType, size: bytes.length });
  await saveBinary(file.id, bytes);
  return file.id;
}

export const AmlService = {
  async submit(
    orderId: string,
    input: {
      idKind: "passport" | "driving_licence";
      idFileName: string;
      idDataUrl: string;
      poa: { kind: string; fileName: string; dated: string; dataUrl: string }[];
      selfieFileName?: string;
      selfieDataUrl?: string;
    },
  ): Promise<AMLVerification> {
    const aml = await store.getAml(orderId);
    if (!aml) throw new Error("AML record missing");
    if (input.poa.length !== 2) throw new Error("Upload two proofs of address from the last three months");
    for (const proof of input.poa) {
      if (!monthsAgo(proof.dated, 3)) throw new Error(`${proof.fileName} must be dated within the last three months`);
    }
    const idFileId = await storeUpload(orderId, input.idFileName, input.idDataUrl);
    const proofs: AmlDocument[] = [];
    for (const proof of input.poa) {
      const fileId = await storeUpload(orderId, proof.fileName, proof.dataUrl);
      proofs.push({ kind: proof.kind, fileId, fileName: proof.fileName, dated: proof.dated });
    }
    let selfie: AmlDocument | null = null;
    if (input.selfieDataUrl && input.selfieFileName) {
      const fileId = await storeUpload(orderId, input.selfieFileName, input.selfieDataUrl);
      selfie = { kind: "selfie", fileId, fileName: input.selfieFileName };
    }
    const next: AMLVerification = {
      ...aml,
      idDocument: { kind: input.idKind, fileId: idFileId, fileName: input.idFileName },
      proofsOfAddress: proofs,
      selfie,
      status: "submitted",
      riskBand: selfie ? "low" : "medium",
      submittedAt: nowIso(),
    };
    await store.saveAml(next);
    const order = await store.getOrder(orderId);
    if (order && ["paid", "aml_pending"].includes(order.status)) {
      await store.saveOrder({ ...order, status: "aml_submitted" as OrderStatus });
    }
    return next;
  },

  async review(orderId: string, status: "approved" | "rejected", notes: string, reviewerId: string): Promise<AMLVerification> {
    const aml = await store.getAml(orderId);
    if (!aml) throw new Error("AML record missing");
    const next: AMLVerification = {
      ...aml,
      status,
      staffNotes: notes,
      reviewedAt: nowIso(),
    };
    await store.saveAml(next);
    await store.addNote({
      id: `note_${randomUUID()}`,
      firmId: aml.firmId,
      orderId,
      authorId: reviewerId,
      kind: "note",
      body: `AML ${status}. ${notes}`.trim(),
      createdAt: nowIso(),
    });
    return next;
  },
};
