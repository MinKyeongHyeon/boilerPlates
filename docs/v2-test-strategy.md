# v2 오류 대비 테스트 전략

## 목표
- 결제/구독 운영에서 치명적 오류를 사전에 차단한다.
- "입력 검증 실패 / 설정 누락 / 외부 응답 이상" 3축을 자동 테스트로 커버한다.

## 우선 테스트 영역
- `lib/toss-server.ts`
- `app/api/toss/billing/issue/route.ts`
- `app/api/toss/billing/charge/route.ts`

## 구현된 테스트케이스
- `tests/lib/toss-server.test.ts`
  - 시크릿 키 누락 예외
  - 시크릿 키 정상 반환
  - Basic Auth 헤더 생성 검증
- `tests/api/toss-billing-issue.test.ts`
  - 필수 파라미터 누락 시 400
  - 정상 요청 시 200 + payload 전달
  - 시크릿 키 누락 시 500
- `tests/api/toss-billing-charge.test.ts`
  - 필수 파라미터 누락 시 400
  - 정상 요청 시 200 + payload 전달
  - 시크릿 키 누락 시 500

## 실행 명령
- 전체 테스트: `npm run test`
- 커버리지: `npm run test:coverage`

## 다음 확장 테스트 (백로그 연동)
- WH-003: 웹훅 서명 검증 실패(401) 테스트 (완료)
- WH-004: Dead-letter 저장/재처리 테스트 (완료)
- BILL-003: 결제 승인 저장/중복 orderId 차단 테스트 (완료)
- OPS-001: 환불 요청 성공/실패/필수값 테스트 (완료)
- OPS-002: 부분 환불 누적 한도 계약 테스트 (완료)
- BILL-004: 구독 실패 재시도 스케줄(D+1/D+3/D+7)/한도초과 테스트 (완료)
- AUTH-004: 계정 삭제 API 인증/확인문구/성공 테스트 (완료)
- LEGAL-001/002: 정책 버전 조회/동의 저장/사용자 동의 조회 테스트 (완료)
- LEGAL-003: 구버전 동의 차단(409) + 미동의 보호 라우트 차단 (완료)
- REL-002: 감사로그 저장 유틸 테스트 (완료)
- REL-003: rate limit 유틸 테스트 + 보안 헤더 미들웨어 적용 (완료)
- OPS-003: 즉시해지/기간만료해지 정책 분기 API 테스트 (완료)
- AUTH-002: 세션 만료/재로그인 흐름 테스트
