import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const STORE_PATH = path.join(DATA_DIR, "tax-returns.json");
