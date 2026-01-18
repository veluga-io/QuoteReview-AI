# 작업 목록: 클라이언트 견적서 검수 시스템 (MVP)

**Generated**: 2026-01-18
**Plan**: [plan.md](./plan.md)
**Spec**: [spec.md](./spec.md)

## 개요

이 작업 목록은 구현 계획을 실행 가능한 태스크로 분해한 것입니다. 각 작업은 독립적으로 완료 가능하며, 의존성이 명시되어 있습니다.

**총 예상 기간**: 13-20일 (AI 통합 포함)
**스프린트 구성**: 3개 스프린트 (Sprint 0, 1, 2)
**AI 기술 스택**: Google Gemini 2.0 Flash (맥락 분석, 이상 패턴 감지)

---

## Sprint 0: Infrastructure & Foundation (3-5일)

### Epic 0.1: 프로젝트 초기화 (1일)

#### TASK-001: Vite + React + TypeScript 프로젝트 생성
- **설명**: 프론트엔드 프로젝트 기본 구조 생성
- **예상 시간**: 2시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] `npm create vite@latest frontend -- --template react-ts` 실행
  - [ ] 프로젝트 생성 확인
  - [ ] `npm install` 실행 및 정상 작동 확인
  - [ ] `npm run dev` 실행하여 localhost:5173에서 확인

#### TASK-002: Material-UI 및 의존성 설치
- **설명**: MUI, styled-components, i18next, react-router 설치
- **예상 시간**: 1시간
- **의존성**: TASK-001
- **체크리스트**:
  - [ ] `npm install @mui/material @emotion/react @emotion/styled` 실행
  - [ ] `npm install styled-components` 실행
  - [ ] `npm install i18next react-i18next` 실행
  - [ ] `npm install react-router-dom` 실행
  - [ ] `npm install @supabase/supabase-js` 실행
  - [ ] `package.json`에 모든 의존성 확인

#### TASK-003: ESLint, Prettier, TypeScript 설정
- **설명**: 코드 품질 도구 설정
- **예상 시간**: 2시간
- **의존성**: TASK-001
- **체크리스트**:
  - [ ] `.eslintrc.js` 생성 (React, TypeScript 규칙)
  - [ ] `.prettierrc` 생성 (코드 포맷팅 규칙)
  - [ ] `tsconfig.json` strict 모드 활성화
  - [ ] `npm run lint` 스크립트 추가 및 실행 확인
  - [ ] VSCode 설정 파일 `.vscode/settings.json` 생성 (자동 포맷팅)

#### TASK-004: Git 브랜치 전략 설정
- **설명**: main, dev 브랜치 생성 및 보호 규칙 설정
- **예상 시간**: 1시간
- **의존성**: TASK-001
- **체크리스트**:
  - [ ] `git checkout -b dev` (dev 브랜치 생성)
  - [ ] `git push -u origin dev` (dev 브랜치 푸시)
  - [ ] GitHub에서 `main` 브랜치 보호 규칙 설정 (PR 필수)
  - [ ] `.gitignore` 확인 (node_modules, .env, dist 포함)
  - [ ] 브랜치 전략 문서화 (README.md에 추가)

---

### Epic 0.2: Supabase 프로젝트 설정 (1일)

#### TASK-005: Supabase 프로젝트 생성
- **설명**: Supabase Cloud 또는 Local 프로젝트 설정
- **예상 시간**: 1시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] Supabase Cloud에서 새 프로젝트 생성 (또는 로컬 설정)
  - [ ] 프로젝트 URL 및 anon key 복사
  - [ ] 프로젝트 대시보드 접근 확인

#### TASK-006: Supabase CLI 설치 및 초기화
- **설명**: 로컬 개발 환경에 Supabase CLI 설정
- **예상 시간**: 1시간
- **의존성**: TASK-005
- **체크리스트**:
  - [ ] `npm install -g supabase` 실행
  - [ ] 프로젝트 루트에서 `supabase init` 실행
  - [ ] `supabase/config.toml` 파일 생성 확인
  - [ ] `supabase login` 실행 (인증)
  - [ ] `supabase link --project-ref <your-project-ref>` 실행

#### TASK-007: 환경 변수 설정
- **설명**: `.env` 파일 생성 및 Supabase 연결 정보 설정
- **예상 시간**: 30분
- **의존성**: TASK-005, TASK-006
- **체크리스트**:
  - [ ] `frontend/.env.example` 파일 생성 (템플릿)
  - [ ] `frontend/.env` 파일 생성 (실제 값)
  - [ ] `VITE_SUPABASE_URL` 설정
  - [ ] `VITE_SUPABASE_ANON_KEY` 설정
  - [ ] `.env` 파일이 `.gitignore`에 포함되었는지 확인

#### TASK-008: Supabase 클라이언트 설정
- **설명**: 프론트엔드에서 Supabase 클라이언트 초기화
- **예상 시간**: 30분
- **의존성**: TASK-007, TASK-002
- **체크리스트**:
  - [ ] `frontend/src/services/supabase.ts` 파일 생성
  - [ ] `createClient()` 함수로 Supabase 클라이언트 초기화
  - [ ] 환경 변수 로드 확인 (`import.meta.env`)
  - [ ] 테스트 쿼리 실행하여 연결 확인

---

### Epic 0.3: 사용자 인증 구현 (1일)

