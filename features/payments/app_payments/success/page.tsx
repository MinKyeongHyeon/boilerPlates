import Link from "next/link";
import { PaymentConfirmClient } from "@/components/payment-confirm-client";

type SuccessPageProps = {
  searchParams: Promise<{ type?: string; paymentKey?: string; orderId?: string; amount?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const typeLabel = params.type === "subscription" ? "정기 구독" : "단건";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">결제가 성공했습니다</h1>
        <p className="mt-2 text-sm text-muted">{typeLabel} 결제 성공 콜백 페이지입니다.</p>
        <PaymentConfirmClient
          type={params.type}
          paymentKey={params.paymentKey}
          orderId={params.orderId}
          amount={params.amount}
        />
        <div className="mt-5 rounded-lg bg-gray-50 p-4 text-left text-sm">
          <p>paymentKey: {params.paymentKey ?? "-"}</p>
          <p>orderId: {params.orderId ?? "-"}</p>
          <p>amount: {params.amount ?? "-"}</p>
        </div>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm text-white">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
