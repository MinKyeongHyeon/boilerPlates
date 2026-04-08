# 한국형 SaaS 보일러플레이트 세팅 가이드

이 문서는 비개발자도 따라할 수 있도록 구성된 극도로 친절한 세팅 안내서입니다.

## 1) Supabase 프로젝트 만들기
1. [Supabase](https://supabase.com) 로그인 후 `New project`를 누릅니다.
2. 프로젝트 이름을 입력하고 리전을 선택한 뒤 생성합니다.
3. `Settings > API`에서 아래 값 2개를 복사합니다.
   - `Project URL`
   - `anon public key`

## 2) 소셜 로그인 공급자 설정 (카카오/네이버)
1. Supabase 콘솔에서 `Authentication > Providers`로 이동합니다.
2. `Kakao`, `Naver`를 각각 활성화합니다.
3. 공급자 콘솔(카카오 디벨로퍼스/네이버 개발자센터)에서 콜백 URL을 Supabase 안내값으로 등록합니다.

## 3) 토스페이먼츠 키 발급
1. [토스페이먼츠](https://www.tosspayments.com/) 가입 후 테스트 키를 발급받습니다.
2. 클라이언트 키(`test_ck_...`)를 복사합니다.
3. 시크릿 키(`test_sk_...`)도 함께 복사합니다. (서버 검증/정기결제 API 호출에 필요)

## 4) 환경 변수 입력
1. 프로젝트 루트에서 `.env.example`을 복사해 `.env.local` 파일을 만듭니다.
2. 값을 본인 키로 교체합니다.

```bash
cp .env.example .env.local
```

## 5) 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하면 랜딩/로그인/결제 페이지를 확인할 수 있습니다.

## 6) 정기결제 운영형 흐름 확인
1. `/payments/subscription` 접속
2. `빌링 인증 시작하기` 버튼 클릭
3. 인증 성공 시 `/payments/subscription/success`에서 자동으로
   - 빌링키 발급 API 호출
   - 첫 결제 API 호출
   순서로 실행됩니다.

## 7) AI 코딩 툴 실전 운영 가이드 (필수)
단순 키 입력이 아니라, 실제 기능 개발/검증/기록 루틴은 아래 문서를 기준으로 진행하세요.

- `docs/ai-coding-tools-0to10-guide.md`
