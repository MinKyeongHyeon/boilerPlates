import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "CANCEL_AT_PERIOD_END";
export type CancelPolicy = "IMMEDIATE" | "END_OF_PERIOD";

export type SubscriptionRecord = {
  subscriptionId: string;
  customerKey: string;
  status: SubscriptionStatus;
  currentPeriodEndAt?: string;
  canceledAt?: string;
  cancelAt?: string;
  updatedAt: string;
};

const dataDir = join(process.cwd(), ".data", "subscriptions");

async function ensureDir() {
  await mkdir(dataDir, { recursive: true });
}

function pathFor(subscriptionId: string) {
  return join(dataDir, `${subscriptionId}.json`);
}

export async function upsertSubscription(record: SubscriptionRecord) {
  await ensureDir();
  await writeFile(pathFor(record.subscriptionId), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function getSubscription(subscriptionId: string) {
  await ensureDir();
  try {
    const content = await readFile(pathFor(subscriptionId), "utf8");
    return JSON.parse(content) as SubscriptionRecord;
  } catch {
    return null;
  }
}

export async function cancelSubscription(input: {
  subscriptionId: string;
  customerKey: string;
  policy: CancelPolicy;
  currentPeriodEndAt?: string;
}) {
  const now = new Date().toISOString();
  const existing = await getSubscription(input.subscriptionId);
  const base: SubscriptionRecord = existing ?? {
    subscriptionId: input.subscriptionId,
    customerKey: input.customerKey,
    status: "ACTIVE",
    currentPeriodEndAt: input.currentPeriodEndAt,
    updatedAt: now,
  };

  const updated: SubscriptionRecord =
    input.policy === "IMMEDIATE"
      ? {
          ...base,
          status: "CANCELED",
          canceledAt: now,
          updatedAt: now,
        }
      : {
          ...base,
          status: "CANCEL_AT_PERIOD_END",
          cancelAt: base.currentPeriodEndAt ?? input.currentPeriodEndAt ?? now,
          updatedAt: now,
        };

  await upsertSubscription(updated);
  return updated;
}