#### TASK-009: Supabase Auth 설정
- **설명**: Supabase 대시보드에서 Email/Password 인증 활성화
- **예상 시간**: 30분
- **의존성**: TASK-005
- **체크리스트**:
  - [ ] Supabase 대시보드 → Authentication → Providers 이동
  - [ ] Email provider 활성화
  - [ ] Email 템플릿 확인 (회원가입, 비밀번호 재설정)
  - [ ] Site URL 설정 (http://localhost:5173)

#### TASK-010: useAuth Hook 구현
- **설명**: 사용자 세션 관리 커스텀 Hook 생성
- **예상 시간**: 2시간
- **의존성**: TASK-008
- **체크리스트**:
  - [ ] `frontend/src/hooks/useAuth.ts` 파일 생성
  - [ ] `useState`로 user, loading 상태 관리
  - [ ] `useEffect`로 세션 초기화 및 auth 변경 감지
  - [ ] `signIn`, `signUp`, `signOut` 함수 구현
  - [ ] 에러 처리 추가

#### TASK-011: 로그인 페이지 구현
- **설명**: Material-UI로 로그인 폼 구현
- **예상 시간**: 3시간
- **의존성**: TASK-010, TASK-002
- **체크리스트**:
  - [ ] `frontend/src/pages/LoginPage.tsx` 생성
  - [ ] MUI `TextField`, `Button`, `Card` 컴포넌트 사용
  - [ ] 이메일/비밀번호 입력 폼 구현
  - [ ] `useAuth` Hook 사용하여 로그인 처리
  - [ ] 로딩 상태 및 에러 메시지 표시
  - [ ] 로그인 성공 시 `/dashboard`로 리다이렉트

#### TASK-012: 회원가입 페이지 구현
- **설명**: 회원가입 폼 구현 (선택 사항)
- **예상 시간**: 2시간
- **의존성**: TASK-010, TASK-002
- **체크리스트**:
  - [ ] `frontend/src/pages/SignUpPage.tsx` 생성
  - [ ] 이메일, 비밀번호, 비밀번호 확인 입력 폼
  - [ ] 비밀번호 강도 검증
  - [ ] `useAuth` Hook 사용하여 회원가입 처리
  - [ ] 회원가입 성공 시 이메일 확인 안내 표시

#### TASK-013: 보호된 라우트 구현
- **설명**: 인증된 사용자만 접근 가능한 라우트 보호
- **예상 시간**: 1시간
- **의존성**: TASK-010
- **체크리스트**:
  - [ ] `frontend/src/components/common/PrivateRoute.tsx` 생성
  - [ ] `useAuth` Hook으로 사용자 인증 상태 확인
  - [ ] 미인증 시 `/login`으로 리다이렉트
  - [ ] 로딩 상태 표시 (세션 확인 중)
  - [ ] React Router에 적용

---

### Epic 0.4: 반응형 UI 및 다크 모드 (1일)

#### TASK-014: MUI 테마 설정 (Light/Dark 모드)
- **설명**: Material-UI 테마 생성 및 다크 모드 지원
- **예상 시간**: 2시간
- **의존성**: TASK-002
- **체크리스트**:
  - [ ] `frontend/src/theme/index.ts` 생성
  - [ ] `createTheme()` 함수로 light, dark 테마 정의
  - [ ] 한글 로케일 (`koKR`) 적용
  - [ ] 색상 팔레트 정의 (primary, secondary, background)
  - [ ] 폰트 패밀리 설정 ("Noto Sans KR")

#### TASK-015: useTheme Hook 구현 (다크 모드 토글)
- **설명**: 다크 모드 전환 Hook 및 로컬 스토리지 저장
- **예상 시간**: 1시간
- **의존성**: TASK-014
- **체크리스트**:
  - [ ] `frontend/src/hooks/useTheme.ts` 생성
  - [ ] `useState`로 테마 모드 관리 ('light' | 'dark')
  - [ ] `useEffect`로 로컬 스토리지에서 테마 로드
  - [ ] `toggleTheme()` 함수 구현
  - [ ] 테마 변경 시 로컬 스토리지 업데이트

#### TASK-016: App.tsx에 테마 프로바이더 적용
- **설명**: 전역 테마 프로바이더 설정
- **예상 시간**: 1시간
- **의존성**: TASK-014, TASK-015
- **체크리스트**:
  - [ ] `App.tsx`에 `ThemeProvider` 임포트
  - [ ] `useTheme` Hook 사용
  - [ ] `CssBaseline` 컴포넌트 추가 (MUI 기본 스타일)
  - [ ] 다크 모드 토글 버튼 추가 (AppBar에)

#### TASK-017: 반응형 브레이크포인트 설정
- **설명**: 모바일, 태블릿, 데스크톱 브레이크포인트 정의
- **예상 시간**: 1시간
- **의존성**: TASK-014
- **체크리스트**:
  - [ ] MUI 테마에 breakpoints 커스터마이징 (옵션)
  - [ ] `useMediaQuery` Hook 사용 예제 작성
  - [ ] xs (모바일), sm (태블릿), md+ (데스크톱) 반응형 테스트
  - [ ] 반응형 컴포넌트 예제 생성 (예: AppBar)

---

### Epic 0.5: 한글 국제화 (i18n) (0.5일)

#### TASK-018: i18next 설정
- **설명**: i18next 라이브러리 설정 및 한글 기본 언어 설정
- **예상 시간**: 1시간
- **의존성**: TASK-002
- **체크리스트**:
  - [ ] `frontend/src/i18n/index.ts` 생성
  - [ ] `i18next`, `react-i18next` 초기화
  - [ ] 기본 언어 'ko' 설정
  - [ ] `App.tsx`에 i18n 임포트

#### TASK-019: 한글 번역 파일 생성
- **설명**: 한글 번역 JSON 파일 생성
- **예상 시간**: 2시간
- **의존성**: TASK-018
- **체크리스트**:
  - [ ] `frontend/src/i18n/locales/ko.json` 생성
  - [ ] 인증 관련 번역 키 추가 (login, logout, email, password)
  - [ ] 템플릿 관련 번역 키 추가 (template, create, upload)
  - [ ] 검증 관련 번역 키 추가 (validation, pass, fail, warning)
  - [ ] 공통 번역 키 추가 (save, cancel, delete, edit)

#### TASK-020: UI 컴포넌트에 번역 적용
- **설명**: 기존 UI 텍스트를 번역 키로 변환
- **예상 시간**: 1시간
- **의존성**: TASK-019
- **체크리스트**:
  - [ ] `LoginPage.tsx`에 `useTranslation` Hook 적용
  - [ ] 하드코딩된 텍스트를 `t('auth.login')` 형식으로 변경
  - [ ] 번역 누락 확인 (개발 서버에서 테스트)

---

### Epic 0.6: 대시보드 레이아웃 (1일)

#### TASK-021: DashboardLayout 컴포넌트 구현
- **설명**: AppBar + Sidebar + Content 레이아웃 구현
- **예상 시간**: 3시간
- **의존성**: TASK-002, TASK-014
- **체크리스트**:
  - [ ] `frontend/src/components/layout/DashboardLayout.tsx` 생성
  - [ ] MUI `AppBar`, `Drawer`, `Toolbar` 사용
  - [ ] 반응형 Sidebar (모바일: temporary, 데스크톱: permanent)
  - [ ] `useMediaQuery`로 모바일/데스크톱 감지
  - [ ] Sidebar 토글 버튼 추가 (모바일)

#### TASK-022: 네비게이션 메뉴 구현
- **설명**: Sidebar 메뉴 항목 추가
- **예상 시간**: 2시간
- **의존성**: TASK-021
- **체크리스트**:
  - [ ] 메뉴 항목 배열 정의 (대시보드, 템플릿 관리, 견적서 검증)
  - [ ] MUI `List`, `ListItem`, `ListItemButton` 사용
  - [ ] 아이콘 추가 (`@mui/icons-material`)
  - [ ] React Router `useNavigate`로 페이지 전환
  - [ ] 현재 페이지 하이라이트 (active 상태)

#### TASK-023: 사용자 프로필 메뉴 구현
- **설명**: AppBar에 사용자 프로필 및 로그아웃 메뉴 추가
- **예상 시간**: 2시간
- **의존성**: TASK-021, TASK-010
- **체크리스트**:
  - [ ] AppBar 우측에 사용자 아이콘 버튼 추가
  - [ ] MUI `Menu`, `MenuItem` 사용
  - [ ] "프로필", "설정", "로그아웃" 메뉴 항목 추가
  - [ ] 로그아웃 클릭 시 `useAuth.signOut()` 호출
  - [ ] 다크 모드 토글 추가 (선택 사항)

#### TASK-024: 라우팅 설정
- **설명**: React Router로 페이지 라우팅 구성
- **예상 시간**: 1시간
- **의존성**: TASK-021, TASK-011, TASK-013
- **체크리스트**:
  - [ ] `frontend/src/App.tsx`에 `BrowserRouter`, `Routes`, `Route` 설정
  - [ ] `/login` 라우트 추가 (LoginPage)
  - [ ] `/dashboard` 라우트 추가 (DashboardPage, PrivateRoute)
  - [ ] `/templates` 라우트 추가 (TemplatesPage, PrivateRoute)
  - [ ] `/validation` 라우트 추가 (ValidationPage, PrivateRoute)
  - [ ] 기본 라우트 `/` → `/dashboard` 리다이렉트

---

### Epic 0.7: Git 전략 및 GitHub Actions (1일)

#### TASK-025: GitHub Actions CI 워크플로 작성
- **설명**: Lint, Test, Build를 자동화하는 CI 워크플로
- **예상 시간**: 2시간
- **의존성**: TASK-003
- **체크리스트**:
  - [ ] `.github/workflows/ci.yml` 생성
  - [ ] Node.js 20 설정
  - [ ] `npm ci` (의존성 설치)
  - [ ] `npm run lint` (린트 검사)
  - [ ] `npm run test` (유닛 테스트)
  - [ ] `npm run build` (빌드)
  - [ ] 모든 브랜치 푸시 및 PR에서 실행되도록 설정

#### TASK-026: GitHub Actions 배포 워크플로 (Dev) 작성
- **설명**: dev 브랜치를 GitHub Pages `/dev`로 배포
- **예상 시간**: 2시간
- **의존성**: TASK-025
- **체크리스트**:
  - [ ] `.github/workflows/deploy-dev.yml` 생성
  - [ ] `dev` 브랜치 푸시 시 트리거
  - [ ] 빌드 후 `peaceiris/actions-gh-pages` 사용
  - [ ] `destination_dir: dev` 설정
  - [ ] GitHub Secrets에 `DEV_SUPABASE_URL`, `DEV_SUPABASE_ANON_KEY` 추가

#### TASK-027: GitHub Actions 배포 워크플로 (Production) 작성
- **설명**: main 브랜치를 GitHub Pages 루트로 배포
- **예상 시간**: 1시간
- **의존성**: TASK-026
- **체크리스트**:
  - [ ] `.github/workflows/deploy-prod.yml` 생성
  - [ ] `main` 브랜치 푸시 시 트리거
  - [ ] 빌드 후 GitHub Pages 루트로 배포
  - [ ] GitHub Secrets에 `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY` 추가

#### TASK-028: 브랜치 보호 규칙 설정
- **설명**: main 브랜치 보호 및 PR 필수 설정
- **예상 시간**: 30분
- **의존성**: TASK-004
- **체크리스트**:
  - [ ] GitHub → Settings → Branches 이동
  - [ ] `main` 브랜치 보호 규칙 추가
  - [ ] "Require pull request before merging" 활성화
  - [ ] "Require status checks to pass before merging" 활성화 (CI)
  - [ ] "Require conversation resolution before merging" 활성화 (선택)

---

## Sprint 1: Data Model & Contracts (2-3일)

### Epic 1.1: 데이터베이스 스키마 설계 (1.5일)

#### TASK-029: 초기 스키마 마이그레이션 작성
- **설명**: profiles, templates, submissions, findings, audit_logs 테이블 생성
- **예상 시간**: 3시간
- **의존성**: TASK-006
- **체크리스트**:
  - [ ] `supabase/migrations/001_initial_schema.sql` 생성
  - [ ] `profiles` 테이블 생성 (id, email, full_name, role, created_at, updated_at)
  - [ ] `templates` 테이블 생성 (id, name, status, file_url, required_fields, validation_rules, created_by, etc.)
  - [ ] `submissions` 테이블 생성 (id, template_id, file_url, status, overall_status, submitted_by, etc.)
  - [ ] `findings` 테이블 생성 (id, submission_id, severity, category, message, location, etc.)
  - [ ] `audit_logs` 테이블 생성 (Phase 2+ 준비)
  - [ ] 인덱스 생성 (status, created_by, submission_id, etc.)
  - [ ] `updated_at` 트리거 함수 생성

#### TASK-030: RLS 정책 마이그레이션 작성
- **설명**: Row Level Security 정책 설정
- **예상 시간**: 2시간
- **의존성**: TASK-029
- **체크리스트**:
  - [ ] `supabase/migrations/002_rls_policies.sql` 생성
  - [ ] 모든 테이블에 RLS 활성화
  - [ ] `profiles` 정책: 자신의 프로필만 조회/수정
  - [ ] `templates` 정책: 인증된 사용자는 active 템플릿 조회, 관리자만 생성/수정
  - [ ] `submissions` 정책: 자신의 제출만 조회, 관리자는 모든 제출 조회
  - [ ] `findings` 정책: 자신의 제출에 대한 발견 사항만 조회
  - [ ] `audit_logs` 정책: 관리자만 조회 (Phase 2+)

#### TASK-031: 마이그레이션 실행 및 검증
- **설명**: 로컬 Supabase에 마이그레이션 적용
- **예상 시간**: 1시간
- **의존성**: TASK-029, TASK-030
- **체크리스트**:
  - [ ] `supabase db reset` 실행 (모든 마이그레이션 적용)
  - [ ] Supabase 대시보드에서 테이블 생성 확인
  - [ ] RLS 정책 활성화 확인
  - [ ] 샘플 데이터 삽입 테스트 (수동 또는 SQL)
  - [ ] 정책 테스트 (인증된 사용자로 쿼리 시도)

#### TASK-032: 시드 데이터 작성 (선택 사항)
- **설명**: 개발/테스트용 초기 데이터 생성
- **예상 시간**: 1시간
- **의존성**: TASK-031
- **체크리스트**:
  - [ ] `supabase/seed.sql` 생성
  - [ ] 테스트 사용자 생성 (admin, staff)
  - [ ] 샘플 템플릿 데이터 생성
  - [ ] `supabase db reset` 실행 시 시드 데이터 자동 삽입 확인

---

### Epic 1.2: TypeScript 타입 정의 (0.5일)

#### TASK-033: Supabase 타입 생성
- **설명**: Supabase CLI로 데이터베이스 타입 생성
- **예상 시간**: 30분
- **의존성**: TASK-031
- **체크리스트**:
  - [ ] `supabase gen types typescript --local > frontend/src/types/database.ts` 실행
  - [ ] `database.ts` 파일 생성 확인
  - [ ] TypeScript 컴파일 오류 없는지 확인

#### TASK-034: 도메인 타입 정의 (Template)
- **설명**: Template 관련 TypeScript 타입 정의
- **예상 시간**: 1시간
- **의존성**: TASK-033
- **체크리스트**:
  - [ ] `frontend/src/types/template.ts` 생성
  - [ ] `Template` 인터페이스 정의
  - [ ] `RequiredField` 인터페이스 정의
  - [ ] `ValidationRules` 인터페이스 정의
  - [ ] `MathRule`, `PolicyRule`, `ConsistencyRule` 인터페이스 정의

#### TASK-035: 도메인 타입 정의 (Validation)
- **설명**: Validation 관련 TypeScript 타입 정의
- **예상 시간**: 1시간
- **의존성**: TASK-033
- **체크리스트**:
  - [ ] `frontend/src/types/validation.ts` 생성
  - [ ] `Submission` 인터페이스 정의
  - [ ] `Finding` 인터페이스 정의
  - [ ] `ValidationReport` 인터페이스 정의
  - [ ] `ParsedQuote` 인터페이스 정의 (Excel 파싱 결과)

---

### Epic 1.3: API 계약 정의 (0.5일)

#### TASK-036: OpenAPI 명세 작성
- **설명**: API 엔드포인트 및 스키마 문서화
- **예상 시간**: 2시간
- **의존성**: TASK-034, TASK-035
- **체크리스트**:
  - [ ] `specs/001-quote-review/contracts/` 디렉토리 생성
  - [ ] `api.openapi.yaml` 파일 생성
  - [ ] `/templates` 엔드포인트 정의 (GET, POST)
  - [ ] `/templates/{id}` 엔드포인트 정의 (GET)
  - [ ] `/submissions` 엔드포인트 정의 (POST)
  - [ ] `/submissions/{id}` 엔드포인트 정의 (GET)
  - [ ] 모든 스키마 정의 (Template, Submission, Finding, ValidationReport)

#### TASK-037: API 클라이언트 타입 생성 (선택 사항)
- **설명**: OpenAPI 명세에서 TypeScript 타입 생성
- **예상 시간**: 1시간
- **의존성**: TASK-036
- **체크리스트**:
  - [ ] `openapi-typescript` 또는 유사 도구 설치
  - [ ] `api.openapi.yaml` → TypeScript 타입 생성
  - [ ] `frontend/src/types/api.ts` 파일 확인
  - [ ] API 클라이언트에서 타입 사용

---

### Epic 1.4: Quickstart 문서 작성 (0.5일)

#### TASK-038: 개발 환경 설정 가이드 작성
- **설명**: 로컬 개발 환경 설정 단계 문서화
- **예상 시간**: 1시간
- **의존성**: TASK-031
- **체크리스트**:
  - [ ] `specs/001-quote-review/quickstart.md` 생성
  - [ ] Prerequisites 섹션 (Node.js, npm, Supabase CLI)
  - [ ] Setup 단계 (clone, install, supabase start, env 설정)
  - [ ] 개발 서버 실행 방법
  - [ ] 테스트 실행 방법

#### TASK-039: 사용자 가이드 작성
- **설명**: Admin 및 Staff 워크플로우 가이드
- **예상 시간**: 1시간
- **의존성**: TASK-038
- **체크리스트**:
  - [ ] Admin 워크플로우 (템플릿 생성 단계)
  - [ ] Staff 워크플로우 (견적서 검증 단계)
  - [ ] 스크린샷 추가 (선택 사항)

---

## Sprint 2: Core Implementation & Testing (5-7일 + 2-3일 테스트)

### Epic 2.1: 템플릿 관리 구현 (2일)

#### TASK-040: 템플릿 CRUD 서비스 구현
- **설명**: Supabase 클라이언트를 사용한 템플릿 CRUD
- **예상 시간**: 3시간
- **의존성**: TASK-008, TASK-033
- **체크리스트**:
  - [ ] `frontend/src/services/templates.ts` 생성
  - [ ] `getTemplates()` 함수 (활성 템플릿 목록 조회)
  - [ ] `getTemplateById(id)` 함수 (특정 템플릿 조회)
  - [ ] `createTemplate(data)` 함수 (템플릿 생성)
  - [ ] `updateTemplate(id, data)` 함수 (템플릿 수정)
  - [ ] `deleteTemplate(id)` 함수 (템플릿 삭제, 선택 사항)
  - [ ] 에러 처리 추가

#### TASK-041: 파일 업로드 서비스 구현
- **설명**: Supabase Storage를 사용한 파일 업로드
- **예상 시간**: 2시간
- **의존성**: TASK-008
- **체크리스트**:
  - [ ] `frontend/src/services/storage.ts` 생성
  - [ ] Supabase Storage 버킷 생성 (`templates`, `quotes`)
  - [ ] `uploadFile(bucket, file)` 함수 (파일 업로드)
  - [ ] `downloadFile(bucket, path)` 함수 (파일 다운로드)
  - [ ] `getFileUrl(bucket, path)` 함수 (파일 URL 생성)
  - [ ] 파일 크기 제한 (100MB) 검증

#### TASK-042: TemplatesPage 구현
- **설명**: 템플릿 목록 페이지
- **예상 시간**: 3시간
- **의존성**: TASK-040
- **체크리스트**:
  - [ ] `frontend/src/pages/TemplatesPage.tsx` 생성
  - [ ] `useTemplates` Hook 생성 (템플릿 목록 조회)
  - [ ] MUI `DataGrid` 또는 `Table`로 템플릿 목록 표시
  - [ ] "템플릿 생성" 버튼 추가
  - [ ] 템플릿 클릭 시 상세 페이지로 이동
  - [ ] 로딩 상태 및 에러 처리

#### TASK-043: TemplateForm 구현 (생성/수정)
- **설명**: 템플릿 생성 및 수정 폼
- **예상 시간**: 4시간
- **의존성**: TASK-040, TASK-041
- **체크리스트**:
  - [ ] `frontend/src/components/templates/TemplateForm.tsx` 생성
  - [ ] MUI `TextField`, `Select`, `Button` 사용
  - [ ] 파일 업로드 필드 (드래그 앤 드롭 지원, 선택 사항)
  - [ ] 필수 필드 정의 UI (동적 추가/삭제)
  - [ ] 검증 규칙 정의 UI (수학 규칙, 정책 규칙)
  - [ ] 폼 검증 (Formik 또는 react-hook-form 사용, 선택 사항)
  - [ ] 저장 버튼 클릭 시 `createTemplate()` 호출
  - [ ] 성공 메시지 표시 및 목록 페이지로 리다이렉트

#### TASK-044: TemplateViewer 구현 (상세 보기)
- **설명**: 템플릿 상세 정보 및 미리보기
- **예상 시간**: 2시간
- **의존성**: TASK-040
- **체크리스트**:
  - [ ] `frontend/src/components/templates/TemplateViewer.tsx` 생성
  - [ ] 템플릿 기본 정보 표시 (이름, 설명, 상태)
  - [ ] 필수 필드 목록 표시
  - [ ] 검증 규칙 목록 표시
  - [ ] 파일 다운로드 버튼
  - [ ] 수정 버튼 (관리자만)
  - [ ] 활성화/비활성화 버튼 (관리자만)

---

### Epic 2.2: Excel 파서 구현 (1일)

#### TASK-045: xlsx 라이브러리 설치 및 테스트
- **설명**: xlsx 라이브러리 설치 및 기본 파싱 테스트
- **예상 시간**: 1시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] `npm install xlsx` 실행
  - [ ] 샘플 Excel 파일 생성 (테스트용)
  - [ ] 간단한 파싱 함수 작성 및 테스트

