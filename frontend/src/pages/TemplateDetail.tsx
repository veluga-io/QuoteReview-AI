import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material'
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTemplateById } from '../services/templates'
import type { Template } from '../types/template'

export default function TemplateDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const getStatusColor = (status: Template['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: Template['status']) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'draft':
        return '초안'
      case 'archived':
        return '보관됨'
      default:
        return status
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || !template) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || '템플릿을 찾을 수 없습니다'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/templates')}
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/templates')}>
          {t('common.back', '돌아가기')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/templates/${template.id}/edit`)}
        >
          {t('templates.edit', '수정')}
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {template.name}
            </Typography>
            <Chip
              label={getStatusLabel(template.status)}
              color={getStatusColor(template.status)}
            />
          </Box>

          {template.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {template.description}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('templates.info', '기본 정보')}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('templates.createdAt', '생성일')}: {formatDate(template.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('templates.updatedAt', '수정일')}: {formatDate(template.updated_at)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('templates.requiredFields', '필수 필드')}
            </Typography>
            {Array.isArray(template.required_fields) && template.required_fields.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {template.required_fields.map((field: unknown, index: number) => (
                  <Chip
                    key={index}
                    label={typeof field === 'object' && field !== null && 'label' in field
                      ? String(field.label)
                      : String(field)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                필수 필드가 설정되지 않았습니다
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              {t('templates.validationRules', '검증 규칙')}
            </Typography>
            {template.validation_rules && typeof template.validation_rules === 'object' ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  검증 규칙이 설정되었습니다
                </Typography>
                {/* 추후 상세 규칙 표시 구현 */}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                검증 규칙이 설정되지 않았습니다
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
