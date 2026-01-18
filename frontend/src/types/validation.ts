import type { Database } from './database'

// Database 타입에서 추출
export type Submission = Database['public']['Tables']['submissions']['Row']
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert']
export type SubmissionUpdate = Database['public']['Tables']['submissions']['Update']

export type Finding = Database['public']['Tables']['findings']['Row']
export type FindingInsert = Database['public']['Tables']['findings']['Insert']

// 제출 상태
export type SubmissionStatus = 'uploaded' | 'validating' | 'completed' | 'failed'

// 검증 상태
export type ValidationStatus = 'pass' | 'warning' | 'fail'

// 발견 사항 심각도
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'

// 발견 사항 카테고리
export type FindingCategory =
  | 'math' // 수학적 오류
  | 'completeness' // 필수 항목 누락
  | 'policy' // 정책 위반
  | 'consistency' // 일관성 문제
  | 'ai_context' // AI 맥락 분석
  | 'ai_pattern' // AI 패턴 이상
  | 'ai_wording' // AI 문구 검토

// 검증 리포트 (전체 검증 결과)
export interface ValidationReport {
  submission: Submission
  findings: Finding[]
  summary: {
    total: number
    by_severity: {
      critical: number
      high: number
      medium: number
      low: number
    }
    by_category: Record<FindingCategory, number>
  }
  overall_status: ValidationStatus
}

// Excel에서 파싱된 견적서 데이터
export interface ParsedQuote {
  metadata: QuoteMetadata
  line_items: LineItem[]
  totals: QuoteTotals
  raw_data?: Record<string, unknown> // 원본 데이터 (디버깅용)
}

// 견적서 메타데이터
export interface QuoteMetadata {
  customer_name?: string
  quote_number?: string
  quote_date?: string
  valid_until?: string
  currency?: string
  contact_person?: string
  phone?: string
  email?: string
  [key: string]: string | undefined // 추가 메타데이터
}

// 라인 항목
export interface LineItem {
  item_number?: number
  description: string
  quantity: number
  unit_price: number
  discount_percent?: number
  discount_amount?: number
  line_total: number
  notes?: string
}

// 총액 계산
export interface QuoteTotals {
  subtotal: number
  discount_percent?: number
  discount_amount?: number
  tax_rate: number
  tax_amount: number
  total: number
  currency?: string
}
