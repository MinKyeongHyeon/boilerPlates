export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">개인정보처리방침 (더미 텍스트)</h1>
      <div className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-surface p-6 text-sm leading-7">
        {`1. 개인정보 수집 항목
회사는 서비스 제공을 위해 이메일, 이름, 결제 관련 식별자 등을 수집할 수 있습니다.

2. 개인정보 이용 목적
회원 관리, 결제 처리, 서비스 개선 및 고객 문의 대응을 위해 개인정보를 이용합니다.

3. 개인정보 보관 및 파기
관련 법령에 따른 보관 기간 경과 시 또는 이용 목적 달성 후 즉시 파기합니다.`}
      </div>
    </main>
  );
}
