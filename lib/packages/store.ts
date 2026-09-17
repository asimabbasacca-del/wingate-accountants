import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { PackageSelection } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "package-selections.json");

type Dump = { selections: PackageSelection[] };

class PackageSelectionStore {
  private data: Dump | null = null;
  private queue: Promise<void> = Promise.resolve();

  private async load(): Promise<Dump> {
    if (this.data) return this.data;
    try {
      const raw = await readFile(STORE_PATH, "utf8");
      this.data = JSON.parse(raw) as Dump;
    } catch {
      this.data = { selections: [] };
      await this.persist();
    }
    return this.data;
  }

  private async persist(): Promise<void> {
    if (!this.data) return;
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${STORE_PATH}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
    await rename(tmp, STORE_PATH);
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const run = this.queue.then(work, work);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async create(input: Omit<PackageSelection, "id" | "createdAt">): Promise<PackageSelection> {
    return this.enqueue(async () => {
      const dump = await this.load();
      const row: PackageSelection = {
        ...input,
        id: `sel_${randomUUID()}`,
        createdAt: new Date().toISOString(),
      };
      dump.selections.push(row);
      await this.persist();
      return row;
    });
  }

  async list(): Promise<PackageSelection[]> {
    const dump = await this.load();
    return dump.selections;
  }
}

export const packageSelectionStore = new PackageSelectionStore();
