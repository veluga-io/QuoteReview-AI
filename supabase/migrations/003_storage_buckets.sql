-- Storage 버킷 생성 및 정책 설정
-- 작성일: 2026-01-18
-- 설명: templates와 quotes 버킷 생성 및 RLS 정책

-- ============================================================================
-- 1. Storage 버킷 생성
-- ============================================================================

-- templates 버킷 생성 (템플릿 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', false)
ON CONFLICT (id) DO NOTHING;

-- quotes 버킷 생성 (견적서 파일용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotes', 'quotes', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Storage 정책 설정
-- ============================================================================

-- templates 버킷 정책: 인증된 사용자는 조회 가능, 관리자만 업로드/삭제
CREATE POLICY "인증된 사용자는 템플릿 조회 가능"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'templates');

CREATE POLICY "관리자만 템플릿 업로드 가능"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'templates'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "관리자만 템플릿 삭제 가능"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'templates'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- quotes 버킷 정책: 인증된 사용자는 자신의 파일 업로드/조회, 관리자는 모든 파일 접근
CREATE POLICY "사용자는 자신의 견적서 업로드 가능"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quotes');

CREATE POLICY "사용자는 자신의 견적서 조회 가능"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'quotes'
  AND (
    -- 관리자는 모든 파일 조회 가능
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- 일반 사용자는 자신이 제출한 견적서만 조회 가능
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.file_url = name
      AND submissions.submitted_by IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "관리자만 견적서 삭제 가능"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'quotes'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
