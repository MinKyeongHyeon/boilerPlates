import Link from "next/link";

export function HeroSection() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm sm:p-12">
      <p className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
        한국형 인증/결제 내장
      </p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        아이디어만 설명하면, 로그인과 결제 인프라는 이미 준비되어 있습니다.
      </h1>
      <p className="mb-6 max-w-3xl text-muted">
        Supabase 카카오/네이버 로그인 + 토스페이먼츠 단건/정기결제 + 랜딩 템플릿 + 법적 필수
        문구까지 한 번에 제공하는 한국형 SaaS 보일러플레이트입니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/payments/one-time"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          단건 결제 시작하기
        </Link>
        <Link
          href="/payments/subscription"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold"
        >
          구독 결제 시작하기
        </Link>
      </div>
    </section>
  );
}
