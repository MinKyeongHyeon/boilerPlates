import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyTossWebhook } from "@/lib/toss-webhook";

describe("verifyTossWebhook", () => {
  it("TOSS_WEBHOOK_SECRET 미설정이면 통과한다", () => {
    delete process.env.TOSS_WEBHOOK_SECRET;
    const result = verifyTossWebhook({
      headers: new Headers(),
      rawBody: JSON.stringify({ eventType: "PAYMENT_STATUS_CHANGED" }),
    });
    expect(result.ok).toBe(true);
  });

  it("헤더 서명이 올바르면 통과한다", () => {
    process.env.TOSS_WEBHOOK_SECRET = "webhook_secret_sample";
    const rawBody = JSON.stringify({ eventType: "payout.changed", eventId: "evt_1" });
    const transmissionTime = "1710000000";
    const digest = createHmac("sha256", "webhook_secret_sample")
      .update(`${rawBody}:${transmissionTime}`)
      .digest("base64");

    const headers = new Headers();
    headers.set("tosspayments-webhook-signature", `v1:${digest}`);
    headers.set("tosspayments-webhook-transmission-time", transmissionTime);

    const result = verifyTossWebhook({ headers, rawBody });
    expect(result.ok).toBe(true);
  });

  it("서명이 틀리면 실패한다", () => {
    process.env.TOSS_WEBHOOK_SECRET = "webhook_secret_sample";
    const headers = new Headers();
    headers.set("tosspayments-webhook-signature", "v1:invalid_signature");
    headers.set("tosspayments-webhook-transmission-time", "1710000000");

    const result = verifyTossWebhook({
      headers,
      rawBody: JSON.stringify({ eventType: "payout.changed", eventId: "evt_2" }),
    });
    expect(result.ok).toBe(false);
  });

  it("DEPOSIT_CALLBACK secret 검증에 성공한다", () => {
    process.env.TOSS_WEBHOOK_SECRET = "deposit_secret_sample";
    const result = verifyTossWebhook({
      headers: new Headers(),
      rawBody: JSON.stringify({ status: "DONE" }),
      bodySecret: "deposit_secret_sample",
    });
    expect(result.ok).toBe(true);
  });
});
