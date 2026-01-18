import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
  Alert,
  Paper,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getSubmissionWithFindings } from '../services/submissions'
import type { Submission, Finding } from '../types/validation'

export default function SubmissionResult() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [submission, setSubmission] = useState<
    (Submission & { templates: { name: string } }) | null
  >(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadSubmission(id)
    }
  }, [id])

  async function loadSubmission(submissionId: string) {
    try {
      setLoading(true)
      setError(null)
      const data = await getSubmissionWithFindings(submissionId)
      setSubmission(data.submission)
      setFindings(data.findings)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검증 결과를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Submission['overall_status']) => {
    switch (status) {
      case 'pass':
        return <CheckIcon color="success" />
      case 'warning':
        return <WarningIcon color="warning" />
      case 'fail':
        return <ErrorIcon color="error" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Submission['overall_status']) => {
    switch (status) {
      case 'pass':
        return 'success'
      case 'warning':
        return 'warning'
      case 'fail':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: Submission['overall_status']) => {
    switch (status) {
      case 'pass':
        return '통과'
      case 'warning':
        return '경고'
      case 'fail':
        return '실패'
      default:
        return status
    }
  }

  const getSeverityColor = (severity: Finding['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  const getSeverityLabel = (severity: Finding['severity']) => {
    switch (severity) {
      case 'critical':
        return '치명적'
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return severity
    }
  }

  const groupedFindings = findings.reduce(
    (acc, finding) => {
      if (!acc[finding.severity]) {
        acc[finding.severity] = []
      }
      acc[finding.severity].push(finding)
      return acc
    },
    {} as Record<string, Finding[]>
  )

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || !submission) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || '검증 결과를 찾을 수 없습니다'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/submissions')}
          sx={{ mt: 2 }}
        >
          목록으로 돌아가기
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/submissions')}
        sx={{ mb: 3, fontWeight: 600 }}
      >
        {t('common.back', '돌아가기')}
      </Button>

      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {submission.overall_status && getStatusIcon(submission.overall_status)}
          <Typography variant="h3" fontWeight={700} sx={{ ml: 1.5 }}>
            검증 결과
          </Typography>
          {submission.overall_status && (
            <Chip
              label={getStatusLabel(submission.overall_status)}
              color={getStatusColor(submission.overall_status)}
              sx={{ ml: 2, fontWeight: 600, fontSize: '0.875rem' }}
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              파일명
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {submission.file_name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              템플릿
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {submission.templates.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              상태
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {submission.status === 'completed' ? '검증 완료' : submission.status === 'validating' ? '검증 중' : submission.status === 'failed' ? '검증 실패' : '업로드됨'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              검증 완료
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {submission.validated_at ? new Date(submission.validated_at).toLocaleString('ko-KR') : '-'}
            </Typography>
          </Box>
        </Box>

        {submission.metadata && typeof submission.metadata === 'object' && (
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              파싱된 메타데이터
            </Typography>
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {Object.entries(submission.metadata).map(([key, value]) => (
                <Box key={key}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {key}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {String(value) || '(비어있음)'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          검증 프로세스
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              1. 수학적 검증
            </Typography>
            <Typography variant="body2" color="text.secondary">
              라인 항목 합계, 소계, 세금, 총액 계산 검증
            </Typography>
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              2. 필수 항목 검증
            </Typography>
            <Typography variant="body2" color="text.secondary">
              템플릿에서 추출된 필수 필드가 모두 입력되었는지 확인
            </Typography>
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              3. 정책 규칙 검증
            </Typography>
            <Typography variant="body2" color="text.secondary">
              할인율 상한, 기타 비즈니스 규칙 준수 확인
            </Typography>
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              4. 일관성 검증
            </Typography>
            <Typography variant="body2" color="text.secondary">
              통화 일치, 날짜 논리 확인
            </Typography>
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              5. AI 보조 검증
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gemini AI가 추가적인 논리적 오류와 개선 사항을 분석
            </Typography>
          </Box>
        </Box>
      </Paper>

      {findings.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'success.main',
            backgroundColor: 'success.lighter',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckIcon color="success" sx={{ fontSize: 32, mr: 1.5 }} />
            <Typography variant="h4" fontWeight={700} color="success.dark">
              검증 통과
            </Typography>
          </Box>
          <Typography variant="body1" color="success.dark" paragraph>
            모든 검증 항목을 통과했습니다.
          </Typography>
          <Divider sx={{ my: 3, borderColor: 'success.main', opacity: 0.3 }} />
          <Typography variant="h6" fontWeight={600} color="success.dark" gutterBottom>
            검증된 항목
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" color="success.dark">
              ✓ 수학적 계산 (라인 항목, 소계, 세금, 총액)
            </Typography>
            <Typography variant="body1" color="success.dark">
              ✓ 템플릿 필수 필드 완전성
            </Typography>
            <Typography variant="body1" color="success.dark">
              ✓ 정책 규칙 준수
            </Typography>
            <Typography variant="body1" color="success.dark">
              ✓ 데이터 일관성
            </Typography>
            <Typography variant="body1" color="success.dark">
              ✓ AI 논리 검증
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          <Paper
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" fontWeight={600} gutterBottom>
              발견 사항 요약
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(groupedFindings).map(([severity, items]) => (
                <Chip
                  key={severity}
                  label={`${getSeverityLabel(severity as Finding['severity'])}: ${items.length}건`}
                  color={getSeverityColor(severity as Finding['severity'])}
                  sx={{ fontWeight: 600, fontSize: '0.875rem', py: 2.5, px: 1 }}
                />
              ))}
            </Box>
          </Paper>

          {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
            const items = groupedFindings[severity]
            if (!items || items.length === 0) return null

            return (
              <Paper
                key={severity}
                sx={{
                  mb: 3,
                  p: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Chip
                    label={getSeverityLabel(severity)}
                    color={getSeverityColor(severity)}
                    sx={{ mr: 2, fontWeight: 600 }}
                  />
                  <Typography variant="h5" fontWeight={600}>
                    {getSeverityLabel(severity)} ({items.length}건)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {items.map((finding, index) => (
                    <Box
                      key={finding.id || index}
                      sx={{
                        p: 3,
                        backgroundColor: 'grey.50',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: `${getSeverityColor(severity)}.main`,
                      }}
                    >
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        {finding.message}
                      </Typography>
                      {finding.location && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>위치:</strong> {finding.location}
                        </Typography>
                      )}
                      {finding.expected_value && finding.actual_value && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          <strong>예상값:</strong> {finding.expected_value} / <strong>실제값:</strong> {finding.actual_value}
                        </Typography>
                      )}
                      {finding.recommendation && (
                        <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ mt: 2 }}>
                          💡 {finding.recommendation}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            )
          })}
        </>
      )}
    </Container>
  )
}
