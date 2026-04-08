"use client";

import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { useEffect, useState } from "react";
import { env } from "@/lib/env";

type TossPaymentWidgetProps = {
  amount: number;
  orderName: string;
  customerName: string;
  billing?: boolean;
};

export function TossPaymentWidget({
  amount,
  orderName,
  customerName,
  billing = false,
}: TossPaymentWidgetProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!env.tossClientKey) {
          setError("NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수를 설정해주세요.");
          return;
        }

        const paymentWidget = await loadPaymentWidget(env.tossClientKey, "sample-customer-key");
        await paymentWidget.renderPaymentMethods("#payment-method", { value: amount });
        await paymentWidget.renderAgreement("#agreement");

        const button = document.getElementById("request-payment-button");
        if (!button) return;

        button.onclick = async () => {
          await paymentWidget.requestPayment({
            orderId: `order-${Date.now()}`,
            orderName,
            customerName,
            successUrl: `${window.location.origin}/payments/success?type=${billing ? "subscription" : "one-time"}`,
            failUrl: `${window.location.origin}/payments/fail?type=${billing ? "subscription" : "one-time"}`,
          });
        };
      } catch (e) {
        console.error(e);
        setError("결제 위젯 로딩에 실패했습니다.");
      }
    };

    run();
  }, [amount, billing, customerName, orderName]);

  if (error) {
    return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div id="payment-method" className="rounded-xl border border-border bg-white p-3" />
      <div id="agreement" className="rounded-xl border border-border bg-white p-3" />
      <button
        id="request-payment-button"
        className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
        type="button"
      >
        {billing ? "정기 구독 결제하기" : "단건 결제하기"}
      </button>
    </div>
  );
}
