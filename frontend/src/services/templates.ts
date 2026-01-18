import { supabase } from './supabase'
import type { Template, TemplateInsert, TemplateUpdate } from '../types/template'

/**
 * 활성 템플릿 목록 조회
 */
export async function getTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`템플릿 목록 조회 실패: ${error.message}`)
  }

  return data as Template[]
}

/**
 * 모든 템플릿 목록 조회 (관리자용)
 */
export async function getAllTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`템플릿 목록 조회 실패: ${error.message}`)
  }

  return data as Template[]
}

/**
 * 특정 템플릿 조회
 */
export async function getTemplateById(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`템플릿 조회 실패: ${error.message}`)
  }

  return data as Template
}

/**
 * 템플릿 생성
 */
export async function createTemplate(template: TemplateInsert) {
  const { data, error } = await supabase
    .from('templates')
    .insert(template)
    .select()
    .single()

  if (error) {
    throw new Error(`템플릿 생성 실패: ${error.message}`)
  }

  return data as Template
}

/**
 * 템플릿 수정
 */
export async function updateTemplate(id: string, updates: TemplateUpdate) {
  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`템플릿 수정 실패: ${error.message}`)
  }

  return data as Template
}

/**
 * 템플릿 삭제 (소프트 삭제 - archived 상태로 변경)
 */
export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('templates')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) {
    throw new Error(`템플릿 삭제 실패: ${error.message}`)
  }
}

/**
 * 템플릿 활성화
 */
export async function activateTemplate(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`템플릿 활성화 실패: ${error.message}`)
  }

  return data as Template
}
