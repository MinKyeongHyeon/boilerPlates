import { rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/subscription/cancel/route";

const subscriptionsDir = join(process.cwd(), ".data", "subscriptions");

describe("POST /api/subscription/cancel", () => {
  it("필수값이 없으면 400을 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ subscriptionId: "sub_1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("즉시 해지는 CANCELED로 저장된다", async () => {
    await rm(subscriptionsDir, { recursive: true, force: true });
    const response = await POST(
      new Request("http://localhost/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({
          subscriptionId: "sub_immediate_1",
          customerKey: "customer_1",
          policy: "IMMEDIATE",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.subscription.status).toBe("CANCELED");
    expect(body.subscription.canceledAt).toBeTruthy();
  });

  it("기간만료 해지는 CANCEL_AT_PERIOD_END로 저장된다", async () => {
    await rm(subscriptionsDir, { recursive: true, force: true });
    const response = await POST(
      new Request("http://localhost/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({
          subscriptionId: "sub_period_1",
          customerKey: "customer_2",
          policy: "END_OF_PERIOD",
          currentPeriodEndAt: "2026-05-01T00:00:00.000Z",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.subscription.status).toBe("CANCEL_AT_PERIOD_END");
    expect(body.subscription.cancelAt).toBe("2026-05-01T00:00:00.000Z");
  });
});
