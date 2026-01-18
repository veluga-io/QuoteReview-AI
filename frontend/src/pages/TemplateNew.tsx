import { useEffect, useState } from 'react'
import { Container, CircularProgress, Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import TemplateForm from '../components/templates/TemplateForm'
import { getTemplateById, updateTemplate } from '../services/templates'
import type { Template, TemplateInsert } from '../types/template'

export default function TemplateNew() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(id)

  useEffect(() => {
    if (id) {
      loadTemplate(id)
    }
  }, [id])

  async function loadTemplate(templateId: string) {
    try {
      setLoading(true)
      setError(null)
      const data = await getTemplateById(templateId)
      setTemplate(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(data: TemplateInsert) {
    if (!id) return
    await updateTemplate(id, {
      name: data.name,
      description: data.description,
      status: data.status,
      updated_by: data.created_by, // created_by를 updated_by로 사용
    })
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <TemplateForm
        initialValues={template || undefined}
        onSubmit={isEdit ? handleUpdate : undefined}
        isEdit={isEdit}
      />
    </Container>
  )
}
