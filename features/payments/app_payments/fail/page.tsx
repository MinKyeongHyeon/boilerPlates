import Link from "next/link";

type FailPageProps = {
  searchParams: Promise<{ type?: string; code?: string; message?: string }>;
};

export default async function PaymentFailPage({ searchParams }: FailPageProps) {
  const params = await searchParams;
  const typeLabel = params.type === "subscription" ? "정기 구독" : "단건";
  const shouldGuideUpdateMethod = params.type === "subscription" && params.code === "RETRY_EXHAUSTED";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-700">결제가 실패했습니다</h1>
        <p className="mt-2 text-sm text-red-600">{typeLabel} 결제 실패 콜백 페이지입니다.</p>
        <div className="mt-5 rounded-lg bg-white p-4 text-left text-sm text-red-700">
          <p>code: {params.code ?? "-"}</p>
          <p>message: {params.message ?? "-"}</p>
        </div>
        {shouldGuideUpdateMethod && (
          <Link
            href={`/payments/update-method?orderId=${encodeURIComponent(params.message ?? "")}&reason=${encodeURIComponent(params.code ?? "")}`}
            className="mt-4 inline-block rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white"
          >
            결제수단 변경하기
          </Link>
        )}
        <Link href="/" className="mt-6 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
