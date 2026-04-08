import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { writeAuditLog } from "@/lib/audit-log";
import { saveDeadLetter } from "@/lib/dead-letter";
import { processTossWebhook } from "@/lib/toss-webhook-handler";
import { verifyTossWebhook } from "@/lib/toss-webhook";

type TossWebhookPayload = {
  eventType?: string;
  eventId?: string;
  secret?: string;
  data?: {
    orderId?: string;
    status?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: TossWebhookPayload = {};

  try {
    payload = JSON.parse(rawBody) as TossWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 JSON 본문입니다." }, { status: 400 });
  }

  const verification = verifyTossWebhook({
    headers: request.headers,
    rawBody,
    bodySecret: payload.secret,
  });

  if (!verification.ok) {
    console.error("[WH-003] toss webhook signature verification failed", {
      reason: verification.reason,
      eventType: payload.eventType,
      eventId: payload.eventId,
    });
    await writeAuditLog({
      action: "TOSS_WEBHOOK_RECEIVE",
      status: "FAILED",
      level: "WARN",
      targetId: payload.eventId ?? null,
      metadata: { reason: verification.reason, eventType: payload.eventType ?? null },
    });
    return NextResponse.json({ ok: false, message: "유효하지 않은 웹훅 서명입니다." }, { status: 401 });
  }

  try {
    const result = await processTossWebhook(payload);
    await writeAuditLog({
      action: "TOSS_WEBHOOK_RECEIVE",
      status: "SUCCESS",
      targetId: payload.eventId ?? null,
      metadata: { eventType: payload.eventType ?? null, verification: verification.reason },
    });
    return NextResponse.json(
      {
        ok: true,
        message: "웹훅 검증 및 처리가 완료되었습니다.",
        eventType: payload.eventType ?? null,
        verification: verification.reason,
        result,
      },
      { status: 200 },
    );
  } catch (error) {
    Sentry.captureException(error);
    const record = await saveDeadLetter({
      source: "toss.webhook",
      eventType: payload.eventType ?? null,
      eventId: payload.eventId ?? null,
      reason: error instanceof Error ? error.message : "unknown_error",
      payload,
      rawBody,
    });

    console.error("[WH-004] toss webhook moved to dead-letter", {
      deadLetterId: record.id,
      eventType: record.eventType,
      eventId: record.eventId,
      reason: record.reason,
    });
    await writeAuditLog({
      action: "TOSS_WEBHOOK_RECEIVE",
      status: "FAILED",
      level: "ERROR",
      targetId: payload.eventId ?? null,
      metadata: { reason: record.reason, deadLetterId: record.id },
    });

    return NextResponse.json(
      { ok: false, message: "웹훅 처리에 실패하여 dead-letter에 저장되었습니다.", deadLetterId: record.id },
      { status: 500 },
    );
  }
}
