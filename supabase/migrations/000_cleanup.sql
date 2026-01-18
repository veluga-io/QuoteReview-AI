-- 기존 스키마 정리 (있으면 삭제)
-- 작성일: 2026-01-18
-- 설명: 기존 객체들을 안전하게 삭제하고 깨끗한 상태로 시작

-- ============================================================================
-- 1. Drop Tables (순서 중요: FK 제약으로 인해 역순으로 삭제)
-- ============================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- 2. Drop Types
-- ============================================================================
DROP TYPE IF EXISTS finding_severity CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS template_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- 3. Drop Functions
-- ============================================================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 4. Drop Storage Policies
-- ============================================================================
DROP POLICY IF EXISTS "인증된 사용자는 템플릿 조회 가능" ON storage.objects;
DROP POLICY IF EXISTS "관리자만 템플릿 업로드 가능" ON storage.objects;
DROP POLICY IF EXISTS "관리자만 템플릿 삭제 가능" ON storage.objects;
DROP POLICY IF EXISTS "사용자는 자신의 견적서 업로드 가능" ON storage.objects;
DROP POLICY IF EXISTS "사용자는 자신의 견적서 조회 가능" ON storage.objects;
DROP POLICY IF EXISTS "관리자만 견적서 삭제 가능" ON storage.objects;

-- ============================================================================
-- 5. Delete Storage Buckets (optional - 버킷 내용도 삭제하려면)
-- ============================================================================
-- DELETE FROM storage.buckets WHERE id IN ('templates', 'quotes');
