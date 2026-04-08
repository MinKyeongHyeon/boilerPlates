import { rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { writeAuditLog } from "@/lib/audit-log";

const auditDir = join(process.cwd(), ".data", "audit-logs");

describe("writeAuditLog", () => {
  it("감사 로그 파일을 생성한다", async () => {
    await rm(auditDir, { recursive: true, force: true });
    const log = await writeAuditLog({
      action: "TEST_AUDIT_LOG",
      status: "SUCCESS",
      metadata: { sample: true },
    });

    expect(log.id).toBeTruthy();
    expect(log.action).toBe("TEST_AUDIT_LOG");
    expect(log.status).toBe("SUCCESS");
  });
});
