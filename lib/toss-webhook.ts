import { createHmac, timingSafeEqual } from "node:crypto";

function toBase64(input: string) {
  return Buffer.from(input, "utf8").toString("base64");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function verifyHeaderSignature(rawBody: string, signature: string, transmissionTime: string, secret: string) {
  // 문서 기준: payload:transmissionTime 형태를 HMAC-SHA256으로 검증
  const payload = `${rawBody}:${transmissionTime}`;
  const digest = createHmac("sha256", secret).update(payload).digest("base64");

  // tosspayments-webhook-signature: v1:sig1,sig2 형식을 허용
  const normalized = signature.replace(/^v1:/, "");
  const candidates = normalized
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return candidates.some((candidate) => safeEqual(candidate, digest));
}

export type TossWebhookVerifyResult =
  | { ok: true; reason: "header_signature" | "body_secret" | "not_configured" }
  | { ok: false; reason: "invalid_signature" | "missing_signature_fields" };

export function verifyTossWebhook({
  headers,
  rawBody,
  bodySecret,
}: {
  headers: Headers;
  rawBody: string;
  bodySecret?: string;
}): TossWebhookVerifyResult {
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { ok: true, reason: "not_configured" };
  }

  const signature = headers.get("tosspayments-webhook-signature");
  const transmissionTime = headers.get("tosspayments-webhook-transmission-time");

  if (signature && transmissionTime) {
    const valid = verifyHeaderSignature(rawBody, signature, transmissionTime, webhookSecret);
    return valid ? { ok: true, reason: "header_signature" } : { ok: false, reason: "invalid_signature" };
  }

  if (bodySecret) {
    const valid = safeEqual(toBase64(bodySecret), toBase64(webhookSecret)) || safeEqual(bodySecret, webhookSecret);
    return valid ? { ok: true, reason: "body_secret" } : { ok: false, reason: "invalid_signature" };
  }

  return { ok: false, reason: "missing_signature_fields" };
}
