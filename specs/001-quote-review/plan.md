# 구현 계획: 클라이언트 견적서 검수 시스템 (MVP)

**Branch**: `001-quote-review` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)

## Summary

MVP 기능: 표준 견적서 템플릿 관리 및 자동 검증 시스템. 관리자가 표준 템플릿과 검증 규칙을 설정하고, 직원이 수정한 견적서를 업로드하면 자동으로 수학적 오류, 필수 항목 누락, 정책 위반을 검증하여 리포팅합니다.

**기술 접근**:
- React 18 + TypeScript + Material-UI + Vite (프론트엔드)
- Supabase (Postgres, Auth, Storage, Edge Functions) (백엔드)
- xlsx 라이브러리로 Excel 파싱
- **Google Gemini 2.0 Flash**: AI 기반 보조 검증 (맥락 분석, 이상 패턴 감지)
- Chrome DevTools MCP로 E2E 테스트

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x
**Primary Dependencies**:
- Frontend: React 18, Material-UI 5, styled-components, Vite 5, xlsx, i18next
- Backend: Supabase (serverless), Postgres, Supabase Auth, Supabase Storage
- AI: Google Gemini 2.0 Flash (@google/generative-ai SDK)
**Storage**: Supabase Postgres (구조화된 데이터), Supabase Storage (파일)
**Testing**: Vitest (unit), React Testing Library (component), Chrome DevTools MCP (E2E)
**Target Platform**: Web (Chrome/Edge/Safari), 반응형 디자인
**Project Type**: Web application (frontend + serverless backend)
**Performance Goals**:
- 파일 업로드 후 5초 이내 검증 완료
- 100MB 이하 Excel 파일 지원
- 동시 사용자 50명 (초기)
**Constraints**:
- Serverless 아키텍처만 사용 (장기 실행 서버 금지)
- 모든 민감 데이터에 RLS 적용
- 한글 UI 지원 필수
- 다크 모드 지원 필수
**Scale/Scope**:
- 초기 10-20명 사용자
- 월 100-500건 견적서 검증 예상

## Constitution Check

*GATE: Phase 0 연구 전에 통과 필요. Phase 1 설계 후 재확인.*

### ✅ 통과 항목

1. **리스크 우선 정확성 (Hybrid AI 접근)**:
   - Layer 1 (결정론적): 수학적 계산, 필수 항목, 정책 규칙 - 코드로 수행
   - Layer 2 (AI 보조): Gemini 2.0 Flash로 맥락 분석, 이상 패턴 감지, 문구 검토
   - Layer 3 (인간 승인): 모든 발견 사항 최종 검토
   - ✅ AI는 보조 도구로만 사용, 총액 계산의 유일한 수단으로 사용하지 않음
2. **기본 보안**: Supabase RLS로 모든 데이터 보호. Gemini API 호출 시 민감 데이터 마스킹.
3. **감사 가능성**: MVP에서는 제외되지만, Phase 2+에서 구현 예정 (스키마 준비). AI 검증 결과도 감사 로그에 포함.
4. **사람 검수 기반 발송**: MVP에서는 발송 기능 제외 (Phase 2+에서 승인 워크플로와 함께 구현).
5. **단순 UX**: Material-UI 컴포넌트 사용, 한글 i18n, 다크 모드, 명확한 오류 메시지.

### ⚠️ MVP 제외 (Phase 2+ 계획)

- **감사 로그**: 데이터베이스 스키마에 audit_logs 테이블 준비, MVP에서는 미구현.
- **승인 워크플로**: MVP는 검증만 수행. 승인 프로세스는 Phase 2+.
- **발송 기능**: MVP는 검증 결과만 표시. 발송은 Phase 2+.

### 기술 스택 준수

- ✅ React 18 + TypeScript (함수형 컴포넌트, hooks)
- ✅ Material-UI 5 (UI 컴포넌트)
- ✅ styled-components (MUI 테마 커스터마이징)
- ✅ Supabase (Postgres, Auth, Storage, Edge Functions)
- ✅ Row Level Security (모든 테이블)
- ✅ Serverless 아키텍처

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-review/
├── spec.md              # Feature specification (완료)
├── plan.md              # This file (현재)
├── research.md          # Phase 0 output (미생성)
├── data-model.md        # Phase 1 output (미생성)
├── quickstart.md        # Phase 1 output (미생성)
├── contracts/           # Phase 1 output (미생성)
│   ├── api.openapi.yaml
│   └── types.ts
├── tasks.md             # Phase 2 output (/speckit.tasks 명령)
└── checklists/
    └── requirements.md  # Spec checklist (완료)
