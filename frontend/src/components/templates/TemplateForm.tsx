import { useState, useEffect } from 'react'
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
  IconButton,
  Chip,
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon, Upload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TemplateInsert } from '../../types/template'
import { createTemplate } from '../../services/templates'
import { useAuth } from '../../contexts/AuthContext'
import { uploadFile } from '../../services/storage'
import { analyzeTemplateFile } from '../../utils/excel'
import type { ExtractedField } from '../../utils/excel'

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
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(
    initialValues?.file_url || null
  )
  const [uploading, setUploading] = useState(false)
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // initialValues가 변경될 때 상태 업데이트
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '')
      setDescription(initialValues.description || '')
      setStatus(initialValues.status || 'draft')
      setExistingFileUrl(initialValues.file_url || null)

      // required_fields가 있으면 extractedFields로 설정
      if (Array.isArray(initialValues.required_fields)) {
        setExtractedFields(initialValues.required_fields as unknown as ExtractedField[])
      }
    }
  }, [initialValues])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
      ]
      if (!validTypes.includes(file.type)) {
        setError('Excel 파일만 업로드할 수 있습니다 (.xlsx, .xls, .xlsm)')
        return
      }

      setTemplateFile(file)
      setError(null)

      // 파일 자동 분석
      setAnalyzing(true)
      try {
        console.log('📊 Analyzing template file:', file.name)
        const analysis = await analyzeTemplateFile(file)
        console.log('✓ Template analysis complete:', analysis)
        setExtractedFields(analysis.fields)
      } catch (analyzeErr) {
        console.error('❌ Template analysis failed:', analyzeErr)
        setError(
          analyzeErr instanceof Error
            ? `파일 분석 실패: ${analyzeErr.message}`
            : '파일을 분석하는 중 오류가 발생했습니다'
        )
      } finally {
        setAnalyzing(false)
      }
    }
  }

  const handleRemoveFile = () => {
    setTemplateFile(null)
    setExistingFileUrl(null)
    setExtractedFields([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!user?.profile?.id) {
        throw new Error('로그인이 필요합니다')
      }

      let fileUrl = existingFileUrl

      // Upload new file if selected
      if (templateFile) {
        setUploading(true)
        try {
          const filePath = `${user.profile.id}/${Date.now()}_${templateFile.name}`
          fileUrl = await uploadFile('templates', templateFile, filePath)
          console.log('✓ Template file uploaded:', fileUrl)
        } catch (uploadErr) {
          throw new Error(
            uploadErr instanceof Error
              ? `파일 업로드 실패: ${uploadErr.message}`
              : '파일 업로드에 실패했습니다'
          )
        } finally {
          setUploading(false)
        }
      }

      const templateData: TemplateInsert = {
        name,
        description,
        status,
        created_by: user.profile.id,
        file_url: fileUrl || null,
        required_fields: extractedFields as unknown as TemplateInsert['required_fields'],
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

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('templates.referenceFile', '참조 파일')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              기준이 되는 견적서 파일을 업로드하세요. 이 파일을 기준으로 새로운 견적서를 검증합니다.
            </Typography>

            {existingFileUrl && !templateFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={existingFileUrl.split('/').pop() || '기존 파일'}
                  color="primary"
                  variant="outlined"
                />
                <IconButton size="small" onClick={handleRemoveFile} disabled={loading}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {templateFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={`${templateFile.name} (${(templateFile.size / 1024).toFixed(1)} KB)`}
                  color="success"
                  variant="outlined"
                />
                <IconButton size="small" onClick={handleRemoveFile} disabled={loading}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Button
              variant="outlined"
              component="label"
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              disabled={loading || uploading}
            >
              {uploading ? '업로드 중...' : '파일 선택'}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileChange}
                disabled={loading || uploading}
              />
            </Button>
            <FormHelperText>
              Excel 파일 형식만 지원됩니다 (.xlsx, .xls, .xlsm)
            </FormHelperText>
          </Box>

          {analyzing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                파일을 분석하는 중...
              </Typography>
            </Box>
          )}

          {extractedFields.length > 0 && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                추출된 필드 ({extractedFields.length}개)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                템플릿에서 자동으로 추출된 필드입니다. 검증에 사용됩니다.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {extractedFields.map((field, index) => (
                  <Chip
                    key={index}
                    label={`${field.label} (${field.field_type})`}
                    color={
                      field.field_type === 'metadata'
                        ? 'primary'
                        : field.field_type === 'line_item'
                        ? 'secondary'
                        : 'default'
                    }
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

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