#### TASK-046: Excel 파서 함수 구현
- **설명**: 견적서 Excel 파일을 ParsedQuote 객체로 변환
- **예상 시간**: 4시간
- **의존성**: TASK-045, TASK-035
- **체크리스트**:
  - [ ] `frontend/src/utils/excel.ts` 생성
  - [ ] `parseExcelQuote(file: File): Promise<ParsedQuote>` 함수 구현
  - [ ] 메타데이터 추출 (견적 번호, 날짜, 고객명, 통화)
  - [ ] 라인 항목 추출 (설명, 수량, 단가, 라인 합계)
  - [ ] 총액 정보 추출 (소계, 할인, 세율, 세액, 총액)
  - [ ] 파싱 오류 처리 (잘못된 파일 포맷, 필수 데이터 누락)

#### TASK-047: 파싱 결과 검증 로직 추가
- **설명**: 파싱된 데이터의 기본 검증
- **예상 시간**: 1시간
- **의존성**: TASK-046
- **체크리스트**:
  - [ ] 필수 필드 존재 여부 확인
  - [ ] 숫자 필드 타입 검증
  - [ ] 빈 라인 항목 필터링
  - [ ] 파싱 오류 시 명확한 에러 메시지 반환

#### TASK-048: Excel 파서 유닛 테스트 작성
- **설명**: Vitest로 Excel 파서 테스트
- **예상 시간**: 2시간
- **의존성**: TASK-046
- **체크리스트**:
  - [ ] `frontend/tests/unit/excel.test.ts` 생성
  - [ ] 정상 파일 파싱 테스트
  - [ ] 잘못된 포맷 파일 테스트
  - [ ] 누락된 필드 테스트
  - [ ] 테스트 픽스처 파일 생성 (`tests/fixtures/`)

