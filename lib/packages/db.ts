import { Pool } from "pg";

const globalForPg = globalThis as unknown as { wingatePg?: Pool };

function cleanConnectionString(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw.replace(/([?&])channel_binding=[^&]*&?/, "$1").replace(/[?&]$/, "");
  }
}

export function neonConnectionString(): string | null {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  return cleanConnectionString(raw);
}

export function isNeonConfigured(): boolean {
  return neonConnectionString() !== null;
}

export function getPool(): Pool {
  if (!globalForPg.wingatePg) {
    const connectionString = neonConnectionString();
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    globalForPg.wingatePg = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: true },
      max: 5,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForPg.wingatePg;
}
