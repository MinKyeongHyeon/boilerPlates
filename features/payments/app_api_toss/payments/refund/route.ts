import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { writeAuditLog } from "@/lib/audit-log";
import {
  completeRefundRecord,
  createRefundRecord,
  failRefundRecord,
  getCompletedRefundAmountByPaymentKey,
  saveRefundRecord,
} from "@/lib/refund-record-store";
import { findPaymentRecordByPaymentKey } from "@/lib/payment-record-store";
import { getTossAuthHeader, getTossSecretKey } from "@/lib/toss-server";

type RefundBody = {
  paymentKey?: string;
  cancelReason?: string;
  cancelAmount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RefundBody;
    if (!body.paymentKey || !body.cancelReason) {
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey ?? null,
        metadata: { reason: "missing_required_fields" },
      });
      return NextResponse.json({ ok: false, message: "paymentKey, cancelReason이 필요합니다." }, { status: 400 });
    }
    if (typeof body.cancelAmount === "number" && body.cancelAmount <= 0) {
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey,
        metadata: { reason: "invalid_cancel_amount", cancelAmount: body.cancelAmount },
      });
      return NextResponse.json({ ok: false, message: "cancelAmount는 0보다 커야 합니다." }, { status: 400 });
    }

    const payment = await findPaymentRecordByPaymentKey(body.paymentKey);
    if (!payment) {
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey,
        metadata: { reason: "payment_record_not_found" },
      });
      return NextResponse.json(
        { ok: false, message: "결제 승인 기록이 없어 환불 가능 금액을 확인할 수 없습니다." },
        { status: 404 },
      );
    }

    const refundedSoFar = await getCompletedRefundAmountByPaymentKey(body.paymentKey);
    const remaining = payment.amount - refundedSoFar;
    const cancelAmount = typeof body.cancelAmount === "number" ? body.cancelAmount : remaining;

    if (cancelAmount > remaining) {
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey,
        metadata: { reason: "refund_limit_exceeded", remaining, cancelAmount, refundedSoFar },
      });
      return NextResponse.json(
        {
          ok: false,
          message: "누적 환불 한도를 초과했습니다.",
          paymentAmount: payment.amount,
          refundedSoFar,
          requested: cancelAmount,
          remaining,
        },
        { status: 409 },
      );
    }
    if (cancelAmount <= 0) {
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey,
        metadata: { reason: "no_remaining_refundable_amount" },
      });
      return NextResponse.json({ ok: false, message: "환불 가능한 잔액이 없습니다." }, { status: 409 });
    }

    const refund = await createRefundRecord({
      paymentKey: body.paymentKey,
      cancelReason: body.cancelReason,
      cancelAmount,
    });

    const secretKey = getTossSecretKey();
    const response = await fetch(`https://api.tosspayments.com/v1/payments/${body.paymentKey}/cancel`, {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancelReason: body.cancelReason,
        cancelAmount,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const failed = await failRefundRecord(refund.id, result);
      await saveRefundRecord(failed);
      await writeAuditLog({
        action: "PAYMENT_REFUND_REQUEST",
        status: "FAILED",
        level: "WARN",
        targetId: body.paymentKey,
        metadata: { refundId: failed.id, toss: result },
      });
      return NextResponse.json(
        { ok: false, message: "환불 요청이 실패했습니다.", refundId: failed.id, toss: result },
        { status: response.status },
      );
    }

    const completed = await completeRefundRecord(refund.id, result);
    await saveRefundRecord(completed);
    await writeAuditLog({
      action: "PAYMENT_REFUND_REQUEST",
      status: "SUCCESS",
      targetId: body.paymentKey,
      metadata: { refundId: completed.id, cancelAmount },
    });
    return NextResponse.json({ ok: true, refundId: completed.id, data: result }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    await writeAuditLog({
      action: "PAYMENT_REFUND_REQUEST",
      status: "FAILED",
      level: "ERROR",
      metadata: { message: error instanceof Error ? error.message : "unknown_error" },
    });
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "환불 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
