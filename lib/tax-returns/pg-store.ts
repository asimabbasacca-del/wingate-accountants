import { FIRM_ID, type DatabaseDump } from "./types";
import { getPool, isNeonConfigured } from "@/lib/packages/db";

export function isPostgresConfigured(): boolean {
  return isNeonConfigured();
}

export async function loadDumpFromPostgres(): Promise<{ ok: boolean; dump: DatabaseDump | null }> {
  if (!isPostgresConfigured()) return { ok: false, dump: null };
  try {
    const result = await getPool().query<{ dump: DatabaseDump }>(
      `select dump from wingate_tax_json_store where firm_id = $1`,
      [FIRM_ID],
    );
    return { ok: true, dump: result.rows[0]?.dump ?? null };
  } catch (error) {
    console.warn("Wingate tax store: Postgres load failed, using local JSON.", error);
    return { ok: false, dump: null };
  }
}

export async function saveDumpToPostgres(dump: DatabaseDump): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  try {
    await getPool().query(
      `insert into wingate_tax_json_store (firm_id, dump, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (firm_id) do update set dump = excluded.dump, updated_at = now()`,
      [FIRM_ID, JSON.stringify(dump)],
    );
    return true;
  } catch (error) {
    console.warn("Wingate tax store: Postgres persist failed, writing local JSON.", error);
    return false;
  }
}

export async function saveBlobToPostgres(fileId: string, bytes: Buffer, mimeType: string): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  try {
    await getPool().query(
      `insert into wingate_tax_file_blobs (id, firm_id, mime_type, bytes)
       values ($1, $2, $3, $4)
       on conflict (id) do update set bytes = excluded.bytes, mime_type = excluded.mime_type`,
      [fileId, FIRM_ID, mimeType, bytes],
    );
    return true;
  } catch (error) {
    console.warn("Wingate tax files: Postgres save failed, writing local disk.", error);
    return false;
  }
}

export async function readBlobFromPostgres(fileId: string): Promise<Buffer | null> {
  if (!isPostgresConfigured()) return null;
  try {
    const result = await getPool().query<{ bytes: Buffer }>(
      `select bytes from wingate_tax_file_blobs where id = $1 and firm_id = $2`,
      [fileId, FIRM_ID],
    );
    if (!result.rows[0]) return null;
    return Buffer.from(result.rows[0].bytes);
  } catch (error) {
    console.warn("Wingate tax files: Postgres read failed, trying local disk.", error);
    return null;
  }
}
