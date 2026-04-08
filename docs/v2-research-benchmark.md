# v2 현업 사례 비교 리서치

## 비교 대상
- Stripe Webhooks 문서 및 운영 베스트프랙티스
- Supabase Production Checklist/RLS 가이드
- Toss Payments Webhook/API 가이드

## 핵심 비교 결과

### 1) 결제 웹훅 정합성 (Stripe 사례)
- 현업 패턴:
  - 중복 이벤트 전송을 전제로 idempotency 설계
  - 이벤트 순서 역전(out-of-order) 허용 설계
  - 빠른 2xx 응답 후 비동기 처리 권장
- 우리 v2 상태:
  - WH-001/WH-002로 방향은 일치
  - 비동기 큐/재조정 배치까지는 구현 항목으로만 정의된 상태
- 반영 액션:
  - WH-004, WH-005 우선순위 유지
  - 재조정 배치(일 1회) 명시

### 2) 인증/DB 보안 (Supabase 사례)
- 현업 패턴:
  - 모든 공개 스키마 테이블 RLS 활성화
  - 정책 컬럼 인덱스 최적화
  - getSession/getUser 역할 분리
- 우리 v2 상태:
  - PRD/NFR 수준에서 명시됨
  - 실행 백로그에 보안 정책 테스트가 아직 제한적
- 반영 액션:
  - Sprint 2에 RLS 검증 체크리스트 추가 필요

### 3) 국내 결제 운영 (Toss 사례)
- 현업 패턴:
  - 결제 상태 변경 웹훅 수신 후 내부 상태 동기화
  - 키 관리(테스트/운영 분리)와 장애 대응 경로 필수
- 우리 v2 상태:
  - 빌링키 발급/과금 API 기본 흐름 구현 완료
  - 웹훅 서명 검증/실패 재처리 자동화는 예정 단계
- 반영 액션:
  - WH-003/WH-004를 출시 직전 필수 게이트로 지정

## 벤치마크 점검표 (현재)
- idempotency 키 설계: 부분 충족
- out-of-order 대응: 부분 충족
- 서명 검증: 계획됨
- 재처리 큐: 계획됨
- 재조정 배치: 계획됨
- RLS 검증 테스트: 미흡
- 결제 핵심 단위 테스트: 충족

## 참고 링크
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Toss Webhooks](https://docs.tosspayments.com/en/webhooks)
- [Toss API Guide](https://docs.tosspayments.com/en/api-guide)
