import { rm } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/toss/payments/refund/route";
import { savePaymentRecord } from "@/lib/payment-record-store";

const refundsDir = join(process.cwd(), ".data", "refunds");
const paymentsDir = join(process.cwd(), ".data", "payments");

describe("POST /api/toss/payments/refund", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env.TOSS_SECRET_KEY = "test_sk_sample";
    await rm(refundsDir, { recursive: true, force: true });
    await rm(paymentsDir, { recursive: true, force: true });
    await savePaymentRecord({
      orderId: "order_for_refund",
      paymentKey: "pk_refund_ok",
      amount: 10000,
      status: "DONE",
      approvedAt: new Date().toISOString(),
      raw: {},
    });
    await savePaymentRecord({
      orderId: "order_for_refund_fail",
      paymentKey: "pk_refund_fail",
      amount: 10000,
      status: "DONE",
      approvedAt: new Date().toISOString(),
      raw: {},
    });
  });

  it("필수 파라미터가 없으면 400을 반환한다", async () => {
    const request = new Request("http://localhost/api/toss/payments/refund", {
      method: "POST",
      body: JSON.stringify({ paymentKey: "pk_only" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("환불 성공 시 200을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "CANCELED", paymentKey: "pk_refund_ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/payments/refund", {
      method: "POST",
      body: JSON.stringify({
        paymentKey: "pk_refund_ok",
        cancelReason: "고객 요청",
        cancelAmount: 1000,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.refundId).toBeTruthy();
  });

  it("환불 실패 시 토스 상태 코드를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "NOT_FOUND_PAYMENT", message: "not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/payments/refund", {
      method: "POST",
      body: JSON.stringify({
        paymentKey: "pk_refund_fail",
        cancelReason: "고객 요청",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.refundId).toBeTruthy();
  });

  it("누적 환불 한도 초과 시 409를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "CANCELED", paymentKey: "pk_refund_ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const first = new Request("http://localhost/api/toss/payments/refund", {
      method: "POST",
      body: JSON.stringify({
        paymentKey: "pk_refund_ok",
        cancelReason: "부분 환불 1차",
        cancelAmount: 6000,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const second = new Request("http://localhost/api/toss/payments/refund", {
      method: "POST",
      body: JSON.stringify({
        paymentKey: "pk_refund_ok",
        cancelReason: "부분 환불 2차",
        cancelAmount: 5000,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const firstRes = await POST(first);
    const secondRes = await POST(second);
    expect(firstRes.status).toBe(200);
    expect(secondRes.status).toBe(409);
  });
});
