import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseDir = join(process.cwd(), ".data", "payments");

export type PaymentRecord = {
  orderId: string;
  paymentKey: string;
  amount: number;
  status: "DONE" | "FAILED";
  approvedAt: string;
  raw: unknown;
};

async function ensureDir() {
  await mkdir(baseDir, { recursive: true });
}

function filePathForOrder(orderId: string) {
  return join(baseDir, `${orderId}.json`);
}

export async function hasPaymentRecord(orderId: string) {
  try {
    await readFile(filePathForOrder(orderId), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function savePaymentRecord(record: PaymentRecord) {
  await ensureDir();
  try {
    await writeFile(filePathForOrder(record.orderId), JSON.stringify(record, null, 2), {
      encoding: "utf8",
      flag: "wx",
    });
    return record;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "EEXIST"
    ) {
      throw new Error("DUPLICATE_ORDER_ID");
    }
    throw error;
  }
}

export async function findPaymentRecordByPaymentKey(paymentKey: string) {
  await ensureDir();
  const files = (await readdir(baseDir)).filter((name) => name.endsWith(".json"));
  for (const file of files) {
    const content = await readFile(join(baseDir, file), "utf8");
    const record = JSON.parse(content) as PaymentRecord;
    if (record.paymentKey === paymentKey) {
      return record;
    }
  }
  return null;
}
