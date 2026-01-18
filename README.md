# QuoteReview AI

견적서 자동 검증 시스템 - AI 기반 하이브리드 검증 아키텍처

견적서 파일을 업로드하면, 오타·숫자 오류·논리적 불일치·비즈니스 리스크를 자동으로 검수해주는 AI 서비스

## 🚀 기능

- **템플릿 관리**: 표준 견적서 템플릿 생성 및 관리
- **Excel 파싱**: xlsx/xls 파일 자동 파싱
- **2-Layer 검증**:
  - Layer 1: 결정론적 검증 (수학, 필수항목, 정책, 일관성)
  - Layer 2: AI 보조 검증 (Gemini 2.0 Flash)
- **실시간 검증**: 비동기 검증 및 진행 상태 표시
- **발견 사항 리포트**: 심각도별 그룹핑 및 상세 정보
- **다국어 지원**: 한글/영문
- **다크 모드**: Light/Dark 테마 전환

## 🏗️ 기술 스택

### Frontend
- React 18 + TypeScript 5
- Material-UI 5
- Vite 5
- React Router 6
- i18next

### Backend
- Supabase (PostgreSQL)
- Supabase Auth (이메일/비밀번호)
- Supabase Storage (파일 저장)
- Row Level Security (RLS)

### AI
- Google Gemini 2.0 Flash
- 민감 데이터 마스킹
- Graceful degradation

### 기타
- xlsx (Excel 파싱)
- TypeScript strict mode

## 📦 설치 및 실행

### 사전 요구사항

- Node.js 20+
- npm 10+
- Supabase 계정
- Google Gemini API 키 (선택)

### 로컬 개발

1. **저장소 클론**
   ```bash
   git clone https://github.com/veluga-io/QuoteReview-AI.git
   cd QuoteReview-AI
   ```

2. **의존성 설치**
   ```bash
   cd frontend
   npm install
   ```

3. **환경 변수 설정**

   `frontend/.env` 파일 생성:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key  # 선택
   NODE_ENV=development
   ```

4. **Supabase 마이그레이션**
   ```bash
   cd ..
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

5. **개발 서버 실행**
   ```bash
   cd frontend
   npm run dev
   ```

   → http://localhost:5173

### 프로덕션 빌드

```bash
cd frontend
npm run build
```

빌드 결과: `frontend/dist/`

## 🌐 Vercel 배포

### 방법 1: Vercel CLI (권장)

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **로그인**
   ```bash
   vercel login
   ```

3. **배포**
   ```bash
   vercel
   ```

   프로덕션 배포:
   ```bash
   vercel --prod
   ```

4. **환경 변수 설정**

   Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

### 방법 2: Vercel 대시보드

1. [Vercel](https://vercel.com) 대시보드 접속
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 환경 변수 추가 (위와 동일)
6. "Deploy" 클릭

### 자동 배포 설정

GitHub Actions를 사용한 자동 배포 (선택):

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 👤 사용자 생성

첫 사용자는 Supabase 대시보드에서 수동 생성:

1. **Supabase 대시보드** → Authentication → Users → Add user
2. 사용자 정보 입력:
   - Email: `admin@example.com`
   - Password: `Test1234!`
   - Auto Confirm User: ✓ 체크
3. 생성된 UUID 복사
4. **SQL Editor**에서 프로필 생성:
   ```sql
   INSERT INTO profiles (user_id, email, full_name, role)
   VALUES ('user-uuid', 'admin@example.com', 'Admin User', 'admin');
   ```

## 📖 사용 가이드

### 1. 템플릿 생성

1. 로그인
2. 좌측 메뉴 → "템플릿 관리"
3. "템플릿 생성" 버튼 클릭
4. 정보 입력:
   - 이름: `표준 견적서 템플릿`
   - 설명: `웹/앱 개발용`
   - 상태: `활성`
5. 저장

### 2. 견적서 업로드 및 검증

1. 좌측 메뉴 → "견적서 검증"
2. 템플릿 선택
3. Excel 파일 선택 (`.xlsx`, `.xls`, `.xlsm`)
4. "검증 실행" 클릭
5. 결과 확인

### Excel 파일 형식

[docs/sample-quote-format.md](docs/sample-quote-format.md) 참고

기본 구조:
```
고객명: 홍길동
견적번호: Q-2026-001
견적일자: 2026-01-18
유효기한: 2026-02-18

| 품목 | 수량 | 단가 | 금액 |
|------|------|------|------|
| 제품A | 10 | 50000 | 500000 |

소계: 500000
세율: 0.1
세액: 50000
총액: 550000
```

## 🧪 테스트

상세한 테스트 가이드: [docs/testing-guide.md](docs/testing-guide.md)

```bash
# TypeScript 타입 체크
cd frontend
npx tsc --noEmit

# 린트
npm run lint

# 빌드 테스트
npm run build
```

## 📚 문서

- [spec.md](specs/001-quote-review/spec.md): 기능 명세
- [plan.md](specs/001-quote-review/plan.md): 구현 계획
- [tasks.md](specs/001-quote-review/tasks.md): 작업 목록
- [sample-quote-format.md](docs/sample-quote-format.md): Excel 형식 가이드
- [testing-guide.md](docs/testing-guide.md): 테스트 시나리오

## 🔒 보안

- Row Level Security (RLS) 활성화
- 사용자별 데이터 접근 제어
- 관리자/일반 사용자 권한 분리
- 민감 데이터 마스킹 (AI 전송 시)
- 환경 변수로 API 키 관리

## 🛠️ 문제 해결

### 빌드 오류

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Supabase 연결 오류

1. `.env` 파일의 URL과 키 확인
2. Supabase 프로젝트 상태 확인
3. 마이그레이션 실행: `supabase db push`

### Storage 오류

버킷 생성 확인:
```sql
SELECT * FROM storage.buckets;
```

없으면 마이그레이션 재실행:
```bash
supabase db reset
supabase db push
```

## 📝 라이선스

MIT License

## 👥 기여

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

## 🎯 로드맵

- [x] Sprint 0: Infrastructure & Foundation
- [x] Sprint 1: Data Model & Contracts
- [x] Sprint 2: Core Implementation & AI Integration
- [ ] Sprint 3: Advanced Features (제출 목록, 검증 재실행, PDF 리포트)
- [ ] Sprint 4: Polish & Optimization (성능 최적화, E2E 테스트)

## 📞 지원

이슈나 질문이 있으시면 GitHub Issues에 등록해주세요.
