import { getGeminiModel, isGeminiAvailable } from './gemini'
import type { ParsedQuote, FindingInsert } from '../types/validation'

/**
 * 민감 데이터 마스킹
 * 개인정보 및 금액 정보를 마스킹하여 AI 전송
 */
export function maskSensitiveData(quote: ParsedQuote): ParsedQuote {
  const masked = JSON.parse(JSON.stringify(quote)) as ParsedQuote

  // 고객명 마스킹
  if (masked.metadata.customer_name) {
    const name = masked.metadata.customer_name
    masked.metadata.customer_name = name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : '***'
  }

  // 연락처 정보 마스킹
  if (masked.metadata.phone) {
    masked.metadata.phone = masked.metadata.phone.replace(/\d{4}$/, '****')
  }

  if (masked.metadata.email) {
    const [local, domain] = masked.metadata.email.split('@')
    masked.metadata.email = `${local.substring(0, 2)}***@${domain}`
  }

  // 금액 마스킹 (범위로 표시)
  const maskAmount = (amount: number): string => {
    if (amount < 1000) return '< 1K'
    if (amount < 10000) return '1K-10K'
    if (amount < 100000) return '10K-100K'
    if (amount < 1000000) return '100K-1M'
    return '> 1M'
  }

  masked.line_items = masked.line_items.map(item => ({
    ...item,
    unit_price: 0,
    line_total: 0,
    // 상대적 크기만 유지
    _priceRange: maskAmount(item.unit_price),
  }))

  masked.totals = {
    ...masked.totals,
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    total: 0,
    _totalRange: maskAmount(masked.totals.total),
  }

  return masked
}

/**
 * Layer 2: AI 보조 검증
 * Gemini 2.0 Flash를 사용한 맥락 분석 및 이상 패턴 감지
 */
export async function aiAssistedValidation(
  quote: ParsedQuote,
  deterministicFindings: FindingInsert[]
): Promise<FindingInsert[]> {
  // Gemini API가 없으면 graceful degradation
  if (!isGeminiAvailable()) {
    console.warn('Gemini API를 사용할 수 없습니다. AI 검증을 건너뜁니다.')
    return []
  }

  try {
    const model = getGeminiModel()

    // 민감 데이터 마스킹
    const maskedQuote = maskSensitiveData(quote)

    // 프롬프트 구성
    const prompt = buildAIPrompt(maskedQuote, deterministicFindings)

    // Gemini API 호출
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // JSON 응답 파싱
    const aiFindings = parseAIResponse(text)

    // [AI 제안] 태그 추가
    return aiFindings.map(finding => ({
      ...finding,
      message: `[AI 제안] ${finding.message}`,
    }))
  } catch (error) {
    console.error('AI 검증 중 오류 발생:', error)
    // Graceful degradation: AI 실패 시 빈 배열 반환
    return []
  }
}

/**
 * AI 프롬프트 구성
 */
function buildAIPrompt(
  maskedQuote: ParsedQuote,
  deterministicFindings: FindingInsert[]
): string {
  return `당신은 견적서 검수 전문가입니다. 다음 견적서를 분석하고 추가 문제점이나 개선 사항을 찾아주세요.

## 견적서 정보
${JSON.stringify(maskedQuote, null, 2)}

## 이미 발견된 문제 (결정론적 검증)
${deterministicFindings.length > 0
    ? deterministicFindings.map(f => `- [${f.severity}] ${f.message}`).join('\n')
    : '없음'}

## 분석 요청
다음 항목을 중점적으로 분석해주세요:

1. **맥락 분석 (ai_context)**:
   - 라인 항목의 설명이 구체적이고 명확한가요?
   - 항목 간 연관성이나 일관성 문제가 있나요?
   - 비즈니스 관점에서 이상한 점은 없나요?

2. **패턴 이상 (ai_pattern)**:
   - 항목의 수량이나 가격에 비정상적인 패턴이 있나요?
   - 할인율이나 세율이 적절한가요?
   - 중복되거나 불필요한 항목이 있나요?

3. **문구 검토 (ai_wording)**:
   - 전문적이지 않거나 모호한 표현이 있나요?
   - 오타나 문법 오류가 있나요?
   - 개선이 필요한 설명이 있나요?

## 응답 형식
다음 JSON 배열 형식으로만 응답해주세요. 문제가 없으면 빈 배열 []을 반환하세요.

[
  {
    "severity": "low" | "medium" | "high" | "critical",
    "category": "ai_context" | "ai_pattern" | "ai_wording",
    "message": "문제 설명",
    "location": "문제 위치",
    "recommendation": "개선 방안"
  }
]

중요: JSON 배열만 반환하고, 다른 텍스트는 포함하지 마세요.`
}

/**
 * AI 응답 파싱
 */
function parseAIResponse(text: string): FindingInsert[] {
  try {
    // JSON 블록 추출 (코드 블록이 있을 경우 대비)
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.warn('AI 응답에서 JSON을 찾을 수 없습니다')
      return []
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      severity: 'low' | 'medium' | 'high' | 'critical'
      category: string
      message: string
      location?: string
      recommendation?: string
    }>

    return parsed.map(item => ({
      submission_id: '', // 나중에 추가됨
      severity: item.severity,
      category: item.category,
      message: item.message,
      location: item.location || 'AI 분석',
      expected_value: null,
      actual_value: null,
      recommendation: item.recommendation || null,
    }))
  } catch (error) {
    console.error('AI 응답 파싱 오류:', error)
    return []
  }
}
