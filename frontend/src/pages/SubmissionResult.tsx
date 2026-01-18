import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/submissions')}>
          {t('common.back', '돌아가기')}
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {submission.overall_status && getStatusIcon(submission.overall_status)}
            <Typography variant="h4" sx={{ ml: 1 }}>
              검증 결과
            </Typography>
            {submission.overall_status && (
              <Chip
                label={getStatusLabel(submission.overall_status)}
                color={getStatusColor(submission.overall_status)}
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            파일: {submission.file_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            템플릿: {submission.templates.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            상태: {submission.status === 'completed' ? '검증 완료' : submission.status === 'validating' ? '검증 중' : submission.status === 'failed' ? '검증 실패' : '업로드됨'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            검증 완료: {submission.validated_at ? new Date(submission.validated_at).toLocaleString('ko-KR') : '-'}
          </Typography>

          {submission.metadata && typeof submission.metadata === 'object' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                파싱된 메타데이터:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Object.entries(submission.metadata).map(([key, value]) => (
                  <span key={key}>
                    {key}: {String(value) || '(비어있음)'}<br />
                  </span>
                ))}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            검증 프로세스
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="1. 수학적 검증"
                secondary="라인 항목 합계, 소계, 세금, 총액 계산 검증"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. 필수 항목 검증"
                secondary="템플릿에서 추출된 필수 필드가 모두 입력되었는지 확인"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. 정책 규칙 검증"
                secondary="할인율 상한, 기타 비즈니스 규칙 준수 확인"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="4. 일관성 검증"
                secondary="통화 일치, 날짜 논리 확인"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="5. AI 보조 검증"
                secondary="Gemini AI가 추가적인 논리적 오류와 개선 사항을 분석"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {findings.length === 0 ? (
        <Alert severity="success" icon={<CheckIcon />}>
          <Typography variant="h6" gutterBottom>
            ✅ 검증 통과
          </Typography>
          <Typography variant="body2" paragraph>
            모든 검증 항목을 통과했습니다.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            검증된 항목:
          </Typography>
          <Typography variant="body2" component="div">
            • 수학적 계산 (라인 항목, 소계, 세금, 총액)<br />
            • 템플릿 필수 필드 완전성<br />
            • 정책 규칙 준수<br />
            • 데이터 일관성<br />
            • AI 논리 검증
          </Typography>
        </Alert>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                발견 사항 요약
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(groupedFindings).map(([severity, items]) => (
                  <Chip
                    key={severity}
                    label={`${getSeverityLabel(severity as Finding['severity'])}: ${items.length}건`}
                    color={getSeverityColor(severity as Finding['severity'])}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
            const items = groupedFindings[severity]
            if (!items || items.length === 0) return null

            return (
              <Paper key={severity} sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Chip
                    label={getSeverityLabel(severity)}
                    color={getSeverityColor(severity)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {getSeverityLabel(severity)} ({items.length}건)
                </Typography>
                <List>
                  {items.map((finding, index) => (
                    <ListItem key={finding.id || index} alignItems="flex-start">
                      <ListItemText
                        primary={finding.message}
                        secondary={
                          <>
                            {finding.location && (
                              <Typography component="span" variant="body2" color="text.secondary">
                                위치: {finding.location}
                                <br />
                              </Typography>
                            )}
                            {finding.expected_value && finding.actual_value && (
                              <Typography component="span" variant="body2" color="text.secondary">
                                예상값: {finding.expected_value} / 실제값: {finding.actual_value}
                                <br />
                              </Typography>
                            )}
                            {finding.recommendation && (
                              <Typography component="span" variant="body2" color="primary">
                                권장 조치: {finding.recommendation}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )
          })}
        </>
      )}
    </Container>
  )
}