---

### Epic 2.3: 검증 엔진 구현 (Hybrid: 결정론적 + AI) (2일)

#### TASK-049: 검증 엔진 기본 구조 구현
- **설명**: validateQuote 함수 및 검증 카테고리별 함수 구조
- **예상 시간**: 1시간
- **의존성**: TASK-035
- **체크리스트**:
  - [ ] `frontend/src/utils/validation.ts` 생성
  - [ ] `validateQuote(quote, template): Finding[]` 함수 정의 (Layer 1: 결정론적)
  - [ ] `validateQuoteComplete(quote, template): Promise<Finding[]>` 함수 정의 (Layer 1 + Layer 2)
  - [ ] `validateMath()`, `validateCompleteness()`, `validatePolicy()`, `validateConsistency()` 함수 정의

#### TASK-050: 수학적 검증 구현
- **설명**: 합계, 할인, 세금 계산 검증
- **예상 시간**: 3시간
- **의존성**: TASK-049
- **체크리스트**:
  - [ ] `validateMath()` 함수 구현
  - [ ] 라인 합계 검증 (수량 × 단가 = 라인 합계)
  - [ ] 소계 검증 (라인 합계의 합 = 소계)
  - [ ] 세금 계산 검증 (소계 × 세율 = 세액)
  - [ ] 총액 검증 (소계 - 할인 + 세액 = 총액)
  - [ ] 허용 오차 (0.01) 적용
  - [ ] 오류 발견 시 Finding 객체 생성 (severity: 'blocker', category: 'math_error')

