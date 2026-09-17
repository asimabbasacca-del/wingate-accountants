import { FIRM_ID } from "@/lib/tax-returns/types";
import { getPool, isNeonConfigured } from "@/lib/packages/db";
import type { PracticeDump } from "./types";

export async function loadPracticeDump(): Promise<{ ok: boolean; dump: PracticeDump | null }> {
  if (!isNeonConfigured()) return { ok: false, dump: null };
  try {
    const result = await getPool().query<{ dump: PracticeDump }>(
      `select dump from wingate_practice_json_store where firm_id = $1`,
      [FIRM_ID],
    );
    return { ok: true, dump: result.rows[0]?.dump ?? null };
  } catch (error) {
    console.warn("Wingate practice store: load failed.", error);
    return { ok: false, dump: null };
  }
}

export async function savePracticeDump(dump: PracticeDump): Promise<boolean> {
  if (!isNeonConfigured()) return false;
  try {
    await getPool().query(
      `insert into wingate_practice_json_store (firm_id, dump, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (firm_id) do update set dump = excluded.dump, updated_at = now()`,
      [FIRM_ID, JSON.stringify(dump)],
    );
    return true;
  } catch (error) {
    console.warn("Wingate practice store: save failed.", error);
    return false;
  }
}
