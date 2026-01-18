import type { ParsedQuote } from '../types/validation'
import type { Template } from '../types/template'
import type { FindingInsert } from '../types/validation'
import { aiAssistedValidation } from '../services/ai-validation'

/**
 * Layer 1: 결정론적 검증 (Deterministic Validation)
 * 수학적 오류, 필수 항목 누락, 정책 위반, 일관성 검증
 */
export function validateQuote(
  quote: ParsedQuote,
  template: Template
): FindingInsert[] {
  const findings: FindingInsert[] = []

  // 1. 수학적 검증
  findings.push(...validateMath(quote))

  // 2. 필수 항목 검증
  findings.push(...validateCompleteness(quote, template))

  // 3. 정책 규칙 검증
  findings.push(...validatePolicy(quote, template))

  // 4. 일관성 검증
  findings.push(...validateConsistency(quote))

  return findings
}

/**
 * Layer 1 + Layer 2: 결정론적 검증 + AI 보조 검증
 */
export async function validateQuoteComplete(
  quote: ParsedQuote,
  template: Template,
  submissionId: string
): Promise<FindingInsert[]> {
  // Layer 1: 결정론적 검증
  const findings = validateQuote(quote, template)

  // Layer 2: AI 보조 검증
  try {
    const aiFindings = await aiAssistedValidation(quote, findings)
    findings.push(...aiFindings)
  } catch (error) {
    console.error('AI 검증 실패, 결정론적 검증만 사용:', error)
  }

  // submission_id 추가
  return findings.map(finding => ({
    ...finding,
    submission_id: submissionId,
  }))
}

/**
 * 수학적 검증
 */
export function validateMath(quote: ParsedQuote): FindingInsert[] {
  const findings: FindingInsert[] = []
  const tolerance = 0.01 // 허용 오차

  // 1. 라인 항목 합계 검증
  quote.line_items.forEach((item, index) => {
    const expectedTotal = item.quantity * item.unit_price
    const actualTotal = item.line_total
    const diff = Math.abs(expectedTotal - actualTotal)

    if (diff > tolerance) {
      findings.push({
        submission_id: '', // 나중에 추가됨
        severity: 'critical',
        category: 'math',
        message: `라인 항목 ${index + 1}의 합계가 올바르지 않습니다`,
        location: `라인 항목 ${index + 1}`,
        expected_value: expectedTotal.toFixed(2),
        actual_value: actualTotal.toFixed(2),
        recommendation: `예상값: ${expectedTotal.toFixed(2)}, 실제값: ${actualTotal.toFixed(2)}. 수량 × 단가를 확인하세요.`,
      })
    }
  })

  // 2. 소계 검증
  const expectedSubtotal = quote.line_items.reduce((sum, item) => sum + item.line_total, 0)
  const actualSubtotal = quote.totals.subtotal
  const subtotalDiff = Math.abs(expectedSubtotal - actualSubtotal)

  if (subtotalDiff > tolerance) {
    findings.push({
      submission_id: '',
      severity: 'critical',
      category: 'math',
      message: '소계가 라인 항목 합계와 일치하지 않습니다',
      location: '총액 계산',
      expected_value: expectedSubtotal.toFixed(2),
      actual_value: actualSubtotal.toFixed(2),
      recommendation: `예상 소계: ${expectedSubtotal.toFixed(2)}, 실제 소계: ${actualSubtotal.toFixed(2)}`,
    })
  }

  // 3. 세금 계산 검증
  const discountAmount = quote.totals.discount_amount || 0
  const subtotalAfterDiscount = actualSubtotal - discountAmount
  const expectedTax = subtotalAfterDiscount * quote.totals.tax_rate
  const actualTax = quote.totals.tax_amount
  const taxDiff = Math.abs(expectedTax - actualTax)

  if (taxDiff > tolerance) {
    findings.push({
      submission_id: '',
      severity: 'high',
      category: 'math',
      message: '세금 계산이 올바르지 않습니다',
      location: '총액 계산',
      expected_value: expectedTax.toFixed(2),
      actual_value: actualTax.toFixed(2),
      recommendation: `예상 세액: ${expectedTax.toFixed(2)}, 실제 세액: ${actualTax.toFixed(2)}. (소계 - 할인) × 세율을 확인하세요.`,
    })
  }

  // 4. 총액 검증
  const expectedTotal = subtotalAfterDiscount + actualTax
  const actualTotal = quote.totals.total
  const totalDiff = Math.abs(expectedTotal - actualTotal)

  if (totalDiff > tolerance) {
    findings.push({
      submission_id: '',
      severity: 'critical',
      category: 'math',
      message: '총액이 올바르지 않습니다',
      location: '총액 계산',
      expected_value: expectedTotal.toFixed(2),
      actual_value: actualTotal.toFixed(2),
      recommendation: `예상 총액: ${expectedTotal.toFixed(2)}, 실제 총액: ${actualTotal.toFixed(2)}. (소계 - 할인 + 세액)을 확인하세요.`,
    })
  }

  return findings
}

