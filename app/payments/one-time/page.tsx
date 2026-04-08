import { Gnb } from "@/components/gnb";
import { ProtectedRoute } from "@/components/protected-route";
import { TossPaymentWidget } from "@/components/toss-payment-widget";

export default function OneTimePaymentPage() {
  return (
    <div className="min-h-screen">
      <Gnb />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <ProtectedRoute>
          <h1 className="text-2xl font-bold">단건 결제</h1>
          <p className="mt-2 text-sm text-muted">1회성 상품 과금용 토스페이먼츠 결제 위젯 예시입니다.</p>
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <TossPaymentWidget amount={9900} orderName="단건 결제 상품" customerName="홍길동" />
          </div>
        </ProtectedRoute>
      </main>
    </div>
  );
}
