"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Stage = "issuing" | "charging" | "done" | "error";

function SubscriptionSuccessContent() {
  const params = useSearchParams();
  const [stage, setStage] = useState<Stage>("issuing");
  const [message, setMessage] = useState("빌링키 발급을 요청하는 중입니다...");
  const [resultText, setResultText] = useState("-");

  useEffect(() => {
    const authKey = params.get("authKey");
    const customerKey = params.get("customerKey");

    const run = async () => {
      if (!authKey || !customerKey) {
        setStage("error");
        setMessage("필수 파라미터(authKey, customerKey)가 없습니다.");
        return;
      }

      try {
        const issueResponse = await fetch("/api/toss/billing/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authKey, customerKey }),
        });
        const issueData = await issueResponse.json();

        if (!issueResponse.ok || !issueData.billingKey) {
          setStage("error");
          setMessage("빌링키 발급에 실패했습니다.");
          setResultText(JSON.stringify(issueData, null, 2));
          return;
        }

        setStage("charging");
        setMessage("첫 구독 결제를 요청하는 중입니다...");

        const chargeResponse = await fetch("/api/toss/billing/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billingKey: issueData.billingKey,
            customerKey,
            amount: 29000,
            orderId: `sub-${Date.now()}`,
            orderName: "월간 구독 플랜",
          }),
        });
        const chargeData = await chargeResponse.json();

        if (!chargeResponse.ok) {
          setStage("error");
          setMessage("첫 구독 결제 요청이 실패했습니다.");
          setResultText(JSON.stringify(chargeData, null, 2));
          return;
        }

        setStage("done");
        setMessage("빌링키 발급과 첫 결제가 모두 완료되었습니다.");
        setResultText(JSON.stringify(chargeData, null, 2));
      } catch (e) {
        setStage("error");
        setMessage("처리 중 예외가 발생했습니다.");
        setResultText(e instanceof Error ? e.message : "알 수 없는 오류");
      }
    };

    run();
  }, [params]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold">정기결제 인증 성공</h1>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <p className="mt-2 text-xs text-muted">현재 상태: {stage}</p>
        <pre className="mt-4 max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 text-xs leading-5">
          {resultText}
        </pre>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm text-white">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
          <p className="text-sm text-muted">정기결제 결과를 불러오는 중입니다...</p>
        </main>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