/**
 * 필수 항목 검증
 */
export function validateCompleteness(
  quote: ParsedQuote,
  template: Template
): FindingInsert[] {
  const findings: FindingInsert[] = []

  // 템플릿에 정의된 필수 필드 검증
  if (Array.isArray(template.required_fields) && template.required_fields.length > 0) {
    template.required_fields.forEach((field: unknown) => {
      if (typeof field === 'object' && field !== null && 'label' in field && 'field_type' in field) {
        const fieldLabel = String(field.label)
        const fieldType = String(field.field_type)

        // 메타데이터 필드 검증
        if (fieldType === 'metadata') {
          // 필드 레이블을 기반으로 메타데이터에서 값 찾기
          const metadataKey = fieldLabel.toLowerCase()
          let value: string | undefined

          // 일반적인 필드 매핑
          if (fieldLabel.includes('고객') || fieldLabel.toLowerCase().includes('customer')) {
            value = quote.metadata.customer_name
          } else if (fieldLabel.includes('견적번호') || fieldLabel.toLowerCase().includes('quote number')) {
            value = quote.metadata.quote_number
          } else if (fieldLabel.includes('견적일') || fieldLabel.toLowerCase().includes('quote date')) {
            value = quote.metadata.quote_date
          } else if (fieldLabel.includes('유효기한') || fieldLabel.toLowerCase().includes('valid until')) {
            value = quote.metadata.valid_until
          } else if (fieldLabel.includes('통화') || fieldLabel.toLowerCase().includes('currency')) {
            value = quote.metadata.currency
          } else {
            // 직접 메타데이터에서 찾기
            value = quote.metadata[metadataKey]
          }

          if (!value || (typeof value === 'string' && value.trim() === '')) {
            findings.push({
              submission_id: '',
              severity: 'high',
              category: 'completeness',
              message: `템플릿 필수 필드 "${fieldLabel}"이(가) 누락되었습니다`,
              location: '메타데이터',
              expected_value: '값 필요',
              actual_value: '누락',
              recommendation: `"${fieldLabel}" 필드를 입력하세요.`,
            })
          }
        }

        // 총액 필드 검증
        if (fieldType === 'total') {
          let value: number | undefined

          if (fieldLabel.includes('소계') || fieldLabel.toLowerCase().includes('subtotal')) {
            value = quote.totals.subtotal
          } else if (fieldLabel.includes('할인') || fieldLabel.toLowerCase().includes('discount')) {
            value = quote.totals.discount_amount
          } else if (fieldLabel.includes('세액') || fieldLabel.toLowerCase().includes('tax')) {
            value = quote.totals.tax_amount
          } else if (fieldLabel.includes('총액') || fieldLabel.toLowerCase().includes('total')) {
            value = quote.totals.total
          }

          if (value === undefined || value === null) {
            findings.push({
              submission_id: '',
              severity: 'high',
              category: 'completeness',
              message: `템플릿 필수 필드 "${fieldLabel}"이(가) 누락되었습니다`,
              location: '총액',
              expected_value: '값 필요',
              actual_value: '누락',
              recommendation: `"${fieldLabel}" 필드를 입력하세요.`,
            })
          }
        }
      }
    })
  }

  // 기본 필수 항목 검증
  if (!quote.metadata.customer_name || quote.metadata.customer_name.trim() === '') {
    findings.push({
      submission_id: '',
      severity: 'high',
      category: 'completeness',
      message: '고객명이 누락되었습니다',
      location: '메타데이터',
      expected_value: '고객명 필요',
      actual_value: '누락',
      recommendation: '고객명을 입력하세요.',
    })
  }

  if (!quote.metadata.quote_number || quote.metadata.quote_number.trim() === '') {
    findings.push({
      submission_id: '',
      severity: 'medium',
      category: 'completeness',
      message: '견적 번호가 누락되었습니다',
      location: '메타데이터',
      expected_value: '견적 번호 필요',
      actual_value: '누락',
      recommendation: '견적 번호를 입력하세요.',
    })
  }

  // 라인 항목 검증
  if (quote.line_items.length === 0) {
    findings.push({
      submission_id: '',
      severity: 'critical',
      category: 'completeness',
      message: '라인 항목이 없습니다',
      location: '라인 항목',
      expected_value: '최소 1개 항목',
      actual_value: '0개',
      recommendation: '최소 하나 이상의 라인 항목을 추가하세요.',
    })
  } else {
    // 라인 항목의 필드 완전성 검증
    quote.line_items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        findings.push({
          submission_id: '',
          severity: 'high',
          category: 'completeness',
          message: `라인 항목 ${index + 1}의 설명이 누락되었습니다`,
          location: `라인 항목 ${index + 1}`,
          expected_value: '설명 필요',
          actual_value: '누락',
          recommendation: '각 라인 항목에 설명을 입력하세요.',
        })
      }

      if (item.quantity === 0 || item.quantity === undefined) {
        findings.push({
          submission_id: '',
          severity: 'high',
          category: 'completeness',
          message: `라인 항목 ${index + 1}의 수량이 0이거나 누락되었습니다`,
          location: `라인 항목 ${index + 1}`,
          expected_value: '수량 > 0',
          actual_value: String(item.quantity || 0),
          recommendation: '유효한 수량을 입력하세요.',
        })
      }

      if (item.unit_price === 0 || item.unit_price === undefined) {
        findings.push({
          submission_id: '',
          severity: 'high',
          category: 'completeness',
          message: `라인 항목 ${index + 1}의 단가가 0이거나 누락되었습니다`,
          location: `라인 항목 ${index + 1}`,
          expected_value: '단가 > 0',
          actual_value: String(item.unit_price || 0),
          recommendation: '유효한 단가를 입력하세요.',
        })
      }
    })
  }

  return findings
}

