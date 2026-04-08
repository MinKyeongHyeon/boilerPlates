import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const retryDir = join(process.cwd(), ".data", "subscription-retries");
const alertDir = join(process.cwd(), ".data", "alerts");
const retryDays = [1, 3, 7] as const;

type RetryRecord = {
  id: string;
  customerKey: string;
  billingKey: string;
  orderId: string;
  attempt: number;
  status: "RETRY_SCHEDULED" | "EXHAUSTED";
  reason: string;
  nextRetryAt?: string;
  createdAt: string;
};

async function ensureDirs() {
  await mkdir(retryDir, { recursive: true });
  await mkdir(alertDir, { recursive: true });
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function getRetryPolicy() {
  return retryDays;
}

export async function scheduleSubscriptionRetry(input: {
  customerKey: string;
  billingKey: string;
  orderId: string;
  attempt: number;
  reason: string;
}) {
  await ensureDirs();
  const id = randomUUID();
  const createdAt = new Date();
  const dayOffset = retryDays[input.attempt - 1];

  const record: RetryRecord = {
    id,
    customerKey: input.customerKey,
    billingKey: input.billingKey,
    orderId: input.orderId,
    attempt: input.attempt,
    status: dayOffset ? "RETRY_SCHEDULED" : "EXHAUSTED",
    reason: input.reason,
    nextRetryAt: dayOffset ? addDays(createdAt, dayOffset).toISOString() : undefined,
    createdAt: createdAt.toISOString(),
  };

  await writeFile(join(retryDir, `${id}.json`), JSON.stringify(record, null, 2), "utf8");

  if (!dayOffset) {
    const alert = {
      id: randomUUID(),
      type: "SUBSCRIPTION_RETRY_EXHAUSTED",
      customerKey: input.customerKey,
      orderId: input.orderId,
      createdAt: new Date().toISOString(),
      message: "구독 결제 재시도 한도를 초과했습니다. 결제수단 변경 알림이 필요합니다.",
    };
    await writeFile(join(alertDir, `${alert.id}.json`), JSON.stringify(alert, null, 2), "utf8");
  }

  return record;
}

export async function readRetryRecord(id: string) {
  const content = await readFile(join(retryDir, `${id}.json`), "utf8");
  return JSON.parse(content) as RetryRecord;
}
