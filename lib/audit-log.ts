import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

type AuditLevel = "INFO" | "WARN" | "ERROR";

export type AuditLogInput = {
  action: string;
  level?: AuditLevel;
  actorId?: string | null;
  targetId?: string | null;
  status: "SUCCESS" | "FAILED";
  metadata?: Record<string, unknown>;
};

const auditDir = join(process.cwd(), ".data", "audit-logs");

export async function writeAuditLog(input: AuditLogInput) {
  await mkdir(auditDir, { recursive: true });
  const log = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    level: input.level ?? "INFO",
    action: input.action,
    actorId: input.actorId ?? null,
    targetId: input.targetId ?? null,
    status: input.status,
    metadata: input.metadata ?? {},
  };
  await writeFile(join(auditDir, `${log.createdAt.replace(/[:.]/g, "-")}-${log.id}.json`), JSON.stringify(log, null, 2), "utf8");
  return log;
}
