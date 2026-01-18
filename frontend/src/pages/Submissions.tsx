import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import { CloudUpload as UploadIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTemplates } from '../hooks/useTemplates'
import { createSubmission } from '../services/submissions'
import { useAuth } from '../contexts/AuthContext'
import { validateFileExtension, validateFileSize } from '../utils/excel'

export default function Submissions() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { templates, loading: templatesLoading } = useTemplates()

  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const activeTemplates = templates.filter(t => t.status === 'active')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // 파일 확장자 검증
    if (!validateFileExtension(file)) {
      setError('Excel 파일만 업로드 가능합니다 (.xlsx, .xls, .xlsm)')
      return
    }

    // 파일 크기 검증
    if (!validateFileSize(file, 100)) {
      setError('파일 크기가 100MB를 초과할 수 없습니다')
      return
    }

    setSelectedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedTemplateId) {
      setError('템플릿을 선택해주세요')
      return
    }

    if (!selectedFile) {
      setError('파일을 선택해주세요')
      return
    }

    if (!user?.profile?.id) {
      setError('로그인이 필요합니다')
      return
    }

    try {
      setUploading(true)
      const { submission } = await createSubmission(selectedTemplateId, selectedFile, user.profile.id)

      setUploading(false)
      setValidating(true)
      setSuccess(true)

      // 검증 완료 대기 (폴링)
      const checkValidation = setInterval(async () => {
        // 여기서는 간단히 3초 후 결과 페이지로 이동
        // 실제로는 submission 상태를 폴링해야 함
        setTimeout(() => {
          clearInterval(checkValidation)
          setValidating(false)
          navigate(`/submissions/${submission.id}`)
        }, 3000)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다')
      setUploading(false)
      setValidating(false)
    }
  }

  if (templatesLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('submissions.title', '견적서 검증')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('submissions.description', '견적서 파일을 업로드하여 자동 검증을 실행합니다')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {uploading
            ? '파일 업로드 중...'
            : validating
              ? '검증 실행 중...'
              : '검증이 완료되었습니다'}
        </Alert>
      )}

      {(uploading || validating) && <LinearProgress sx={{ mb: 2 }} />}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('submissions.selectTemplate', '템플릿 선택')}</InputLabel>
              <Select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                disabled={uploading || validating}
              >
                {activeTemplates.length === 0 ? (
                  <MenuItem disabled>활성 템플릿이 없습니다</MenuItem>
                ) : (
                  activeTemplates.map(template => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, mb: 2 }}>
              <input
                accept=".xlsx,.xls,.xlsm"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={uploading || validating}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  disabled={uploading || validating}
                >
                  {selectedFile
                    ? `선택된 파일: ${selectedFile.name}`
                    : t('submissions.selectFile', '파일 선택')}
                </Button>
              </label>
            </Box>

            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                파일 크기: {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                !selectedTemplateId || !selectedFile || uploading || validating
              }
              startIcon={uploading || validating ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading
                ? '업로드 중...'
                : validating
                  ? '검증 중...'
                  : t('submissions.submit', '검증 실행')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
