-- Row Level Security (RLS) 정책 설정
-- 작성일: 2026-01-18
-- 설명: 모든 테이블에 RLS 활성화 및 보안 정책 적용

-- ============================================================================
-- 1. RLS 활성화
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Helper Functions
-- ============================================================================

-- 2.1 현재 사용자의 role 조회
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 2.2 현재 사용자가 admin인지 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 3. Profiles 정책
-- ============================================================================

-- 3.1 모든 인증된 사용자는 자신의 프로필 조회 가능
CREATE POLICY "사용자는 자신의 프로필을 조회할 수 있습니다"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 3.2 모든 인증된 사용자는 자신의 프로필 수정 가능
CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있습니다"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3.3 관리자는 모든 프로필 조회 가능
CREATE POLICY "관리자는 모든 프로필을 조회할 수 있습니다"
  ON profiles FOR SELECT
  USING (is_admin());

-- ============================================================================
-- 4. Templates 정책
-- ============================================================================

-- 4.1 모든 인증된 사용자는 active 템플릿 조회 가능
CREATE POLICY "인증된 사용자는 활성 템플릿을 조회할 수 있습니다"
  ON templates FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (status = 'active' OR is_admin())
  );

-- 4.2 관리자만 템플릿 생성 가능
CREATE POLICY "관리자만 템플릿을 생성할 수 있습니다"
  ON templates FOR INSERT
  WITH CHECK (is_admin());

-- 4.3 관리자만 템플릿 수정 가능
CREATE POLICY "관리자만 템플릿을 수정할 수 있습니다"
  ON templates FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4.4 관리자만 템플릿 삭제 가능
CREATE POLICY "관리자만 템플릿을 삭제할 수 있습니다"
  ON templates FOR DELETE
  USING (is_admin());

-- ============================================================================
-- 5. Submissions 정책
-- ============================================================================

-- 5.1 사용자는 자신의 제출 조회 가능, 관리자는 모든 제출 조회 가능
CREATE POLICY "사용자는 자신의 제출을 조회할 수 있습니다"
  ON submissions FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      OR is_admin()
    )
  );

-- 5.2 모든 인증된 사용자는 제출 생성 가능
CREATE POLICY "인증된 사용자는 제출을 생성할 수 있습니다"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- 5.3 사용자는 자신의 제출 수정 가능, 관리자는 모든 제출 수정 가능
CREATE POLICY "사용자는 자신의 제출을 수정할 수 있습니다"
  ON submissions FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      OR is_admin()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      OR is_admin()
    )
  );

-- ============================================================================
-- 6. Findings 정책
-- ============================================================================

-- 6.1 사용자는 자신의 제출에 대한 발견 사항 조회 가능
CREATE POLICY "사용자는 자신의 제출에 대한 발견 사항을 조회할 수 있습니다"
  ON findings FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      submission_id IN (
        SELECT id FROM submissions
        WHERE submitted_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
      OR is_admin()
    )
  );

-- 6.2 시스템(서버)만 발견 사항 생성 가능 (클라이언트에서는 생성 불가)
-- 참고: 실제로는 Edge Function이나 서버 측 코드에서 service_role key로 생성
CREATE POLICY "발견 사항 생성은 서버에서만 가능합니다"
  ON findings FOR INSERT
  WITH CHECK (false); -- 클라이언트에서는 INSERT 불가

-- ============================================================================
-- 7. Audit Logs 정책
-- ============================================================================

-- 7.1 관리자만 감사 로그 조회 가능
CREATE POLICY "관리자만 감사 로그를 조회할 수 있습니다"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- 7.2 시스템만 감사 로그 생성 가능
CREATE POLICY "감사 로그 생성은 서버에서만 가능합니다"
  ON audit_logs FOR INSERT
  WITH CHECK (false); -- 클라이언트에서는 INSERT 불가

-- ============================================================================
-- 8. Storage 정책 (Supabase Storage Buckets)
-- ============================================================================

-- 참고: Storage 버킷 정책은 Supabase 대시보드 또는 별도 마이그레이션에서 설정
-- 예상 버킷: 'templates', 'quotes'
--
-- templates 버킷:
--   - SELECT: 모든 인증된 사용자
--   - INSERT: 관리자만
--   - DELETE: 관리자만
--
-- quotes 버킷:
--   - SELECT: 자신이 업로드한 파일 + 관리자는 모든 파일
--   - INSERT: 모든 인증된 사용자
--   - DELETE: 자신이 업로드한 파일 + 관리자는 모든 파일

-- ============================================================================
-- 9. Comments (문서화)
-- ============================================================================

COMMENT ON FUNCTION get_user_role() IS '현재 로그인한 사용자의 역할(role)을 반환합니다';
COMMENT ON FUNCTION is_admin() IS '현재 로그인한 사용자가 관리자(admin)인지 확인합니다';
