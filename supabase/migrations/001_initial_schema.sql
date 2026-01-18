-- 초기 데이터베이스 스키마 생성
-- 작성일: 2026-01-18
-- 설명: 견적서 검수 시스템 핵심 테이블 (profiles, templates, submissions, findings, audit_logs)

-- ============================================================================
-- 1. Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Custom Types
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE template_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE submission_status AS ENUM ('uploaded', 'validating', 'completed', 'failed');
CREATE TYPE validation_status AS ENUM ('pass', 'warning', 'fail');
CREATE TYPE finding_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================================
-- 3. Tables
-- ============================================================================

-- 3.1 Profiles 테이블 (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Templates 테이블 (표준 견적서 템플릿)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status template_status NOT NULL DEFAULT 'draft',
  file_url TEXT, -- Supabase Storage URL
  required_fields JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{key, label, type}]
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb, -- {math: [], policy: [], consistency: []}
  created_by UUID NOT NULL REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Submissions 테이블 (견적서 검증 요청)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL, -- Supabase Storage URL (업로드된 견적서 파일)
  file_name TEXT NOT NULL,
  status submission_status NOT NULL DEFAULT 'uploaded',
  overall_status validation_status, -- 전체 검증 결과
  metadata JSONB, -- 파싱된 견적서 메타데이터 (고객명, 견적 번호 등)
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Findings 테이블 (검증 결과 - 발견 사항)
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  severity finding_severity NOT NULL,
  category TEXT NOT NULL, -- 'math', 'completeness', 'policy', 'consistency', 'ai_context', 'ai_pattern', 'ai_wording'
  message TEXT NOT NULL,
  location TEXT, -- 문제 위치 (예: "라인 항목 3", "총액 계산")
  expected_value TEXT,
  actual_value TEXT,
  recommendation TEXT, -- 권장 조치
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Audit Logs 테이블 (감사 로그 - Phase 2+ 준비)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  resource_type TEXT NOT NULL, -- 'template', 'submission', 'finding'
  resource_id UUID,
  details JSONB, -- 변경 내용 상세
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Indexes
-- ============================================================================

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Templates
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_created_by ON templates(created_by);

-- Submissions
CREATE INDEX idx_submissions_template_id ON submissions(template_id);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_overall_status ON submissions(overall_status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Findings
CREATE INDEX idx_findings_submission_id ON findings(submission_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_category ON findings(category);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 5. Functions & Triggers
-- ============================================================================

-- 5.1 Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5.2 Updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Comments (문서화)
-- ============================================================================

COMMENT ON TABLE profiles IS '사용자 프로필 정보 (admin, staff)';
COMMENT ON TABLE templates IS '표준 견적서 템플릿 및 검증 규칙';
COMMENT ON TABLE submissions IS '견적서 검증 요청';
COMMENT ON TABLE findings IS '검증 결과 - 발견된 문제 및 경고';
COMMENT ON TABLE audit_logs IS '감사 로그 (모든 변경 이력 추적)';

COMMENT ON COLUMN templates.required_fields IS 'JSON 배열: [{key: string, label: string, type: string, validation?: object}]';
COMMENT ON COLUMN templates.validation_rules IS 'JSON 객체: {math: Rule[], policy: Rule[], consistency: Rule[]}';
COMMENT ON COLUMN submissions.metadata IS 'JSON 객체: 파싱된 견적서 메타데이터 (고객명, 견적 번호, 날짜 등)';
