"use client";

import Script from "next/script";
import { useState } from "react";
import { env } from "@/lib/env";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestBillingAuth: (params: {
        customerKey: string;
        successUrl: string;
        failUrl: string;
      }) => Promise<void>;
    };
  }
}

export function SubscriptionStart() {
  const [ready, setReady] = useState(false);
  const customerKey = "customer-demo-key";

  const startBillingAuth = async () => {
    if (!env.tossClientKey) {
      alert("NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수를 설정해주세요.");
      return;
    }

    if (!window.TossPayments) {
      alert("토스 SDK 로딩이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const toss = window.TossPayments(env.tossClientKey);
    await toss.requestBillingAuth({
      customerKey,
      successUrl: `${window.location.origin}/payments/subscription/success`,
      failUrl: `${window.location.origin}/payments/fail?type=subscription`,
    });
  };

  return (
    <div className="space-y-4">
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-muted">
        SDK 상태: {ready ? "로딩 완료" : "로딩 중"} / customerKey: {customerKey}
      </p>
      <button
        className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        type="button"
        onClick={startBillingAuth}
        disabled={!ready}
      >
        빌링 인증 시작하기
      </button>
    </div>
  );
}
