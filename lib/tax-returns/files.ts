import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./paths";
import { readBlobFromPostgres, saveBlobToPostgres } from "./pg-store";
import { isSafeFileId } from "@/lib/security/html";

const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function saveBinary(fileId: string, bytes: Buffer, mimeType = "application/octet-stream"): Promise<string> {
  if (!isSafeFileId(fileId)) throw new Error("Invalid file id");
  if (await saveBlobToPostgres(fileId, bytes, mimeType)) return fileId;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const dest = path.join(UPLOAD_DIR, fileId);
  await writeFile(dest, bytes);
  return dest;
}

export async function readBinary(fileId: string): Promise<Buffer> {
  if (!isSafeFileId(fileId)) throw new Error("Invalid file id");
  const remote = await readBlobFromPostgres(fileId);
  if (remote) return remote;
  return readFile(path.join(UPLOAD_DIR, fileId));
}

export function parseDataUrl(dataUrl: string): { mimeType: string; bytes: Buffer } {
  if (!dataUrl || dataUrl.length > MAX_UPLOAD_BYTES * 2) throw new Error("Each file must be 8MB or smaller");
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Upload must be a data URL");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new Error("Each file must be 8MB or smaller");
  return { mimeType: match[1].slice(0, 120), bytes };
}
