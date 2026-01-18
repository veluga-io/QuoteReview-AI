import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TemplateInsert } from '../../types/template'
import { createTemplate } from '../../services/templates'
import { useAuth } from '../../contexts/AuthContext'

interface TemplateFormProps {
  initialValues?: Partial<TemplateInsert>
  onSubmit?: (template: TemplateInsert) => Promise<void>
  isEdit?: boolean
}

export default function TemplateForm({ initialValues, onSubmit, isEdit = false }: TemplateFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState(initialValues?.name || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(
    initialValues?.status || 'draft'
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다')
      }

      const templateData: TemplateInsert = {
        name,
        description,
        status,
        created_by: user.id,
        required_fields: [],
        validation_rules: {},
      }

      if (onSubmit) {
        await onSubmit(templateData)
      } else {
        await createTemplate(templateData)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/templates')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {isEdit ? t('templates.editTitle', '템플릿 수정') : t('templates.createTitle', '새 템플릿 생성')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('templates.saveSuccess', '템플릿이 성공적으로 저장되었습니다')}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            required
            label={t('templates.name', '템플릿 이름')}
            value={name}
            onChange={e => setName(e.target.value)}
            margin="normal"
            disabled={loading}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('templates.description', '설명')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            margin="normal"
            disabled={loading}
            helperText={t('templates.descriptionHelp', '이 템플릿에 대한 간단한 설명을 입력하세요')}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('templates.status', '상태')}</InputLabel>
            <Select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'active' | 'archived')}
              disabled={loading}
            >
              <MenuItem value="draft">{t('templates.statusDraft', '초안')}</MenuItem>
              <MenuItem value="active">{t('templates.statusActive', '활성')}</MenuItem>
              <MenuItem value="archived">{t('templates.statusArchived', '보관됨')}</MenuItem>
            </Select>
            <FormHelperText>
              {t('templates.statusHelp', '활성 상태의 템플릿만 견적서 검증에 사용할 수 있습니다')}
            </FormHelperText>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading || !name.trim()}
            >
              {loading ? t('common.saving', '저장 중...') : t('common.save', '저장')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/templates')}
              disabled={loading}
            >
              {t('common.cancel', '취소')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
