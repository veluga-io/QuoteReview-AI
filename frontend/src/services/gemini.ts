import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API 키 확인
const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY가 설정되지 않았습니다. AI 검증 기능이 비활성화됩니다.')
}

// Gemini 클라이언트 초기화
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Gemini 2.0 Flash 모델 가져오기
 */
export function getGeminiModel() {
  if (!genAI) {
    throw new Error('Gemini API가 초기화되지 않았습니다. API 키를 확인하세요.')
  }

  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  })
}

/**
 * Gemini API 사용 가능 여부 확인
 */
export function isGeminiAvailable(): boolean {
  return genAI !== null
}
