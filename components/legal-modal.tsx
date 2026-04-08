"use client";

type LegalModalProps = {
  type: "terms" | "privacy" | null;
  onClose: () => void;
};

const termsText = `
제1조 (목적)
본 약관은 서비스 이용과 관련한 기본 조건을 규정합니다.

제2조 (서비스 제공)
회사는 안정적인 서비스 제공을 위해 최선을 다합니다.

제3조 (회원의 의무)
회원은 관계 법령 및 본 약관을 준수해야 합니다.
`;

const privacyText = `
1. 수집 항목: 이메일, 이름, 결제 관련 식별자
2. 수집 목적: 회원 관리, 결제 처리, 고객 지원
3. 보유 기간: 관련 법령이 정한 기간 또는 회원 탈퇴 시까지
`;

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold">{type === "terms" ? "이용약관" : "개인정보처리방침"}</h2>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          {type === "terms" ? termsText : privacyText}
        </pre>
        <div className="mt-4 text-right">
          <button
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