#### TASK-051: 필수 항목 검증 구현
- **설명**: 필수 필드 완전성 검증
- **예상 시간**: 2시간
- **의존성**: TASK-049
- **체크리스트**:
  - [ ] `validateCompleteness()` 함수 구현
  - [ ] 템플릿의 `required_fields` 배열 순회
  - [ ] 각 필수 필드가 견적서에 존재하는지 확인
  - [ ] 빈 값 검증 (null, undefined, 빈 문자열)
  - [ ] 오류 발견 시 Finding 객체 생성 (severity: 'blocker', category: 'completeness')

#### TASK-052: 정책 규칙 검증 구현
- **설명**: 할인 상한, 마진 하한 등 정책 검증
- **예상 시간**: 2시간
- **의존성**: TASK-049
- **체크리스트**:
  - [ ] `validatePolicy()` 함수 구현
  - [ ] 템플릿의 `validation_rules.policy` 배열 순회
  - [ ] `min`, `max`, `allowed_values` 검증
  - [ ] 오류 발견 시 Finding 객체 생성 (severity: 'high', category: 'policy')

#### TASK-053: 일관성 검증 구현 (선택 사항)
- **설명**: 통화 일치, 날짜 논리 등 일관성 검증
- **예상 시간**: 1시간
- **의존성**: TASK-049
- **체크리스트**:
  - [ ] `validateConsistency()` 함수 구현
  - [ ] 통화 일치 확인 (모든 금액이 같은 통화)
  - [ ] 날짜 논리 확인 (유효기간 > 발행일)
  - [ ] 오류 발견 시 Finding 객체 생성 (severity: 'medium', category: 'consistency')

#### TASK-054: 검증 엔진 유닛 테스트 작성
- **설명**: Vitest로 검증 로직 테스트
- **예상 시간**: 3시간
- **의존성**: TASK-050, TASK-051, TASK-052
- **체크리스트**:
  - [ ] `frontend/tests/unit/validation.test.ts` 생성
  - [ ] 수학적 오류 검출 테스트 (소계, 세금, 총액)
  - [ ] 필수 항목 누락 검출 테스트
  - [ ] 정책 위반 검출 테스트 (할인 초과, 마진 부족)
  - [ ] 정상 견적서 테스트 (발견 사항 0건)

