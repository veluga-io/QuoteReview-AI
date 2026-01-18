import { supabase } from './supabase'
import { uploadFile } from './storage'
import { parseExcelFile } from '../utils/excel'
import { validateQuoteComplete } from '../utils/validation'
import { getTemplateById } from './templates'
import type { Submission, SubmissionInsert, Finding, FindingInsert } from '../types/validation'

/**
 * 견적서 제출 및 검증 실행
 */
export async function createSubmission(
  templateId: string,
  file: File,
  userId: string
): Promise<{ submission: Submission; findings: Finding[] }> {
  try {
    // 1. 파일 업로드
    const filePath = await uploadFile('quotes', file)

    // 2. Submission 레코드 생성
    const submissionData: SubmissionInsert = {
      template_id: templateId,
      file_url: filePath,
      file_name: file.name,
      status: 'uploaded',
      submitted_by: userId,
    }

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert(submissionData)
      .select()
      .single()

    if (submissionError) {
      throw new Error(`제출 생성 실패: ${submissionError.message}`)
    }

    // 3. 검증 실행 (백그라운드)
    executeValidation(submission.id, templateId, filePath).catch(error => {
      console.error('검증 실행 중 오류:', error)
    })

    return { submission, findings: [] }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : '견적서 제출에 실패했습니다'
    )
  }
}

/**
 * 검증 실행 (비동기)
 */
async function executeValidation(
  submissionId: string,
  templateId: string,
  filePath: string
): Promise<void> {
  try {
    // 상태를 'validating'으로 변경
    await supabase
      .from('submissions')
      .update({ status: 'validating' })
      .eq('id', submissionId)

    // 1. 템플릿 조회
    const template = await getTemplateById(templateId)

    // 2. 파일 다운로드 (실제로는 URL로 직접 접근)
    // 여기서는 간단히 filePath를 사용
    // 실제 구현에서는 Storage에서 다운로드해야 함

    // 3. Excel 파싱
    // NOTE: 브라우저에서 Storage URL로 파일을 직접 가져와야 함
    const { data: fileBlob } = await supabase.storage
      .from('quotes')
      .download(filePath)

    if (!fileBlob) {
      throw new Error('파일을 다운로드할 수 없습니다')
    }

    const file = new File([fileBlob], filePath)
    const parsedQuote = await parseExcelFile(file)

    console.log('📊 Parsed quote:', parsedQuote)
    console.log('📋 Template required_fields:', template.required_fields)

    // 4. 검증 실행 (Layer 1 + Layer 2)
    const findings = await validateQuoteComplete(parsedQuote, template, submissionId)

    console.log('🔍 Validation findings:', findings)

    // 5. Findings 저장
    if (findings.length > 0) {
      const { error: findingsError } = await supabase
        .from('findings')
        .insert(findings)

      if (findingsError) {
        throw new Error(`발견 사항 저장 실패: ${findingsError.message}`)
      }
    }

    // 6. 전체 상태 계산
    const overallStatus = calculateOverallStatus(findings)

    // 7. Submission 상태 업데이트
    await supabase
      .from('submissions')
      .update({
        status: 'completed',
        overall_status: overallStatus,
        metadata: parsedQuote.metadata,
        validated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
  } catch (error) {
    console.error('검증 실행 실패:', error)

    // 실패 상태로 업데이트
    await supabase
      .from('submissions')
      .update({ status: 'failed' })
      .eq('id', submissionId)
  }
}

/**
 * 전체 검증 상태 계산
 */
function calculateOverallStatus(
  findings: FindingInsert[]
): 'pass' | 'warning' | 'fail' {
  if (findings.length === 0) {
    return 'pass'
  }

  const hasCritical = findings.some(f => f.severity === 'critical')
  const hasHigh = findings.some(f => f.severity === 'high')

  if (hasCritical) {
    return 'fail'
  } else if (hasHigh) {
    return 'warning'
  } else {
    return 'warning'
  }
}

/**
 * 제출 목록 조회 (사용자별)
 */
export async function getSubmissions(userId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, templates(name)')
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`제출 목록 조회 실패: ${error.message}`)
  }

  return data as (Submission & { templates: { name: string } })[]
}

/**
 * 모든 제출 목록 조회 (관리자용)
 */
export async function getAllSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, templates(name), profiles(full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`제출 목록 조회 실패: ${error.message}`)
  }

  return data as (Submission & {
    templates: { name: string }
    profiles: { full_name: string }
  })[]
}

/**
 * 특정 제출 조회
 */
export async function getSubmissionById(id: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, templates(name)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`제출 조회 실패: ${error.message}`)
  }

  return data as Submission & { templates: { name: string } }
}

/**
 * 제출과 발견 사항 함께 조회
 */
export async function getSubmissionWithFindings(id: string) {
  const [submission, { data: findings, error: findingsError }] = await Promise.all([
    getSubmissionById(id),
    supabase
      .from('findings')
      .select('*')
      .eq('submission_id', id)
      .order('severity', { ascending: false }),
  ])

  if (findingsError) {
    throw new Error(`발견 사항 조회 실패: ${findingsError.message}`)
  }

  return {
    submission,
    findings: findings as Finding[],
  }
}

/**
 * 검증 재실행
 */
export async function revalidateSubmission(submissionId: string): Promise<void> {
  const submission = await getSubmissionById(submissionId)

  // 기존 findings 삭제
  await supabase.from('findings').delete().eq('submission_id', submissionId)

  // 검증 재실행
  await executeValidation(submissionId, submission.template_id, submission.file_url)
}
