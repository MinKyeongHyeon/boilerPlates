import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/toss/billing/charge/route";

describe("POST /api/toss/billing/charge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TOSS_SECRET_KEY = "test_sk_sample";
  });

  it("필수 파라미터가 없으면 400을 반환한다", async () => {
    const request = new Request("http://localhost/api/toss/billing/charge", {
      method: "POST",
      body: JSON.stringify({ billingKey: "billing_only" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("정상 요청이면 성공 응답을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "DONE", orderId: "sub_order_1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/billing/charge", {
      method: "POST",
      body: JSON.stringify({
        billingKey: "billing_sample",
        customerKey: "customer_sample",
        amount: 29000,
        orderName: "월간 구독 플랜",
        orderId: "sub_order_1",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("DONE");
    expect(body.data.orderId).toBe("sub_order_1");
  });

  it("실패 시 재시도 일정을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "FAILED_PAYMENT", message: "카드 한도 초과" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/billing/charge", {
      method: "POST",
      body: JSON.stringify({
        billingKey: "billing_sample",
        customerKey: "customer_sample",
        amount: 29000,
        orderName: "월간 구독 플랜",
        orderId: "sub_order_fail_1",
        retryAttempt: 1,
      }),
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.retry.status).toBe("RETRY_SCHEDULED");
    expect(body.retry.nextRetryAt).toBeTruthy();
  });

  it("재시도 한도 초과 시 exhausted를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "FAILED_PAYMENT", message: "카드 분실" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/billing/charge", {
      method: "POST",
      body: JSON.stringify({
        billingKey: "billing_sample",
        customerKey: "customer_sample",
        amount: 29000,
        orderName: "월간 구독 플랜",
        orderId: "sub_order_fail_2",
        retryAttempt: 4,
      }),
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.retry.status).toBe("EXHAUSTED");
    expect(body.retry.nextRetryAt).toBeNull();
    expect(body.action.type).toBe("UPDATE_PAYMENT_METHOD");
    expect(String(body.action.redirectTo)).toContain("/payments/update-method");
  });

  it("시크릿 키가 없으면 500을 반환한다", async () => {
    delete process.env.TOSS_SECRET_KEY;

    const request = new Request("http://localhost/api/toss/billing/charge", {
      method: "POST",
      body: JSON.stringify({
        billingKey: "billing_sample",
        customerKey: "customer_sample",
        amount: 29000,
        orderName: "월간 구독 플랜",
        orderId: "sub_order_1",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(String(body.message)).toContain("TOSS_SECRET_KEY");
  });
});