#### TASK-054-AI-1: Gemini SDK 설치 및 설정
- **설명**: Google Generative AI SDK 설치 및 환경 변수 설정
- **예상 시간**: 1시간
- **의존성**: TASK-007
- **체크리스트**:
  - [ ] `npm install @google/generative-ai` 실행
  - [ ] `.env` 파일에 `VITE_GEMINI_API_KEY` 추가
  - [ ] `.env.example`에 Gemini API key 항목 추가
  - [ ] Google AI Studio에서 API 키 생성 (https://aistudio.google.com/app/apikey)
  - [ ] API 키 테스트 (간단한 요청 전송)

#### TASK-054-AI-2: AI 보조 검증 서비스 구현
- **설명**: Gemini 2.0 Flash를 사용한 맥락 분석 서비스
- **예상 시간**: 4시간
- **의존성**: TASK-054-AI-1, TASK-035
- **체크리스트**:
  - [ ] `frontend/src/services/ai-validation.ts` 생성
  - [ ] `aiAssistedValidation()` 함수 구현
  - [ ] `maskSensitiveData()` 함수 구현 (고객명, 금액 마스킹)
  - [ ] Gemini 2.0 Flash 모델 초기화 (`gemini-2.0-flash-exp`)
  - [ ] 프롬프트 엔지니어링 (맥락 분석, 이상 패턴 감지)
  - [ ] JSON 응답 파싱 및 Finding 객체 변환
  - [ ] 에러 처리 (graceful degradation)
  - [ ] AI 제안 태그 명시 (`[AI 제안]`)

#### TASK-054-AI-3: AI 검증과 결정론적 검증 통합
- **설명**: Layer 1 + Layer 2 통합 검증 플로우
- **예상 시간**: 2시간
- **의존성**: TASK-054-AI-2, TASK-054
- **체크리스트**:
  - [ ] `validation.ts`에 `validateQuoteComplete()` 함수 구현
  - [ ] Layer 1 (결정론적) 검증 먼저 실행
  - [ ] Layer 2 (AI 보조) 검증 실행 (결정론적 결과 전달)
  - [ ] 두 레이어 결과 병합
  - [ ] AI 카테고리 추가 (`ai_context`, `ai_pattern`, `ai_wording`)

#### TASK-054-AI-4: AI 검증 유닛 테스트
- **설명**: AI 서비스 mock 테스트
- **예상 시간**: 2시간
- **의존성**: TASK-054-AI-2
- **체크리스트**:
  - [ ] `frontend/tests/unit/ai-validation.test.ts` 생성
  - [ ] Gemini API mock 설정 (Vitest)
  - [ ] 정상 응답 테스트 (AI 발견 사항 생성)
  - [ ] 빈 응답 테스트 (발견 사항 없음)
  - [ ] API 실패 테스트 (graceful degradation)
  - [ ] 민감 데이터 마스킹 테스트

---

### Epic 2.4: 검증 플로우 구현 (1.5일)

#### TASK-055: Submission CRUD 서비스 구현
- **설명**: 검증 요청 생성 및 조회
- **예상 시간**: 2시간
- **의존성**: TASK-008, TASK-033
- **체크리스트**:
  - [ ] `frontend/src/services/validation.ts` 생성
  - [ ] `createSubmission(templateId, file)` 함수 (파일 업로드 + DB 레코드 생성)
  - [ ] `getSubmissionById(id)` 함수 (제출 상태 조회)
  - [ ] `getSubmissionWithFindings(id)` 함수 (제출 + 발견 사항 조회)

#### TASK-056: 클라이언트 측 검증 실행 (임시)
- **설명**: 프론트엔드에서 검증 실행 (Edge Function 전까지)
- **예상 시간**: 2시간
- **의존성**: TASK-046, TASK-049, TASK-055
- **체크리스트**:
  - [ ] `validateQuoteSubmission(submissionId)` 함수 구현
  - [ ] Submission 조회 → 파일 다운로드 → Excel 파싱
  - [ ] Template 조회 → 검증 실행
  - [ ] Findings DB에 저장
  - [ ] Submission 상태 업데이트 ('completed', overall_status)

#### TASK-057: Supabase Edge Function 구현 (선택 사항, 고급)
- **설명**: 서버 측에서 검증 실행 (성능 향상)
- **예상 시간**: 4시간
- **의존성**: TASK-056
- **체크리스트**:
  - [ ] `supabase/functions/validate-quote/index.ts` 생성
  - [ ] Deno 환경에서 Excel 파싱 (xlsx 또는 대체 라이브러리)
  - [ ] 검증 로직 이식 (TypeScript 공유 가능)
  - [ ] Edge Function 배포 (`supabase functions deploy validate-quote`)
  - [ ] 프론트엔드에서 Edge Function 호출

#### TASK-058: 검증 상태 폴링 또는 실시간 업데이트
- **설명**: 검증 진행 상태 실시간 표시
- **예상 시간**: 2시간
- **의존성**: TASK-056
- **체크리스트**:
  - [ ] 폴링 방식: 1초마다 `getSubmissionById()` 호출하여 상태 확인
  - [ ] 또는 Supabase Realtime 구독 (고급)
  - [ ] 로딩 스피너 표시 (status: 'validating')
  - [ ] 완료 시 결과 자동 표시

---

### Epic 2.5: UI 컴포넌트 구현 (2일)

#### TASK-059: ValidationPage 구현
- **설명**: 견적서 업로드 및 검증 실행 페이지
- **예상 시간**: 3시간
- **의존성**: TASK-055
- **체크리스트**:
  - [ ] `frontend/src/pages/ValidationPage.tsx` 생성
  - [ ] 템플릿 선택 드롭다운 (활성 템플릿 목록)
  - [ ] 파일 업로드 필드 (드래그 앤 드롭 지원, 선택 사항)
  - [ ] "검증 실행" 버튼
  - [ ] 파일 업로드 → Submission 생성 → 검증 실행
  - [ ] 검증 진행 중 로딩 표시
  - [ ] 검증 완료 시 결과 페이지로 이동

#### TASK-060: ValidationResult 컴포넌트 구현
- **설명**: 검증 결과 요약 표시 (Pass/Warning/Fail)
- **예상 시간**: 2시간
- **의존성**: TASK-055
- **체크리스트**:
  - [ ] `frontend/src/components/validation/ValidationResult.tsx` 생성
  - [ ] 전체 상태 배지 (Pass: 녹색, Warning: 주황, Fail: 빨강)
  - [ ] 심각도별 발견 사항 개수 표시 (Blocker: X, High: Y, Medium: Z)
  - [ ] MUI `Alert`, `Chip` 컴포넌트 사용
  - [ ] 접근성: 색상 대비 검증, ARIA 레이블

#### TASK-061: FindingList 컴포넌트 구현
- **설명**: 발견 사항 목록 표시
- **예상 시간**: 3시간
- **의존성**: TASK-055
- **체크리스트**:
  - [ ] `frontend/src/components/validation/FindingList.tsx` 생성
  - [ ] 심각도별 그룹핑 (Blocker → High → Medium → Low)
  - [ ] MUI `List`, `ListItem`, `Accordion` 사용
  - [ ] 각 발견 사항: 메시지, 위치, 예상값/실제값, 권장 조치 표시
  - [ ] 심각도 아이콘 및 색상 표시
  - [ ] 접근성: 키보드 네비게이션, 스크린 리더 지원

#### TASK-062: DiffViewer 컴포넌트 구현 (선택 사항)
- **설명**: 템플릿 대비 변경 사항 표시
- **예상 시간**: 3시간
- **의존성**: TASK-055
- **체크리스트**:
  - [ ] `frontend/src/components/validation/DiffViewer.tsx` 생성
  - [ ] 템플릿과 제출 견적서 비교
  - [ ] 변경된 필드 하이라이트 (추가, 수정, 삭제)
  - [ ] MUI `Table` 또는 `Grid` 사용
  - [ ] 차이 없으면 "변경 사항 없음" 메시지 표시

#### TASK-063: 파일 업로드 컴포넌트 (드래그 앤 드롭)
- **설명**: 파일 드래그 앤 드롭 지원
- **예상 시간**: 2시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] `frontend/src/components/common/FileUpload.tsx` 생성
  - [ ] `react-dropzone` 라이브러리 사용 (선택 사항)
  - [ ] 또는 네이티브 드래그 앤 드롭 이벤트 처리
  - [ ] 파일 타입 제한 (Excel: .xlsx, .xls)
  - [ ] 파일 크기 제한 (100MB)
  - [ ] 업로드 진행률 표시 (선택 사항)
  - [ ] 에러 메시지 표시 (잘못된 파일 타입, 크기 초과)

