import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/subscription-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subscriptionId = url.searchParams.get("subscriptionId");
  if (!subscriptionId) {
    return NextResponse.json({ ok: false, message: "subscriptionId가 필요합니다." }, { status: 400 });
  }

  const subscription = await getSubscription(subscriptionId);
  if (!subscription) {
    return NextResponse.json({ ok: false, message: "구독 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, subscription }, { status: 200 });
}
