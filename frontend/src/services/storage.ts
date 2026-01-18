import { supabase } from './supabase'

/**
 * 파일 크기 제한 (100MB)
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes

/**
 * 파일명 sanitize - 공백과 특수문자 제거
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\s+/g, '_') // 공백을 언더스코어로
    .replace(/[^\w\-_.]/g, '') // 영문, 숫자, 언더스코어, 하이픈, 점만 허용
}

/**
 * 파일 업로드
 * @param bucket - 버킷 이름 ('templates' 또는 'quotes')
 * @param file - 업로드할 파일
 * @param path - 저장 경로 (선택 사항)
 */
export async function uploadFile(bucket: string, file: File, path?: string) {
  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다.`)
  }

  // 파일명 sanitize
  const sanitizedOriginalName = sanitizeFileName(file.name)

  // 파일 경로 생성 (UUID + 원본 파일명)
  let fileName: string
  if (path) {
    // path가 제공된 경우, path도 sanitize
    fileName = sanitizeFileName(path)
  } else {
    // path가 없으면 자동 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    fileName = `${timestamp}_${randomString}_${sanitizedOriginalName}`
  }

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`파일 업로드 실패: ${error.message}`)
  }

  return data.path
}

/**
 * 파일 다운로드
 * @param bucket - 버킷 이름
 * @param path - 파일 경로
 */
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) {
    throw new Error(`파일 다운로드 실패: ${error.message}`)
  }

  return data
}

/**
 * 파일 URL 생성
 * @param bucket - 버킷 이름
 * @param path - 파일 경로
 */
export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * 파일 삭제
 * @param bucket - 버킷 이름
 * @param path - 파일 경로
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`)
  }
}

/**
 * 여러 파일 삭제
 * @param bucket - 버킷 이름
 * @param paths - 파일 경로 배열
 */
export async function deleteFiles(bucket: string, paths: string[]) {
  const { error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`)
  }
}