#### TASK-064: UI 컴포넌트 통합 테스트
- **설명**: React Testing Library로 컴포넌트 테스트
- **예상 시간**: 2시간
- **의존성**: TASK-059~TASK-063
- **체크리스트**:
  - [ ] `frontend/tests/component/ValidationPage.test.tsx` 생성
  - [ ] 파일 업로드 시나리오 테스트
  - [ ] 검증 결과 표시 테스트
  - [ ] 발견 사항 목록 렌더링 테스트
  - [ ] 접근성 테스트 (ARIA, 키보드 네비게이션)

---

### Epic 2.6: E2E 테스트 (Chrome DevTools MCP) (2-3일)

#### TASK-065: Chrome DevTools MCP 설치 및 설정
- **설명**: Chrome DevTools MCP 또는 Playwright 설정
- **예상 시간**: 2시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] Playwright 설치: `npm install -D @playwright/test`
  - [ ] 또는 Chrome DevTools MCP 클라이언트 설정
  - [ ] `playwright.config.ts` 생성 (브라우저, 베이스 URL 설정)
  - [ ] `frontend/tests/e2e/` 디렉토리 생성

#### TASK-066: E2E 테스트 픽스처 준비
- **설명**: 테스트용 템플릿 및 견적서 파일 생성
- **예상 시간**: 1시간
- **의존성**: 없음
- **체크리스트**:
  - [ ] `frontend/tests/fixtures/template.xlsx` 생성 (표준 템플릿)
  - [ ] `frontend/tests/fixtures/quote-valid.xlsx` 생성 (정상 견적서)
  - [ ] `frontend/tests/fixtures/quote-with-error.xlsx` 생성 (오류 포함)

#### TASK-067: Admin 워크플로 E2E 테스트
- **설명**: 템플릿 생성 및 활성화 테스트
- **예상 시간**: 3시간
- **의존성**: TASK-065, TASK-066
- **체크리스트**:
  - [ ] `frontend/tests/e2e/template-creation.test.ts` 생성
  - [ ] 로그인 (admin 계정)
  - [ ] 템플릿 관리 페이지 이동
  - [ ] 템플릿 생성 폼 작성
  - [ ] 파일 업로드
  - [ ] 필수 필드 및 검증 규칙 설정
  - [ ] 저장 및 활성화
  - [ ] 성공 메시지 확인

#### TASK-068: Staff 워크플로 E2E 테스트
- **설명**: 견적서 업로드 및 검증 실행 테스트
- **예상 시간**: 3시간
- **의존성**: TASK-065, TASK-066
- **체크리스트**:
  - [ ] `frontend/tests/e2e/quote-validation.test.ts` 생성
  - [ ] 로그인 (staff 계정)
  - [ ] 견적서 검증 페이지 이동
  - [ ] 템플릿 선택
  - [ ] 견적서 파일 업로드
  - [ ] 검증 실행
  - [ ] 검증 완료 대기 (최대 10초)
  - [ ] 결과 표시 확인 (Pass/Warning/Fail)
  - [ ] 발견 사항 목록 확인

#### TASK-069: 오류 시나리오 E2E 테스트
- **설명**: 수학적 오류 검출 및 재검증 테스트
- **예상 시간**: 2시간
- **의존성**: TASK-068
- **체크리스트**:
  - [ ] `quote-with-error.xlsx` 업로드
  - [ ] 검증 실행
  - [ ] Blocker 심각도 발견 사항 확인
  - [ ] "총액 계산 오류" 메시지 확인
  - [ ] (선택 사항) 파일 수정 후 재검증

#### TASK-070: GitHub Actions에 E2E 테스트 통합
- **설명**: CI에 E2E 테스트 추가
- **예상 시간**: 2시간
- **의존성**: TASK-067~TASK-069
- **체크리스트**:
  - [ ] `.github/workflows/ci.yml`에 E2E 테스트 단계 추가
  - [ ] 빌드 후 `npm run preview` 백그라운드 실행
  - [ ] `npm run test:e2e` 실행
  - [ ] Playwright HTML 리포트 생성 (선택 사항)
  - [ ] 테스트 실패 시 스크린샷 업로드 (아티팩트)

---

## 추가 작업 (선택 사항)

### Epic 3.1: 접근성 및 품질 개선

#### TASK-071: 접근성 감사 실행
- **설명**: Lighthouse, axe-core로 접근성 검사
- **예상 시간**: 2시간
- **체크리스트**:
  - [ ] Chrome DevTools Lighthouse 실행
  - [ ] WCAG 2.1 AA 준수 확인
  - [ ] 색상 대비 검증 (특히 다크 모드)
  - [ ] 키보드 네비게이션 테스트
  - [ ] 스크린 리더 테스트 (NVDA, JAWS, VoiceOver)

