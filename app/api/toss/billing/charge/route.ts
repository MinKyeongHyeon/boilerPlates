import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { writeAuditLog } from "@/lib/audit-log";
import { scheduleSubscriptionRetry } from "@/lib/subscription-retry";
import { getTossAuthHeader, getTossSecretKey } from "@/lib/toss-server";

type ChargeBillingBody = {
  billingKey?: string;
  customerKey?: string;
  amount?: number;
  orderName?: string;
  orderId?: string;
  retryAttempt?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChargeBillingBody;

    if (!body.billingKey || !body.customerKey || !body.amount || !body.orderName || !body.orderId) {
      await writeAuditLog({
        action: "BILLING_CHARGE_REQUEST",
        status: "FAILED",
        level: "WARN",
        actorId: body.customerKey ?? null,
        targetId: body.orderId ?? null,
        metadata: { reason: "missing_required_fields" },
      });
      return NextResponse.json(
        { ok: false, message: "billingKey, customerKey, amount, orderName, orderId가 필요합니다." },
        { status: 400 },
      );
    }

    const secretKey = getTossSecretKey();
    const response = await fetch(`https://api.tosspayments.com/v1/billing/${body.billingKey}`, {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerKey: body.customerKey,
        amount: body.amount,
        orderId: body.orderId,
        orderName: body.orderName,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      const attempt = body.retryAttempt ?? 1;
      const retry = await scheduleSubscriptionRetry({
        customerKey: body.customerKey,
        billingKey: body.billingKey,
        orderId: body.orderId,
        attempt,
        reason: String((result as { message?: string }).message ?? "unknown"),
      });

      await writeAuditLog({
        action: "BILLING_CHARGE_REQUEST",
        status: "FAILED",
        level: "WARN",
        actorId: body.customerKey,
        targetId: body.orderId,
        metadata: { retryStatus: retry.status, attempt, toss: result },
      });
      return NextResponse.json(
        {
          ok: false,
          message: "정기 결제에 실패했습니다.",
          toss: result,
          retry: {
            attempt,
            status: retry.status,
            nextRetryAt: retry.nextRetryAt ?? null,
          },
          action:
            retry.status === "EXHAUSTED"
              ? {
                  type: "UPDATE_PAYMENT_METHOD",
                  redirectTo: `/payments/update-method?orderId=${encodeURIComponent(body.orderId)}&reason=${encodeURIComponent(retry.reason)}`,
                }
              : null,
        },
        { status: response.status },
      );
    }

    await writeAuditLog({
      action: "BILLING_CHARGE_REQUEST",
      status: "SUCCESS",
      actorId: body.customerKey,
      targetId: body.orderId,
      metadata: { amount: body.amount },
    });
    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    await writeAuditLog({
      action: "BILLING_CHARGE_REQUEST",
      status: "FAILED",
      level: "ERROR",
      metadata: { message: error instanceof Error ? error.message : "unknown_error" },
    });
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "정기 결제 요청에 실패했습니다." },
      { status: 500 },
    );
  }
}
