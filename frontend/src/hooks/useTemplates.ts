import { useState, useEffect } from 'react'
import { getAllTemplates } from '../services/templates'
import type { Template } from '../types/template'

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllTemplates()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return {
    templates,
    loading,
    error,
    refetch: loadTemplates,
  }
}
