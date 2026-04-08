import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/toss/webhook/route";

describe("POST /api/toss/webhook", () => {
  it("서명이 없고 시크릿도 없으면 401을 반환한다", async () => {
    process.env.TOSS_WEBHOOK_SECRET = "webhook_secret_sample";
    const request = new Request("http://localhost/api/toss/webhook", {
      method: "POST",
      body: JSON.stringify({ eventType: "PAYMENT_STATUS_CHANGED" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("헤더 서명이 유효하면 200을 반환한다", async () => {
    process.env.TOSS_WEBHOOK_SECRET = "webhook_secret_sample";
    const body = JSON.stringify({ eventType: "payout.changed", eventId: "evt_200" });
    const transmissionTime = "1710000001";
    const digest = createHmac("sha256", "webhook_secret_sample")
      .update(`${body}:${transmissionTime}`)
      .digest("base64");

    const request = new Request("http://localhost/api/toss/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "tosspayments-webhook-signature": `v1:${digest}`,
        "tosspayments-webhook-transmission-time": transmissionTime,
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
  });

  it("DEPOSIT_CALLBACK secret가 맞으면 200을 반환한다", async () => {
    process.env.TOSS_WEBHOOK_SECRET = "deposit_secret_sample";
    const request = new Request("http://localhost/api/toss/webhook", {
      method: "POST",
      body: JSON.stringify({ createdAt: "2022-01-01", status: "DONE", secret: "deposit_secret_sample" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
