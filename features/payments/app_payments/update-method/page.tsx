import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";

type UpdateMethodPageProps = {
  searchParams: Promise<{ reason?: string; orderId?: string }>;
};

export default async function UpdateMethodPage({ searchParams }: UpdateMethodPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <ProtectedRoute>
        <div className="w-full rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-800">결제수단 변경이 필요합니다</h1>
          <p className="mt-2 text-sm text-yellow-700">
            구독 결제 재시도 한도를 초과했습니다. 결제수단을 변경한 뒤 다시 구독 결제를 진행해주세요.
          </p>
          <div className="mt-5 rounded-lg bg-white p-4 text-left text-sm text-yellow-800">
            <p>orderId: {params.orderId ?? "-"}</p>
            <p>reason: {params.reason ?? "-"}</p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/payments/subscription"
              className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              구독 결제 다시 시도하기
            </Link>
            <Link href="/" className="inline-block rounded-lg border border-yellow-300 px-4 py-2 text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}
