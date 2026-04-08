import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseDir = join(process.cwd(), ".data", "refunds");

export type RefundRecord = {
  id: string;
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
  status: "REQUESTED" | "COMPLETED" | "FAILED";
  requestedAt: string;
  completedAt?: string;
  failedAt?: string;
  raw?: unknown;
};

async function ensureDir() {
  await mkdir(baseDir, { recursive: true });
}

function filePathForRecord(id: string) {
  return join(baseDir, `${id}.json`);
}

export async function createRefundRecord(input: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}) {
  await ensureDir();
  const record: RefundRecord = {
    id: randomUUID(),
    paymentKey: input.paymentKey,
    cancelReason: input.cancelReason,
    cancelAmount: input.cancelAmount,
    status: "REQUESTED",
    requestedAt: new Date().toISOString(),
  };
  await writeFile(filePathForRecord(record.id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function completeRefundRecord(id: string, raw: unknown) {
  await ensureDir();
  const existing = JSON.parse(await readFile(filePathForRecord(id), "utf8")) as RefundRecord;
  const updated: RefundRecord = { ...existing, status: "COMPLETED", completedAt: new Date().toISOString(), raw };
  return updated;
}

export async function failRefundRecord(id: string, raw: unknown) {
  await ensureDir();
  const existing = JSON.parse(await readFile(filePathForRecord(id), "utf8")) as RefundRecord;
  const updated: RefundRecord = { ...existing, status: "FAILED", failedAt: new Date().toISOString(), raw };
  return updated;
}

export async function saveRefundRecord(record: RefundRecord) {
  await ensureDir();
  await writeFile(filePathForRecord(record.id), JSON.stringify(record, null, 2), "utf8");
}

export async function getCompletedRefundAmountByPaymentKey(paymentKey: string) {
  await ensureDir();
  const files = (await readdir(baseDir)).filter((name) => name.endsWith(".json"));
  let total = 0;
  for (const file of files) {
    const content = await readFile(join(baseDir, file), "utf8");
    const record = JSON.parse(content) as RefundRecord;
    if (record.paymentKey === paymentKey && record.status === "COMPLETED") {
      total += record.cancelAmount ?? 0;
    }
  }
  return total;
}
