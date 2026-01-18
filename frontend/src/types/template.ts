import type { Database } from './database'

// Database 타입에서 추출
export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

// 필수 필드 정의
export interface RequiredField {
  key: string // 필드 키 (예: "customer_name", "quote_number")
  label: string // 표시 이름 (예: "고객명", "견적 번호")
  type: 'string' | 'number' | 'date' | 'email' | 'phone' // 필드 타입
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
  }
}

// 검증 규칙 정의
export interface ValidationRules {
  math: MathRule[]
  policy: PolicyRule[]
  consistency: ConsistencyRule[]
}

// 수학적 검증 규칙
export interface MathRule {
  id: string
  name: string // 규칙 이름 (예: "소계 계산", "세금 계산")
  formula: string // 수식 (예: "subtotal = sum(line_items.total)")
  tolerance?: number // 허용 오차 (기본: 0.01)
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// 정책 규칙
export interface PolicyRule {
  id: string
  name: string // 규칙 이름 (예: "최대 할인율", "최소 마진")
  field: string // 검증할 필드
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'between'
  value: number | string | [number, number] // 비교 값
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// 일관성 규칙
export interface ConsistencyRule {
  id: string
  name: string // 규칙 이름 (예: "통화 일관성", "날짜 논리")
  type: 'currency' | 'date' | 'reference' | 'custom'
  fields: string[] // 검증할 필드들
  condition?: string // 조건 (선택 사항)
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// 템플릿 상태
export type TemplateStatus = 'draft' | 'active' | 'archived'
