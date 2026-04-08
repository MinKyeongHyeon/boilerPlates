import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseDir = join(process.cwd(), ".data", "dead-letter");

export type DeadLetterRecord = {
  id: string;
  createdAt: string;
  source: "toss.webhook";
  eventType: string | null;
  eventId: string | null;
  reason: string;
  payload: unknown;
  rawBody: string;
  status: "pending" | "replayed";
  replayedAt?: string;
};

async function ensureDir() {
  await mkdir(baseDir, { recursive: true });
}

export async function saveDeadLetter(input: Omit<DeadLetterRecord, "id" | "createdAt" | "status">) {
  await ensureDir();
  const record: DeadLetterRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
  };
  await writeFile(join(baseDir, `${record.id}.json`), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function listDeadLetters() {
  await ensureDir();
  const files = (await readdir(baseDir)).filter((name) => name.endsWith(".json"));
  const records = await Promise.all(
    files.map(async (name) => {
      const content = await readFile(join(baseDir, name), "utf8");
      return JSON.parse(content) as DeadLetterRecord;
    }),
  );
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markDeadLetterReplayed(id: string) {
  await ensureDir();
  const target = join(baseDir, `${id}.json`);
  const content = await readFile(target, "utf8");
  const record = JSON.parse(content) as DeadLetterRecord;
  const updated: DeadLetterRecord = {
    ...record,
    status: "replayed",
    replayedAt: new Date().toISOString(),
  };
  await writeFile(target, JSON.stringify(updated, null, 2), "utf8");
  return updated;
}