#### TASK-072: 성능 최적화
- **설명**: 번들 크기 및 로딩 시간 최적화
- **예상 시간**: 2시간
- **체크리스트**:
  - [ ] Vite 번들 분석 (`vite-plugin-visualizer`)
  - [ ] 코드 스플리팅 (React.lazy, Suspense)
  - [ ] 이미지 최적화 (WebP, lazy loading)
  - [ ] 불필요한 의존성 제거

#### TASK-073: 에러 바운더리 구현
- **설명**: 전역 에러 처리 및 폴백 UI
- **예상 시간**: 1시간
- **체크리스트**:
  - [ ] `frontend/src/components/common/ErrorBoundary.tsx` 생성
  - [ ] React Error Boundary 구현
  - [ ] 폴백 UI (에러 메시지 + 재시도 버튼)
  - [ ] App.tsx에 ErrorBoundary 적용

---

## 작업 우선순위 요약

### P0 (Critical): MVP 핵심 기능
- Sprint 0: TASK-001~TASK-028 (Infrastructure & Foundation)
- Sprint 1: TASK-029~TASK-039 (Data Model & Contracts)
- Sprint 2: TASK-040~TASK-064 (Core Implementation)
- **AI Integration**: TASK-054-AI-1~TASK-054-AI-4 (Gemini 2.0 Flash)

### P1 (High): 품질 보증
- TASK-065~TASK-070 (E2E Testing)
- TASK-048, TASK-054, TASK-054-AI-4 (Unit Testing)

### P2 (Medium): 개선 및 최적화
- TASK-071~TASK-073 (Accessibility, Performance, Error Handling)
- TASK-057 (Supabase Edge Function, 성능 향상)

### P3 (Low): 선택적 기능
- TASK-062 (DiffViewer)
- TASK-053 (일관성 검증)
- TASK-012 (회원가입 페이지, Admin이 수동으로 사용자 생성 가능)

---

## 작업 의존성 다이어그램

```mermaid
graph TD
    A[TASK-001: 프로젝트 생성] --> B[TASK-002: 의존성 설치]
    A --> C[TASK-003: ESLint/Prettier]
    A --> D[TASK-004: Git 브랜치]

    E[TASK-005: Supabase 프로젝트] --> F[TASK-006: Supabase CLI]
    F --> G[TASK-007: 환경 변수]
    G --> H[TASK-008: Supabase 클라이언트]

    H --> I[TASK-010: useAuth Hook]
    I --> J[TASK-011: 로그인 페이지]
    I --> K[TASK-013: PrivateRoute]

    B --> L[TASK-014: MUI 테마]
    L --> M[TASK-015: useTheme Hook]
    M --> N[TASK-016: 테마 프로바이더]

    B --> O[TASK-018: i18next 설정]
    O --> P[TASK-019: 한글 번역]

    L --> Q[TASK-021: DashboardLayout]
    Q --> R[TASK-022: 네비게이션 메뉴]

    C --> S[TASK-025: GitHub Actions CI]
    S --> T[TASK-026: 배포 (Dev)]
    T --> U[TASK-027: 배포 (Prod)]

    F --> V[TASK-029: 초기 스키마]
    V --> W[TASK-030: RLS 정책]
    W --> X[TASK-031: 마이그레이션 실행]

    X --> Y[TASK-033: Supabase 타입]
    Y --> Z[TASK-034: Template 타입]
    Y --> AA[TASK-035: Validation 타입]

    H --> AB[TASK-040: 템플릿 CRUD]
    AB --> AC[TASK-042: TemplatesPage]
    AB --> AD[TASK-043: TemplateForm]

    AB --> AE[TASK-046: Excel 파서]
    AA --> AE
    AE --> AF[TASK-049: 검증 엔진]
    AF --> AG[TASK-050: 수학적 검증]
    AF --> AH[TASK-051: 필수 항목 검증]

    AB --> AI[TASK-055: Submission CRUD]
    AI --> AJ[TASK-056: 검증 실행]
    AE --> AJ
    AF --> AJ

    AI --> AK[TASK-059: ValidationPage]
    AK --> AL[TASK-060: ValidationResult]
    AK --> AM[TASK-061: FindingList]

    AC --> AN[TASK-067: Admin E2E 테스트]
    AK --> AO[TASK-068: Staff E2E 테스트]
```

---

## 마일스톤

### Milestone 1: Infrastructure Ready (Day 5)
- ✅ 프로젝트 초기화 완료
- ✅ Supabase 연결 완료
- ✅ 사용자 인증 작동
- ✅ 다크 모드 및 한글 UI 적용
- ✅ 대시보드 레이아웃 완성
- ✅ GitHub Actions CI/CD 설정

### Milestone 2: Data Model Ready (Day 8)
- ✅ 데이터베이스 스키마 배포
- ✅ RLS 정책 활성화
- ✅ TypeScript 타입 정의 완료
- ✅ API 계약 문서화

### Milestone 3: MVP Feature Complete (Day 15-17)
- ✅ 템플릿 관리 기능 작동
- ✅ Excel 파서 작동
- ✅ **Layer 1 (결정론적) 검증 엔진 작동**
- ✅ **Layer 2 (AI 보조) Gemini 2.0 Flash 통합 완료**
- ✅ 검증 UI 완성 (AI 제안 구분 표시)
- ✅ 유닛 테스트 통과 (결정론적 + AI mock)

### Milestone 4: Testing & Release (Day 18-20)
- ✅ E2E 테스트 통과
- ✅ AI graceful degradation 검증
- ✅ 접근성 검증 완료
- ✅ GitHub Pages 배포 성공
- ✅ 사용자 가이드 문서 완성 (AI 기능 포함)
- ✅ MVP 출시 준비 완료

---

## 추정 vs 실제 시간 추적

| Task ID | Task Name | 예상 시간 | 실제 시간 | 차이 | 비고 |
|---------|-----------|----------|----------|------|------|
| TASK-001 | 프로젝트 생성 | 2h | - | - | |
| TASK-002 | 의존성 설치 | 1h | - | - | |
| ... | ... | ... | - | - | |

(실제 작업 중 업데이트)

---

## 다음 단계 (Phase 2+)

MVP 완료 후 추가 기능:
1. **승인 워크플로**: Reviewer, Approver 역할, 승인 프로세스, 상태 관리
2. **감사 로그**: 모든 변경 이력 추적, 불변 감사 기록
3. **발송 기능**: PDF 생성, 이메일 발송, 발송 상태 추적
4. **대시보드**: 검토 대기열, 메트릭, 리포팅, 차트
5. **고급 검증**: AI 기반 이상 탐지, 맞춤형 규칙 엔진, 기계 학습

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-18
