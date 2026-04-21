import { NextResponse } from "next/server";
import { getTossAuthHeader, getTossSecretKey } from "@/lib/toss-server";

type IssueBillingBody = {
  authKey?: string;
  customerKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IssueBillingBody;

    if (!body.authKey || !body.customerKey) {
      return NextResponse.json(
        { ok: false, message: "authKey, customerKey가 필요합니다." },
        { status: 400 },
      );
    }

    const secretKey = getTossSecretKey();
    const response = await fetch("https://api.tosspayments.com/v1/billing/authorizations/issue", {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(secretKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authKey: body.authKey,
        customerKey: body.customerKey,
      }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "빌링키 발급에 실패했습니다." },
      { status: 500 },
    );
  }
}
