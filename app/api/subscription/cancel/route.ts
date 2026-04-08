import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { writeAuditLog } from "@/lib/audit-log";
import { cancelSubscription, type CancelPolicy } from "@/lib/subscription-store";

type CancelSubscriptionBody = {
  subscriptionId?: string;
  customerKey?: string;
  policy?: CancelPolicy;
  currentPeriodEndAt?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CancelSubscriptionBody;
    if (!body.subscriptionId || !body.customerKey || !body.policy) {
      await writeAuditLog({
        action: "SUBSCRIPTION_CANCEL",
        status: "FAILED",
        level: "WARN",
        actorId: body.customerKey ?? null,
        targetId: body.subscriptionId ?? null,
        metadata: { reason: "missing_required_fields" },
      });
      return NextResponse.json(
        { ok: false, message: "subscriptionId, customerKey, policy가 필요합니다." },
        { status: 400 },
      );
    }

    if (body.policy !== "IMMEDIATE" && body.policy !== "END_OF_PERIOD") {
      return NextResponse.json({ ok: false, message: "policy는 IMMEDIATE 또는 END_OF_PERIOD만 허용됩니다." }, { status: 400 });
    }

    const subscription = await cancelSubscription({
      subscriptionId: body.subscriptionId,
      customerKey: body.customerKey,
      policy: body.policy,
      currentPeriodEndAt: body.currentPeriodEndAt,
    });

    await writeAuditLog({
      action: "SUBSCRIPTION_CANCEL",
      status: "SUCCESS",
      actorId: body.customerKey,
      targetId: body.subscriptionId,
      metadata: { policy: body.policy, status: subscription.status },
    });

    return NextResponse.json({ ok: true, subscription }, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    await writeAuditLog({
      action: "SUBSCRIPTION_CANCEL",
      status: "FAILED",
      level: "ERROR",
      metadata: { message: error instanceof Error ? error.message : "unknown_error" },
    });
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "구독 해지 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
