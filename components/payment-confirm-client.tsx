"use client";

import { useEffect, useState } from "react";

type PaymentConfirmClientProps = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  type?: string;
};

export function PaymentConfirmClient({ paymentKey, orderId, amount, type }: PaymentConfirmClientProps) {
  const [message, setMessage] = useState("결제 승인 확인 중...");

  useEffect(() => {
    const run = async () => {
      if (type === "subscription") {
        setMessage("정기결제는 별도 플로우에서 승인됩니다.");
        return;
      }

      if (!paymentKey || !orderId || !amount) {
        setMessage("승인에 필요한 파라미터가 부족합니다.");
        return;
      }

      const parsedAmount = Number(amount);
      if (Number.isNaN(parsedAmount)) {
        setMessage("금액 파라미터가 유효하지 않습니다.");
        return;
      }

      const response = await fetch("/api/toss/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parsedAmount,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("결제 승인과 저장이 완료되었습니다.");
        return;
      }

      setMessage(data.message ?? "결제 승인 확인에 실패했습니다.");
    };

    run();
  }, [amount, orderId, paymentKey, type]);

  return <p className="mt-3 text-sm text-muted">{message}</p>;
}
