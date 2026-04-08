# 보호 라우트 목록 (AUTH-003)

다음 경로는 로그인 세션이 없으면 접근이 차단되며, 홈(`/`)으로 이동됩니다.

## 보호 대상
- `/payments/one-time`
- `/payments/subscription`
- `/payments/update-method`

## 비보호 대상
- `/` (랜딩)
- `/auth/callback` (OAuth 콜백)
- `/payments/success`, `/payments/fail` (결제 콜백 페이지)
- `/payments/subscription/success` (빌링 인증 후 처리 페이지)
- `/legal/consent-required` (재동의 안내 페이지)
- `/legal/terms`, `/legal/privacy`

## 동작 방식
- `components/protected-route.tsx`에서 Zustand 세션 상태를 확인
- 세션 없음 + 로딩 완료 상태면 `/?needsLogin=1`로 리다이렉트
- 세션은 있으나 최신 정책 미동의 상태면 `/legal/consent-required`로 리다이렉트
