import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/toss/billing/issue/route";

describe("POST /api/toss/billing/issue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TOSS_SECRET_KEY = "test_sk_sample";
  });

  it("필수 파라미터가 없으면 400을 반환한다", async () => {
    const request = new Request("http://localhost/api/toss/billing/issue", {
      method: "POST",
      body: JSON.stringify({ authKey: "auth_only" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("정상 요청이면 토스 응답을 그대로 전달한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ billingKey: "billing_key_sample" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/billing/issue", {
      method: "POST",
      body: JSON.stringify({ authKey: "auth_sample", customerKey: "customer_sample" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.billingKey).toBe("billing_key_sample");
  });

  it("시크릿 키가 없으면 500을 반환한다", async () => {
    delete process.env.TOSS_SECRET_KEY;

    const request = new Request("http://localhost/api/toss/billing/issue", {
      method: "POST",
      body: JSON.stringify({ authKey: "auth_sample", customerKey: "customer_sample" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(String(body.message)).toContain("TOSS_SECRET_KEY");
  });
});
