import Link from "next/link";

export default function ConsentRequiredPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-800">최신 정책 동의가 필요합니다</h1>
        <p className="mt-2 text-sm text-yellow-700">
          결제/구독 기능을 이용하려면 최신 이용약관과 개인정보처리방침에 동의해야 합니다.
        </p>
        <div className="mt-5 rounded-lg bg-white p-4 text-left text-sm text-yellow-800">
          <p>1) 홈으로 이동해 상단 노란 배너의 &quot;최신 정책 동의&quot; 버튼을 누르세요.</p>
          <p>2) 또는 아래 링크에서 정책 내용을 확인한 뒤 동의를 진행하세요.</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            홈으로 이동
          </Link>
          <Link href="/legal/terms" className="inline-block rounded-lg border border-yellow-300 px-4 py-2 text-sm">
            이용약관 보기
          </Link>
          <Link href="/legal/privacy" className="inline-block rounded-lg border border-yellow-300 px-4 py-2 text-sm">
            개인정보처리방침 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