/**
 * 정책 규칙 검증
 */
export function validatePolicy(
  quote: ParsedQuote,
  template: Template
): FindingInsert[] {
  const findings: FindingInsert[] = []

  // 템플릿에 정의된 정책 규칙 검증
  if (
    typeof template.validation_rules === 'object' &&
    template.validation_rules !== null &&
    'policy' in template.validation_rules &&
    Array.isArray(template.validation_rules.policy)
  ) {
    // 정책 규칙 검증 로직 (추후 구현)
  }

  // 기본 정책 검증: 할인율 상한 (30%)
  const discountPercent = quote.totals.discount_percent || 0
  if (discountPercent > 30) {
    findings.push({
      submission_id: '',
      severity: 'high',
      category: 'policy',
      message: '할인율이 허용 범위를 초과했습니다',
      location: '총액 계산',
      expected_value: '최대 30%',
      actual_value: `${discountPercent}%`,
      recommendation: `할인율을 30% 이하로 조정하세요. 현재: ${discountPercent}%`,
    })
  }

  return findings
}

/**
 * 일관성 검증
 */
export function validateConsistency(quote: ParsedQuote): FindingInsert[] {
  const findings: FindingInsert[] = []

  // 통화 일치 확인
  const quoteCurrency = quote.metadata.currency || quote.totals.currency
  if (quoteCurrency && quote.totals.currency && quoteCurrency !== quote.totals.currency) {
    findings.push({
      submission_id: '',
      severity: 'medium',
      category: 'consistency',
      message: '통화가 일치하지 않습니다',
      location: '메타데이터 및 총액',
      expected_value: quoteCurrency,
      actual_value: quote.totals.currency,
      recommendation: '메타데이터와 총액의 통화를 일치시키세요.',
    })
  }

  // 날짜 논리 확인
  if (quote.metadata.quote_date && quote.metadata.valid_until) {
    const quoteDate = new Date(quote.metadata.quote_date)
    const validUntil = new Date(quote.metadata.valid_until)

    if (validUntil < quoteDate) {
      findings.push({
        submission_id: '',
        severity: 'high',
        category: 'consistency',
        message: '유효기한이 견적일보다 이전입니다',
        location: '메타데이터',
        expected_value: `${quote.metadata.quote_date} 이후`,
        actual_value: quote.metadata.valid_until,
        recommendation: '유효기한을 견적일 이후로 설정하세요.',
      })
    }
  }

  return findings
}
