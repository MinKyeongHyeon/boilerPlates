import { NextResponse } from "next/server";
import { savePaymentRecord } from "@/lib/payment-record-store";
import { getTossAuthHeader, getTossSecretKey } from "@/lib/toss-server";

type ConfirmBody = {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmBody;
    if (!body.paymentKey || !body.orderId || typeof body.amount !== "number") {
      return NextResponse.json(
        { ok: false, message: "paymentKey, orderId, amount(number)가 필요합니다." },
        { status: 400 },
      );
    }

    const secretKey = getTossSecretKey();
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey: body.paymentKey,
        orderId: body.orderId,
        amount: body.amount,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "결제 승인 실패", toss: result }, { status: response.status });
    }

    try {
      await savePaymentRecord({
        orderId: body.orderId,
        paymentKey: body.paymentKey,
        amount: body.amount,
        status: "DONE",
        approvedAt: new Date().toISOString(),
        raw: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_ORDER_ID") {
        return NextResponse.json({ ok: false, message: "이미 처리된 orderId입니다." }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
