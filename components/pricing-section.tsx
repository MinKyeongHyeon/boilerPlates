import Link from "next/link";

const plans = [
  {
    title: "단건 결제",
    price: "9,900원",
    unit: "1회",
    href: "/payments/one-time",
    description: "전자책, 컨설팅, 디지털 템플릿 같은 1회성 상품 판매에 적합",
  },
  {
    title: "정기 구독",
    price: "29,000원",
    unit: "월",
    href: "/payments/subscription",
    description: "SaaS, 커뮤니티, 멤버십 서비스처럼 반복 과금이 필요한 상품에 적합",
  },
];

export function PricingSection() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <article key={plan.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-bold">{plan.title}</h2>
          <p className="mt-2 text-3xl font-bold">
            {plan.price}
            <span className="ml-1 text-sm font-medium text-muted">/ {plan.unit}</span>
          </p>
          <p className="mt-3 min-h-12 text-sm text-muted">{plan.description}</p>
          <Link
            href={plan.href}
            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {plan.title} 결제 플로우 보기
          </Link>
        </article>
      ))}
    </section>
  );
}