```

### Source Code (repository root)

```text
quote-review-ai/
├── frontend/
│   ├── src/
│   │   ├── components/        # UI 컴포넌트
│   │   │   ├── layout/        # DashboardLayout, AppBar, Sidebar
│   │   │   ├── templates/     # TemplateList, TemplateForm, TemplateViewer
│   │   │   ├── validation/    # ValidationResult, FindingList, DiffViewer
│   │   │   └── common/        # Button, Card, Dialog, ErrorBoundary
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   └── ValidationPage.tsx
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── auth.ts        # Supabase Auth
│   │   │   ├── templates.ts   # 템플릿 CRUD
│   │   │   ├── validation.ts  # 검증 API 호출
│   │   │   └── storage.ts     # 파일 업로드/다운로드
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTemplates.ts
│   │   │   └── useValidation.ts
│   │   ├── utils/             # 유틸리티 함수
│   │   │   ├── excel.ts       # Excel 파싱
│   │   │   ├── validation.ts  # 검증 로직
│   │   │   └── format.ts      # 포맷팅 (통화, 날짜)
│   │   ├── theme/             # MUI 테마
│   │   │   ├── index.ts       # 테마 정의 (light/dark)
│   │   │   └── colors.ts      # 색상 팔레트
│   │   ├── i18n/              # 국제화
│   │   │   ├── index.ts       # i18next 설정
│   │   │   └── locales/
│   │   │       └── ko.json    # 한글 번역
│   │   ├── types/             # TypeScript 타입
│   │   │   ├── template.ts
│   │   │   ├── validation.ts
│   │   │   └── database.ts    # Supabase 생성 타입
│   │   ├── App.tsx            # 루트 컴포넌트
│   │   └── main.tsx           # 엔트리 포인트
│   ├── public/                # 정적 자산
│   ├── tests/                 # 테스트
│   │   ├── unit/              # 유닛 테스트 (Vitest)
│   │   ├── component/         # 컴포넌트 테스트 (RTL)
│   │   └── e2e/               # E2E 테스트 (Chrome DevTools MCP)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── supabase/                  # Supabase 프로젝트
│   ├── migrations/            # 데이터베이스 마이그레이션
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   ├── functions/             # Edge Functions
│   │   ├── validate-quote/    # 견적서 검증 함수
│   │   │   └── index.ts
│   │   └── parse-excel/       # Excel 파싱 함수
│   │       └── index.ts
│   ├── seed.sql               # 시드 데이터
│   └── config.toml            # Supabase 설정
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI (lint, test, build)
│       ├── deploy-dev.yml     # dev 브랜치 배포
│       └── deploy-prod.yml    # main 브랜치 배포
│
├── docs/                      # 개발 문서
│   ├── setup.md               # 개발 환경 설정
│   ├── architecture.md        # 아키텍처 문서
│   └── testing.md             # 테스트 가이드
│
├── .specify/                  # Spec-kit 설정
├── specs/                     # Feature specifications
├── package.json               # 루트 패키지
└── README.md
```

**Structure Decision**:
- **Web application**: frontend (React SPA) + supabase (serverless backend)
- **Frontend**: Vite + React 18 + TypeScript (빠른 빌드, HMR)
- **Backend**: Supabase (완전 관리형, RLS, Auth, Storage)
- **Monorepo 아님**: frontend와 supabase는 독립적으로 배포
- **GitHub Pages**: frontend 정적 빌드 배포
- **Supabase Cloud**: 백엔드 호스팅

## Complexity Tracking

> MVP는 Constitution 위반 없음. 감사 로그, 승인 워크플로, 발송 기능은 Phase 2+로 연기.

## Phase 0: Infrastructure & Foundation

**목표**: 사용자 인증, 반응형 UI, 한글 i18n, 다크 모드, 대시보드 레이아웃, Git 전략 구성

### 0.1 프로젝트 초기화

**작업**:
1. Vite + React + TypeScript 프로젝트 생성
2. Material-UI 5, styled-components, i18next 설치
3. ESLint, Prettier, TypeScript strict 모드 설정
4. Git 브랜치 전략 구성 (main, dev, feature/*)

**산출물**:
- `frontend/` 프로젝트 구조
- `package.json`, `vite.config.ts`, `tsconfig.json`
- `.eslintrc.js`, `.prettierrc`
- Git 브랜치: `main` (production), `dev` (development)

### 0.2 Supabase 프로젝트 설정

**작업**:
1. Supabase 프로젝트 생성 (Cloud 또는 Local)
2. Supabase CLI 설치 및 초기화
3. 환경 변수 설정 (`.env` 파일)
4. Supabase 클라이언트 설정 (`frontend/src/services/supabase.ts`)

**산출물**:
- Supabase 프로젝트 (Cloud/Local)
- `supabase/config.toml`
- `frontend/.env.example`:
  ```
  # Supabase
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key

  # Gemini AI
  VITE_GEMINI_API_KEY=your-gemini-api-key
  ```
- `frontend/src/services/supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  ```

### 0.3 사용자 인증 구현

**작업**:
1. Supabase Auth 설정 (Email/Password)
2. 로그인/회원가입 페이지 구현
3. `useAuth` hook 구현 (사용자 세션 관리)
4. 보호된 라우트 구현 (PrivateRoute 컴포넌트)

**산출물**:
- `frontend/src/hooks/useAuth.ts`:
  ```typescript
  import { useEffect, useState } from 'react'
  import { User } from '@supabase/supabase-js'
  import { supabase } from '../services/supabase'

  export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null)
        }
      )

      return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    }

    const signUp = async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    }

    const signOut = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }

    return { user, loading, signIn, signUp, signOut }
  }
  ```

- `frontend/src/pages/LoginPage.tsx` (Material-UI 로그인 폼)
- `frontend/src/components/common/PrivateRoute.tsx`

### 0.4 반응형 UI 및 다크 모드

**작업**:
1. MUI 테마 설정 (light/dark 모드)
2. 반응형 레이아웃 구현 (모바일, 태블릿, 데스크톱)
3. 다크 모드 토글 구현
4. 테마 설정 로컬 스토리지에 저장

**산출물**:
- `frontend/src/theme/index.ts`:
  ```typescript
  import { createTheme, ThemeOptions } from '@mui/material/styles'
  import { koKR } from '@mui/material/locale'

  const lightTheme: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  }

  const darkTheme: ThemeOptions = {
    palette: {
      mode: 'dark',
      primary: { main: '#90caf9' },
      secondary: { main: '#f48fb1' },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  }

  export const createAppTheme = (mode: 'light' | 'dark') =>
    createTheme(mode === 'light' ? lightTheme : darkTheme, koKR)
  ```

- `frontend/src/hooks/useTheme.ts` (다크 모드 토글)
- Responsive breakpoints: xs (모바일), sm (태블릿), md+ (데스크톱)

### 0.5 한글 국제화 (i18n)

**작업**:
1. i18next 설정 (한글 기본 언어)
2. 번역 파일 구조 설정
3. `useTranslation` hook 사용 예제
4. 모든 UI 텍스트 번역 키로 변환

**산출물**:
- `frontend/src/i18n/index.ts`:
  ```typescript
  import i18n from 'i18next'
  import { initReactI18next } from 'react-i18next'
  import ko from './locales/ko.json'

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        ko: { translation: ko },
      },
      lng: 'ko',
      fallbackLng: 'ko',
      interpolation: {
        escapeValue: false,
      },
    })

  export default i18n
  ```

- `frontend/src/i18n/locales/ko.json`:
  ```json
  {
    "auth": {
      "login": "로그인",
      "logout": "로그아웃",
      "email": "이메일",
      "password": "비밀번호"
    },
    "template": {
      "title": "템플릿 관리",
      "create": "템플릿 생성",
      "upload": "파일 업로드"
    },
    "validation": {
      "title": "검증 결과",
      "pass": "통과",
      "fail": "실패",
      "warning": "경고"
    }
  }
  ```

### 0.6 대시보드 레이아웃

**작업**:
1. 대시보드 레이아웃 구현 (AppBar + Sidebar + Content)
2. 네비게이션 메뉴 구현 (템플릿 관리, 검증)
3. 반응형 Sidebar (모바일: drawer, 데스크톱: persistent)
4. 사용자 프로필 메뉴 (로그아웃, 설정)

**산출물**:
- `frontend/src/components/layout/DashboardLayout.tsx`:
  ```typescript
  import React, { useState } from 'react'
  import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
  } from '@mui/material'
  import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Description as TemplateIcon,
    CheckCircle as ValidationIcon,
  } from '@mui/icons-material'
  import { useNavigate } from 'react-router-dom'

  const drawerWidth = 240

  export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const navigate = useNavigate()

    const menuItems = [
      { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
      { text: '템플릿 관리', icon: <TemplateIcon />, path: '/templates' },
      { text: '견적서 검증', icon: <ValidationIcon />, path: '/validation' },
    ]

    const drawer = (
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    )

    return (
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              견적서 검수 시스템
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    )
  }
  ```

### 0.7 Git 전략 및 GitHub Actions

**작업**:
1. Git 브랜치 전략 문서화 (main, dev, feature/*)
2. GitHub Actions CI 워크플로 (lint, test, build)
3. GitHub Actions 배포 워크플로 (dev → GitHub Pages staging, main → production)
4. Branch protection rules 설정

**산출물**:
- `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on:
    push:
      branches: ['*']
    pull_request:
      branches: ['*']

  jobs:
    lint-test-build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
            cache-dependency-path: frontend/package-lock.json

        - name: Install dependencies
          working-directory: frontend
          run: npm ci

        - name: Lint
          working-directory: frontend
          run: npm run lint

        - name: Test
          working-directory: frontend
          run: npm run test

        - name: Build
          working-directory: frontend
          run: npm run build
  ```

- `.github/workflows/deploy-dev.yml`:
  ```yaml
  name: Deploy to Dev (GitHub Pages)
  on:
    push:
      branches: [dev]

  jobs:
    deploy:
      runs-on: ubuntu-latest
      permissions:
        contents: write
      steps:
        - uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'
            cache: 'npm'
            cache-dependency-path: frontend/package-lock.json

        - name: Install and build
          working-directory: frontend
          run: |
            npm ci
            npm run build
          env:
            VITE_SUPABASE_URL: ${{ secrets.DEV_SUPABASE_URL }}
            VITE_SUPABASE_ANON_KEY: ${{ secrets.DEV_SUPABASE_ANON_KEY }}

        - name: Deploy to GitHub Pages (dev)
          uses: peaceiris/actions-gh-pages@v3
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: frontend/dist
            destination_dir: dev
  ```

- `.github/workflows/deploy-prod.yml` (main 브랜치용)

- **브랜치 전략**:
  - `main`: Production 브랜치 (GitHub Pages 루트로 배포)
  - `dev`: Development 브랜치 (GitHub Pages `/dev`로 배포)
  - `feature/*`: Feature 브랜치 (PR → dev)

**기간**: Phase 0 전체 3-5일

## Phase 1: Data Model & Contracts

**목표**: 데이터베이스 스키마, TypeScript 타입, API 계약 정의

### 1.1 데이터베이스 스키마 설계

**엔티티**:
1. `profiles` (사용자 프로필)
2. `templates` (견적서 템플릿)
3. `validation_rules` (검증 규칙)
4. `submissions` (검증 요청)
5. `findings` (검증 발견 사항)
6. `audit_logs` (감사 로그, Phase 2+를 위한 스키마 준비)

**마이그레이션 파일**:
- `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  required_fields JSONB NOT NULL DEFAULT '[]',
  validation_rules JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'validating', 'completed', 'error')),
  overall_status TEXT CHECK (overall_status IN ('pass', 'warning', 'fail')),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Findings table
CREATE TABLE public.findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('blocker', 'high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('math_error', 'completeness', 'policy', 'consistency', 'template_diff')),
  message TEXT NOT NULL,
  location TEXT,
  expected_value TEXT,
  actual_value TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table (Phase 2+ 준비)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_status ON public.templates(status);
CREATE INDEX idx_templates_created_by ON public.templates(created_by);
CREATE INDEX idx_submissions_template_id ON public.submissions(template_id);
CREATE INDEX idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_findings_submission_id ON public.findings(submission_id);
CREATE INDEX idx_findings_severity ON public.findings(severity);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to templates and profiles
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

- `supabase/migrations/002_rls_policies.sql`:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Templates policies
CREATE POLICY "All authenticated users can view active templates"
  ON public.templates FOR SELECT
  USING (auth.role() = 'authenticated' AND status = 'active');

CREATE POLICY "Admins can view all templates"
  ON public.templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update templates"
  ON public.templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
  ON public.submissions FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND submitted_by = auth.uid());

-- Findings policies
CREATE POLICY "Users can view findings for their own submissions"
  ON public.findings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions
      WHERE submissions.id = findings.submission_id
        AND submissions.submitted_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all findings"
  ON public.findings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Audit logs policies (Phase 2+, read-only for admins)
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

### 1.2 TypeScript 타입 정의

**산출물**:
- `frontend/src/types/database.ts` (Supabase CLI로 생성):
  ```bash
  supabase gen types typescript --local > frontend/src/types/database.ts
  ```

- `frontend/src/types/template.ts`:
  ```typescript
  export interface Template {
    id: string
    name: string
    description: string | null
    status: 'draft' | 'active' | 'archived'
    file_url: string
    file_name: string
    file_size: number
    required_fields: RequiredField[]
    validation_rules: ValidationRules
    created_by: string
    created_at: string
    updated_at: string
  }

  export interface RequiredField {
    key: string
    label: string
    type: 'string' | 'number' | 'date' | 'currency'
  }

  export interface ValidationRules {
    math: MathRule[]
    policy: PolicyRule[]
    consistency: ConsistencyRule[]
  }

  export interface MathRule {
    field: string
    formula: string
    tolerance?: number
  }

  export interface PolicyRule {
    field: string
    min?: number
    max?: number
    allowed_values?: string[]
  }

  export interface ConsistencyRule {
    fields: string[]
    rule: string
  }
  ```

- `frontend/src/types/validation.ts`:
  ```typescript
  export interface Submission {
    id: string
    template_id: string
    file_url: string
    file_name: string
    file_size: number
    status: 'uploaded' | 'validating' | 'completed' | 'error'
    overall_status: 'pass' | 'warning' | 'fail' | null
    submitted_by: string
    submitted_at: string
    completed_at: string | null
  }

  export interface Finding {
    id: string
    submission_id: string
    severity: 'blocker' | 'high' | 'medium' | 'low'
    category: 'math_error' | 'completeness' | 'policy' | 'consistency' | 'template_diff'
    message: string
    location: string | null
    expected_value: string | null
    actual_value: string | null
    recommendation: string | null
    created_at: string
  }

  export interface ValidationReport {
    submission: Submission
    findings: Finding[]
    summary: {
      blocker: number
      high: number
      medium: number
      low: number
    }
  }
  ```

### 1.3 API 계약 정의

**산출물**:
- `specs/001-quote-review/contracts/api.openapi.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Quote Review API
  version: 1.0.0
  description: MVP API for template management and quote validation

paths:
  /templates:
    get:
      summary: List all active templates
      tags: [Templates]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of templates
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Template'

    post:
      summary: Create a new template (admin only)
      tags: [Templates]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - name
                - file
              properties:
                name:
                  type: string
                description:
                  type: string
                file:
                  type: string
                  format: binary
                required_fields:
                  type: array
                  items:
                    $ref: '#/components/schemas/RequiredField'
                validation_rules:
                  $ref: '#/components/schemas/ValidationRules'
      responses:
        '201':
          description: Template created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'

  /templates/{id}:
    get:
      summary: Get template by ID
      tags: [Templates]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Template details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'

  /submissions:
    post:
      summary: Submit a quote for validation
      tags: [Validation]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - template_id
                - file
              properties:
                template_id:
                  type: string
                  format: uuid
                file:
                  type: string
                  format: binary
      responses:
        '202':
          description: Validation started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Submission'

  /submissions/{id}:
    get:
      summary: Get submission status and results
      tags: [Validation]
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Validation results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationReport'

components:
  schemas:
    Template:
      type: object
      required:
        - id
        - name
        - status
        - file_url
        - file_name
        - file_size
        - required_fields
        - validation_rules
        - created_by
        - created_at
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, active, archived]
        file_url:
          type: string
        file_name:
          type: string
        file_size:
          type: integer
        required_fields:
          type: array
          items:
            $ref: '#/components/schemas/RequiredField'
        validation_rules:
          $ref: '#/components/schemas/ValidationRules'
        created_by:
          type: string
          format: uuid
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    RequiredField:
      type: object
      required:
        - key
        - label
        - type
      properties:
        key:
          type: string
        label:
          type: string
        type:
          type: string
          enum: [string, number, date, currency]

    ValidationRules:
      type: object
      properties:
        math:
          type: array
          items:
            $ref: '#/components/schemas/MathRule'
        policy:
          type: array
          items:
            $ref: '#/components/schemas/PolicyRule'
        consistency:
          type: array
          items:
            $ref: '#/components/schemas/ConsistencyRule'

    MathRule:
      type: object
      required:
        - field
        - formula
      properties:
        field:
          type: string
        formula:
          type: string
        tolerance:
          type: number

    PolicyRule:
      type: object
      required:
        - field
      properties:
        field:
          type: string
        min:
          type: number
        max:
          type: number
        allowed_values:
          type: array
          items:
            type: string

    ConsistencyRule:
      type: object
      required:
        - fields
        - rule
      properties:
        fields:
          type: array
          items:
            type: string
        rule:
          type: string

    Submission:
      type: object
      required:
        - id
        - template_id
        - file_url
        - file_name
        - file_size
        - status
        - submitted_by
        - submitted_at
      properties:
        id:
          type: string
          format: uuid
        template_id:
          type: string
          format: uuid
        file_url:
          type: string
        file_name:
          type: string
        file_size:
          type: integer
        status:
          type: string
          enum: [uploaded, validating, completed, error]
        overall_status:
          type: string
          enum: [pass, warning, fail]
        submitted_by:
          type: string
          format: uuid
        submitted_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time

    Finding:
      type: object
      required:
        - id
        - submission_id
        - severity
        - category
        - message
        - created_at
      properties:
        id:
          type: string
          format: uuid
        submission_id:
          type: string
          format: uuid
        severity:
          type: string
          enum: [blocker, high, medium, low]
        category:
          type: string
          enum: [math_error, completeness, policy, consistency, template_diff]
        message:
          type: string
        location:
          type: string
        expected_value:
          type: string
        actual_value:
          type: string
        recommendation:
          type: string
        created_at:
          type: string
          format: date-time

    ValidationReport:
      type: object
      required:
        - submission
        - findings
        - summary
      properties:
        submission:
          $ref: '#/components/schemas/Submission'
        findings:
          type: array
          items:
            $ref: '#/components/schemas/Finding'
        summary:
          type: object
          properties:
            blocker:
              type: integer
            high:
              type: integer
            medium:
              type: integer
            low:
              type: integer

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 1.4 Quickstart 문서

**산출물**:
- `specs/001-quote-review/quickstart.md`:

```markdown
# Quickstart: Quote Review System (MVP)

## Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account (or local setup)
- Git

## Setup (Development)

### 1. Clone and install
\`\`\`bash
git clone <repo-url>
cd quote-review-ai
cd frontend
npm install
\`\`\`

### 2. Supabase setup
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Initialize (if not already done)
supabase init

# Start local Supabase
supabase start

# Run migrations
supabase db reset
\`\`\`

### 3. Environment variables
\`\`\`bash
cp frontend/.env.example frontend/.env
# Edit .env with your Supabase URL and anon key
\`\`\`

### 4. Run development server
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Open http://localhost:5173

## Usage

### Admin: Create a template
1. Login as admin
2. Navigate to "템플릿 관리"
3. Click "템플릿 생성"
4. Upload standard quote Excel file
5. Define required fields and validation rules
6. Activate template

### Staff: Validate a quote
1. Login as staff
2. Navigate to "견적서 검증"
3. Upload modified quote file
4. Select template
5. View validation results
6. Fix issues and re-validate

## Testing
\`\`\`bash
# Unit tests
npm run test

# E2E tests (Chrome DevTools MCP)
npm run test:e2e
\`\`\`

## Deployment
See `.github/workflows/` for CI/CD pipelines.
```

**기간**: Phase 1 전체 2-3일

## Phase 2: Core Implementation

**목표**: 템플릿 관리, Excel 파서, 검증 엔진, UI 컴포넌트 구현

### 2.1 템플릿 관리 구현

**작업**:
1. 템플릿 CRUD 서비스 구현 (`frontend/src/services/templates.ts`)
2. 파일 업로드 (Supabase Storage)
3. 템플릿 리스트 페이지 (`TemplatesPage.tsx`)
4. 템플릿 생성/수정 폼 (`TemplateForm.tsx`)
5. 템플릿 뷰어 (`TemplateViewer.tsx`)

**핵심 로직**:
- `createTemplate()`: 파일 업로드 → Storage → DB 레코드 생성
- `updateTemplate()`: 규칙 수정 → DB 업데이트
- `activateTemplate()`: status를 'active'로 변경

### 2.2 Excel 파서 구현

**작업**:
1. xlsx 라이브러리로 Excel 파일 파싱
2. 견적서 구조 추출 (라인 항목, 총액, 메타데이터)
3. 표준 JSON 포맷으로 변환
4. 파싱 오류 처리

**산출물**:
- `frontend/src/utils/excel.ts`:
  ```typescript
  import * as XLSX from 'xlsx'

  export interface ParsedQuote {
    metadata: {
      quote_number?: string
      date?: string
      customer_name?: string
      currency?: string
    }
    line_items: LineItem[]
    totals: {
      subtotal: number
      discount: number
      tax_rate: number
      tax_amount: number
      total: number
    }
  }

  export interface LineItem {
    description: string
    quantity: number
    unit_price: number
    line_total: number
  }

  export async function parseExcelQuote(file: File): Promise<ParsedQuote> {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Extract data (specific to template structure)
    // This is a simplified example; actual implementation depends on template layout
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // Parse metadata, line items, totals
    // ... (implementation depends on template structure)

    return parsedQuote
  }
  ```

### 2.3 검증 엔진 구현 (Hybrid: 결정론적 + AI 보조)

**작업**:
1. **Layer 1 (결정론적 검증)**: 수학적 검증 (합계, 할인, 세금 계산)
2. **Layer 1 (결정론적 검증)**: 필수 항목 검증 (완전성)
3. **Layer 1 (결정론적 검증)**: 정책 규칙 검증 (할인 상한, 마진)
4. **Layer 1 (결정론적 검증)**: 일관성 검증 (통화, 날짜 논리)
5. **Layer 2 (AI 보조 검증)**: Gemini 2.0 Flash 통합 (맥락 분석, 이상 패턴)

**산출물**:
- `frontend/src/utils/validation.ts`:
  ```typescript
  import { ParsedQuote } from './excel'
  import { Template, ValidationRules } from '../types/template'
  import { Finding } from '../types/validation'

  export function validateQuote(
    quote: ParsedQuote,
    template: Template
  ): Finding[] {
    const findings: Finding[] = []

    // 1. Math validation
    findings.push(...validateMath(quote, template.validation_rules.math))

    // 2. Completeness validation
    findings.push(...validateCompleteness(quote, template.required_fields))

    // 3. Policy validation
    findings.push(...validatePolicy(quote, template.validation_rules.policy))

    // 4. Consistency validation
    findings.push(...validateConsistency(quote, template.validation_rules.consistency))

    return findings
  }

  function validateMath(quote: ParsedQuote, rules: MathRule[]): Finding[] {
    const findings: Finding[] = []

    // Check subtotal
    const calculatedSubtotal = quote.line_items.reduce(
      (sum, item) => sum + item.line_total,
      0
    )
    if (Math.abs(quote.totals.subtotal - calculatedSubtotal) > 0.01) {
      findings.push({
        id: crypto.randomUUID(),
        submission_id: '', // Set later
        severity: 'blocker',
        category: 'math_error',
        message: '소계 계산 오류',
        location: '총액',
        expected_value: calculatedSubtotal.toFixed(2),
        actual_value: quote.totals.subtotal.toFixed(2),
        recommendation: '소계를 재계산하세요',
        created_at: new Date().toISOString(),
      })
    }

    // Check tax calculation
    const calculatedTax = quote.totals.subtotal * quote.totals.tax_rate
    if (Math.abs(quote.totals.tax_amount - calculatedTax) > 0.01) {
      findings.push({
        id: crypto.randomUUID(),
        submission_id: '',
        severity: 'blocker',
        category: 'math_error',
        message: '세금 계산 오류',
        location: '세액',
        expected_value: calculatedTax.toFixed(2),
        actual_value: quote.totals.tax_amount.toFixed(2),
        recommendation: '세금을 재계산하세요',
        created_at: new Date().toISOString(),
      })
    }

    // Check total
    const calculatedTotal = quote.totals.subtotal - quote.totals.discount + quote.totals.tax_amount
    if (Math.abs(quote.totals.total - calculatedTotal) > 0.01) {
      findings.push({
        id: crypto.randomUUID(),
        submission_id: '',
        severity: 'blocker',
        category: 'math_error',
        message: '총액 계산 오류',
        location: '총액',
        expected_value: calculatedTotal.toFixed(2),
        actual_value: quote.totals.total.toFixed(2),
        recommendation: '총액을 재계산하세요',
        created_at: new Date().toISOString(),
      })
    }

    return findings
  }

  function validateCompleteness(quote: ParsedQuote, requiredFields: RequiredField[]): Finding[] {
    const findings: Finding[] = []

    for (const field of requiredFields) {
      const value = getFieldValue(quote, field.key)
      if (value === null || value === undefined || value === '') {
        findings.push({
          id: crypto.randomUUID(),
          submission_id: '',
          severity: 'blocker',
          category: 'completeness',
          message: `필수 항목 누락: ${field.label}`,
          location: field.label,
          expected_value: '값 필요',
          actual_value: '비어 있음',
          recommendation: `${field.label}을(를) 입력하세요`,
          created_at: new Date().toISOString(),
        })
      }
    }

    return findings
  }

  function validatePolicy(quote: ParsedQuote, rules: PolicyRule[]): Finding[] {
    const findings: Finding[] = []

    for (const rule of rules) {
      const value = getFieldValue(quote, rule.field)

      if (rule.max !== undefined && value > rule.max) {
        findings.push({
          id: crypto.randomUUID(),
          submission_id: '',
          severity: 'high',
          category: 'policy',
          message: `${rule.field} 최대값 초과`,
          location: rule.field,
          expected_value: `<= ${rule.max}`,
          actual_value: String(value),
          recommendation: `${rule.field}을(를) ${rule.max} 이하로 설정하세요`,
          created_at: new Date().toISOString(),
        })
      }

      if (rule.min !== undefined && value < rule.min) {
        findings.push({
          id: crypto.randomUUID(),
          submission_id: '',
          severity: 'high',
          category: 'policy',
          message: `${rule.field} 최소값 미달`,
          location: rule.field,
          expected_value: `>= ${rule.min}`,
          actual_value: String(value),
          recommendation: `${rule.field}을(를) ${rule.min} 이상으로 설정하세요`,
          created_at: new Date().toISOString(),
        })
      }
    }

    return findings
  }

  function validateConsistency(quote: ParsedQuote, rules: ConsistencyRule[]): Finding[] {
    // Implement consistency checks (e.g., currency matching, date logic)
    return []
  }

  function getFieldValue(quote: ParsedQuote, key: string): any {
    // Extract field value from parsed quote by key
    // ... (implementation)
  }
  ```

- `frontend/src/services/ai-validation.ts` (Gemini 2.0 Flash 통합):
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai'
  import { ParsedQuote } from '../utils/excel'
  import { Template } from '../types/template'
  import { Finding } from '../types/validation'

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

  /**
   * Layer 2: AI 보조 검증
   * - 맥락적 이상 감지 (예: 비정상적인 할인율, 이상한 항목 설명)
   * - 문구 검토 (예: 표준 조항과 다른 면책 조항)
   * - 패턴 분석 (예: 과거 견적서와 비교하여 이상 패턴)
   *
   * 중요: AI 결과는 제안일 뿐, 결정론적 검증을 대체하지 않음
   */
  export async function aiAssistedValidation(
    quote: ParsedQuote,
    template: Template,
    deterministicFindings: Finding[]
  ): Promise<Finding[]> {
    const aiFindings: Finding[] = []

    try {
      // Gemini 2.0 Flash 모델 사용 (빠르고 비용 효율적)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

      // 민감 데이터 마스킹 (고객명, 금액 세부사항 제거)
      const maskedQuote = maskSensitiveData(quote)

      const prompt = `
당신은 견적서 검수 전문가입니다. 다음 견적서를 분석하여 잠재적인 문제나 이상 패턴을 찾아주세요.

## 표준 템플릿 정보
- 템플릿 이름: ${template.name}
- 필수 항목: ${template.required_fields.map(f => f.label).join(', ')}

## 제출된 견적서 (민감 데이터 마스킹됨)
${JSON.stringify(maskedQuote, null, 2)}

## 이미 발견된 결정론적 오류
${deterministicFindings.map(f => `- ${f.category}: ${f.message}`).join('\n')}

## 분석 요청
다음 관점에서 추가적인 문제를 찾아주세요:

1. **맥락적 이상**: 할인율이 비정상적으로 높거나 낮은가? 라인 항목 설명이 이상한가?
2. **문구 일관성**: 조건, 면책 조항이 표준과 다른가?
3. **논리적 일관성**: 날짜, 수량, 단가의 조합이 합리적인가?
4. **패턴 이상**: 일반적인 견적서 패턴과 다른 부분이 있는가?

**중요**: 수학적 계산은 이미 검증되었으므로 다시 확인하지 마세요. 맥락적 문제에만 집중하세요.

## 응답 형식 (JSON)
\`\`\`json
{
  "findings": [
    {
      "severity": "medium" | "low",
      "category": "ai_context" | "ai_pattern" | "ai_wording",
      "message": "문제 설명 (한글)",
      "location": "문제 위치",
      "recommendation": "권장 조치",
      "confidence": "높음" | "중간" | "낮음"
    }
  ]
}
\`\`\`

발견 사항이 없으면 빈 배열을 반환하세요.
`

      const result = await model.generateContent(prompt)
      const response = result.response.text()

      // JSON 파싱 (응답에서 JSON 추출)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1])

        // AI 발견 사항을 Finding 객체로 변환
        for (const aiFinding of parsed.findings) {
          aiFindings.push({
            id: crypto.randomUUID(),
            submission_id: '', // Set later
            severity: aiFinding.severity,
            category: aiFinding.category,
            message: `[AI 제안] ${aiFinding.message} (신뢰도: ${aiFinding.confidence})`,
            location: aiFinding.location,
            expected_value: null,
            actual_value: null,
            recommendation: aiFinding.recommendation,
            created_at: new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error('AI 보조 검증 실패:', error)
      // AI 실패는 전체 검증을 중단하지 않음 (graceful degradation)
      aiFindings.push({
        id: crypto.randomUUID(),
        submission_id: '',
        severity: 'low',
        category: 'ai_context',
        message: '[AI 서비스 일시 중단] AI 보조 검증을 사용할 수 없습니다. 결정론적 검증 결과만 표시됩니다.',
        location: 'AI 시스템',
        expected_value: null,
        actual_value: null,
        recommendation: '결정론적 검증 결과를 검토하세요.',
        created_at: new Date().toISOString(),
      })
    }

    return aiFindings
  }

  /**
   * 민감 데이터 마스킹 (고객명, 금액 등)
   */
  function maskSensitiveData(quote: ParsedQuote): any {
    return {
      metadata: {
        ...quote.metadata,
        customer_name: '[MASKED]',
        quote_number: '[MASKED]',
      },
      line_items: quote.line_items.map(item => ({
        description: item.description, // 항목 설명은 유지 (패턴 분석 필요)
        quantity: '[MASKED]',
        unit_price: '[MASKED]',
        line_total: '[MASKED]',
      })),
      totals: {
        subtotal: '[MASKED]',
        discount: '[MASKED]',
        tax_rate: quote.totals.tax_rate, // 세율은 유지 (정책 확인)
        tax_amount: '[MASKED]',
        total: '[MASKED]',
      },
    }
  }
  ```

- **통합된 검증 플로우**:
  ```typescript
  // frontend/src/utils/validation.ts (업데이트)
  import { aiAssistedValidation } from '../services/ai-validation'

  export async function validateQuoteComplete(
    quote: ParsedQuote,
    template: Template
  ): Promise<Finding[]> {
    // Layer 1: 결정론적 검증 (동기)
    const deterministicFindings: Finding[] = [
      ...validateMath(quote, template.validation_rules.math),
      ...validateCompleteness(quote, template.required_fields),
      ...validatePolicy(quote, template.validation_rules.policy),
      ...validateConsistency(quote, template.validation_rules.consistency),
    ]

    // Layer 2: AI 보조 검증 (비동기)
    const aiFindings = await aiAssistedValidation(quote, template, deterministicFindings)

    // 모든 발견 사항 병합 (결정론적 + AI)
    return [...deterministicFindings, ...aiFindings]
  }
  ```

### 2.4 검증 플로우 구현

**작업**:
1. 파일 업로드 → Supabase Storage
2. DB에 submission 레코드 생성 (status: 'uploaded')
3. Excel 파싱 → ParsedQuote
4. 검증 실행 → Finding[]
5. DB에 findings 저장
6. submission.status = 'completed' 업데이트
7. 프론트엔드에 결과 표시

**Supabase Edge Function**:
- `supabase/functions/validate-quote/index.ts`:
  ```typescript
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

  serve(async (req) => {
    const { submission_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch submission and template
    const { data: submission } = await supabase
      .from('submissions')
      .select('*, templates(*)')
      .eq('id', submission_id)
      .single()

    if (!submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404 })
    }

    // Update status to 'validating'
    await supabase
      .from('submissions')
      .update({ status: 'validating' })
      .eq('id', submission_id)

    try {
      // Download file from Storage
      const { data: fileData } = await supabase.storage
        .from('quotes')
        .download(submission.file_url)

      // Parse Excel (using Deno-compatible library or call external service)
      // ... (parsing logic)

      // Validate
      // ... (validation logic)

      // Save findings
      await supabase.from('findings').insert(findings)

      // Update submission status
      const overallStatus = findings.some(f => f.severity === 'blocker')
        ? 'fail'
        : findings.some(f => f.severity === 'high')
        ? 'warning'
        : 'pass'

      await supabase
        .from('submissions')
        .update({
          status: 'completed',
          overall_status: overallStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', submission_id)

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
      await supabase
        .from('submissions')
        .update({ status: 'error' })
        .eq('id', submission_id)

      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
  })
  ```

### 2.5 UI 컴포넌트 구현

**작업**:
1. `ValidationPage.tsx`: 견적서 업로드 및 검증 실행
2. `ValidationResult.tsx`: 검증 결과 표시 (Pass/Warning/Fail)
3. `FindingList.tsx`: 발견 사항 목록 (심각도별 그룹핑)
4. `DiffViewer.tsx`: 템플릿 대비 차이 표시
5. 파일 업로드 컴포넌트 (드래그 앤 드롭)

**기간**: Phase 2 전체 5-7일

## Phase 3: Testing (Chrome DevTools MCP)

**목표**: Chrome DevTools MCP를 사용한 E2E 테스트

### 3.1 Chrome DevTools MCP 설정

**작업**:
1. Chrome DevTools MCP 설치 및 설정
2. 테스트 환경 구성 (로컬 브라우저 제어)
3. 테스트 스크립트 작성

**산출물**:
- `frontend/tests/e2e/setup.ts`:
  ```typescript
  import { chromium } from 'playwright' // Or use Chrome DevTools MCP client

  export async function setupBrowser() {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    return { browser, page }
  }
  ```

### 3.2 E2E 테스트 시나리오

**작업**:
1. **Admin 워크플로**: 템플릿 생성 → 규칙 설정 → 활성화
2. **Staff 워크플로**: 견적서 업로드 → 검증 실행 → 결과 확인
3. **오류 시나리오**: 수학적 오류 검출 → 수정 → 재검증

**산출물**:
- `frontend/tests/e2e/template-creation.test.ts`:
  ```typescript
  import { test, expect } from '@playwright/test'

  test('Admin can create and activate a template', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to templates
    await page.click('text=템플릿 관리')

    // Create template
    await page.click('text=템플릿 생성')
    await page.fill('input[name="name"]', '표준 제품 견적서')
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/template.xlsx')

    // Define required fields
    await page.click('text=필수 항목 추가')
    await page.fill('input[name="field_key"]', 'customer_name')
    await page.fill('input[name="field_label"]', '고객명')

    // Save and activate
    await page.click('button:has-text("저장")')
    await expect(page.locator('text=템플릿이 생성되었습니다')).toBeVisible()
  })
  ```

- `frontend/tests/e2e/quote-validation.test.ts`:
  ```typescript
  import { test, expect } from '@playwright/test'

  test('Staff can validate a quote and see findings', async ({ page }) => {
    // Login as staff
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="email"]', 'staff@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // Navigate to validation
    await page.click('text=견적서 검증')

    // Upload quote
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/quote-with-error.xlsx')
    await page.selectOption('select[name="template_id"]', { label: '표준 제품 견적서' })
    await page.click('button:has-text("검증 실행")')

    // Wait for validation to complete
    await expect(page.locator('text=검증 완료')).toBeVisible({ timeout: 10000 })

    // Check for findings
    await expect(page.locator('text=총액 계산 오류')).toBeVisible()
    await expect(page.locator('[data-severity="blocker"]')).toHaveCount(1)
  })
  ```

### 3.3 테스트 자동화

**작업**:
1. GitHub Actions에 E2E 테스트 통합
2. PR 생성 시 자동 테스트 실행
3. 테스트 결과 리포팅

**산출물**:
- `.github/workflows/ci.yml` (E2E 테스트 추가):
  ```yaml
  - name: E2E Tests
    working-directory: frontend
    run: |
      npm run build
      npm run preview &
      sleep 5
      npm run test:e2e
  ```

**기간**: Phase 3 전체 2-3일

## Implementation Timeline

| Phase | 작업 | 기간 |
|-------|------|------|
| Phase 0 | Infrastructure & Foundation | 3-5일 |
| Phase 1 | Data Model & Contracts | 2-3일 |
| Phase 2 | Core Implementation | 5-7일 |
| Phase 3 | Testing (Chrome DevTools MCP) | 2-3일 |
| **Total** | | **12-18일** |

## Deployment Strategy

### Development (dev 브랜치)
1. 코드 푸시 → dev 브랜치
2. GitHub Actions CI 실행 (lint, test, build)
3. 성공 시 GitHub Pages `/dev`로 배포
4. Supabase dev 환경 사용

### Production (main 브랜치)
1. dev → main PR 생성
2. 리뷰 및 승인
3. Merge 후 GitHub Actions CI 실행
4. 성공 시 GitHub Pages 루트로 배포
5. Supabase production 환경 사용

## Risk Management

| 리스크 | 완화 전략 |
|--------|----------|
| Excel 파싱 복잡도 | 표준 템플릿 구조 강제, 파싱 오류 명확한 메시지 |
| Supabase 쿼터 초과 | 초기 사용자 제한, 파일 크기 제한 (100MB) |
| 검증 로직 오류 | 단위 테스트 + E2E 테스트 철저히 수행 |
| **Gemini API 비용** | **Flash 모델 사용 (저비용), 민감 데이터 마스킹으로 토큰 절약** |
| **AI 할루시네이션** | **AI 결과는 제안일 뿐, 결정론적 검증이 우선, [AI 제안] 태그 명시** |
| **AI 서비스 중단** | **Graceful degradation: AI 실패 시 결정론적 검증만 표시** |
| 사용자 교육 필요 | Quickstart 문서, 명확한 오류 메시지, 인앱 가이드 |
| 다크 모드 접근성 | WCAG 2.1 AA 준수, 색상 대비 검증 |

## Success Criteria

1. ✅ 관리자가 표준 템플릿 등록 및 규칙 설정 가능
2. ✅ 직원이 견적서 업로드하면 5초 이내에 검증 결과 표시
3. ✅ **Layer 1 (결정론적)**: 수학적 오류 100% 검출 (E2E 테스트로 검증)
4. ✅ **Layer 1 (결정론적)**: 필수 항목 누락 100% 검출
5. ✅ **Layer 2 (AI 보조)**: Gemini 2.0 Flash 맥락 분석 작동 (graceful degradation)
6. ✅ **보안**: 민감 데이터 마스킹, AI 제안 명시적 표시 ([AI 제안] 태그)
7. ✅ 한글 UI, 다크 모드 지원
8. ✅ 반응형 디자인 (모바일, 태블릿, 데스크톱)
9. ✅ GitHub Actions CI/CD 파이프라인 동작
10. ✅ Chrome DevTools MCP E2E 테스트 통과
11. ✅ RLS 정책으로 데이터 보안 확보
12. ✅ Constitution 준수 (Hybrid AI 접근)

## Next Steps (Phase 2+)

MVP 이후 추가 기능:
1. **승인 워크플로**: 검토자/승인자 역할, 승인 프로세스
2. **감사 로그**: 모든 변경 이력 추적
3. **발송 기능**: PDF 생성, 이메일 발송
4. **대시보드**: 검토 대기열, 메트릭, 리포팅
5. **고급 검증**: AI 기반 이상 탐지, 맞춤형 규칙 엔진
