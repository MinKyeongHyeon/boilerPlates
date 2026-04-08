import { rm } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/toss/payments/confirm/route";

const paymentsDir = join(process.cwd(), ".data", "payments");

describe("POST /api/toss/payments/confirm", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    process.env.TOSS_SECRET_KEY = "test_sk_sample";
    await rm(paymentsDir, { recursive: true, force: true });
  });

  it("필수 파라미터가 없으면 400을 반환한다", async () => {
    const request = new Request("http://localhost/api/toss/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentKey: "pk_only" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("정상 승인 후 저장되면 200을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "DONE", paymentKey: "pk_1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = new Request("http://localhost/api/toss/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentKey: "pk_1", orderId: "order_1", amount: 9900 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it("동일 orderId 재요청은 409를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify({ status: "DONE", paymentKey: "pk_dup" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const first = new Request("http://localhost/api/toss/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentKey: "pk_dup", orderId: "order_dup", amount: 9900 }),
      headers: { "Content-Type": "application/json" },
    });
    const second = new Request("http://localhost/api/toss/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ paymentKey: "pk_dup", orderId: "order_dup", amount: 9900 }),
      headers: { "Content-Type": "application/json" },
    });

    const firstRes = await POST(first);
    const secondRes = await POST(second);
    expect(firstRes.status).toBe(200);
    expect(secondRes.status).toBe(409);
  });
});
