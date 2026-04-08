# 한국형 SaaS 보일러플레이트 v1.0

비개발자 기획자를 위해 한국형 인증/결제 인프라를 기본 탑재한 Next.js 스타터킷입니다.

## 핵심 구성
- Next.js(App Router) + Tailwind CSS
- Supabase Auth(카카오/네이버 OAuth)
- Zustand 전역 인증 세션 상태
- 토스페이먼츠 위젯(단건/정기 구독)
- 이용약관/개인정보처리방침 기본 템플릿

## 빠른 시작
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 주요 경로
- 랜딩: `/`
- 단건 결제: `/payments/one-time`
- 정기 구독 결제: `/payments/subscription`
- 정기 구독 인증 성공(빌링키 발급/첫 과금): `/payments/subscription/success`
- 결제수단 변경 유도: `/payments/update-method`
- 결제 성공: `/payments/success`
- 결제 실패: `/payments/fail`
- 이용약관: `/legal/terms`
- 개인정보처리방침: `/legal/privacy`
- 정책 재동의 안내: `/legal/consent-required`

## 세팅 가이드
`docs/notion-setup-guide.md`를 확인하세요.

## AI 툴 사용법 (바이브코더용)
1. 공통 실전 루틴 먼저 확인: `docs/ai-coding-tools-0to10-guide.md`
2. 사용하는 도구별 사례 확인: `docs/vibe-coder-tools-4cases-guide.md`
3. 티켓 1개를 골라 프롬프트 템플릿으로 요청
4. 작업 후 `npm run test && npm run lint && npm run build`
5. 결과를 `docs/execution-log.md`에 기록

## 프로덕션 기획 문서
- PRD v2.0: `docs/prd-v2.0-production.md`
- Jira 스타일 백로그: `docs/product-backlog-v2.0.md`
- Sprint 1 작업지시서: `docs/sprint-1-execution-plan.md`
- Jira Import CSV: `docs/jira-import-csv-sprint1.csv`
- Sprint 2 작업지시서: `docs/sprint-2-execution-plan.md`
- Sprint 3 작업지시서: `docs/sprint-3-execution-plan.md`
- Jira Import CSV (Sprint 2): `docs/jira-import-csv-sprint2.csv`
- Jira Import CSV (Sprint 3): `docs/jira-import-csv-sprint3.csv`
- 단계별 실행 로그: `docs/execution-log.md`
- v2 완성도 평가: `docs/v2-maturity-assessment.md`
- v2 현업 리서치 비교: `docs/v2-research-benchmark.md`
- v2 테스트 전략: `docs/v2-test-strategy.md`
- AI 툴 0 to 10 실전 가이드: `docs/ai-coding-tools-0to10-guide.md`
- 바이브코더 툴 4가지 사례: `docs/vibe-coder-tools-4cases-guide.md`
- 보호 라우트 목록: `docs/protected-routes.md`
- 백업/복구 Runbook: `docs/backup-recovery-runbook.md`
- 월간 복구 리허설 체크리스트: `docs/monthly-recovery-drill-checklist.md`
