import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/subscription/status/route";
import { upsertSubscription } from "@/lib/subscription-store";

describe("GET /api/subscription/status", () => {
  it("subscriptionId가 없으면 400을 반환한다", async () => {
    const response = await GET(new Request("http://localhost/api/subscription/status"));
    expect(response.status).toBe(400);
  });

  it("존재하는 구독 상태를 반환한다", async () => {
    await upsertSubscription({
      subscriptionId: "sub_status_1",
      customerKey: "customer_status_1",
      status: "ACTIVE",
      updatedAt: new Date().toISOString(),
    });

    const response = await GET(new Request("http://localhost/api/subscription/status?subscriptionId=sub_status_1"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.subscription.subscriptionId).toBe("sub_status_1");
  });
});
