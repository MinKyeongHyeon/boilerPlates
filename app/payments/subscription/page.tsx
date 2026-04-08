import { Gnb } from "@/components/gnb";
import { ProtectedRoute } from "@/components/protected-route";
import { SubscriptionStart } from "@/components/subscription-start";

export default function SubscriptionPaymentPage() {
  return (
    <div className="min-h-screen">
      <Gnb />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <ProtectedRoute>
          <h1 className="text-2xl font-bold">정기 구독 결제</h1>
          <p className="mt-2 text-sm text-muted">
            운영형 플로우: 빌링 인증 성공 후 서버에서 빌링키를 발급하고 첫 결제를 요청합니다.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
            <SubscriptionStart />
          </div>
        </ProtectedRoute>
      </main>
    </div>
  );
}
