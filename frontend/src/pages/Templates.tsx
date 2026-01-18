import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTemplates } from '../hooks/useTemplates'
import type { Template } from '../types/template'

export default function Templates() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { templates, loading, error } = useTemplates()

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
    })
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            {t('templates.title', '템플릿 관리')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            견적서 검증에 사용할 템플릿을 관리합니다
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/templates/new')}
        >
          {t('templates.create', '템플릿 생성')}
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t('templates.empty', '생성된 템플릿이 없습니다.')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            첫 번째 템플릿을 생성하여 견적서 검증을 시작하세요
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/templates/new')}
          >
            {t('templates.createFirst', '첫 템플릿 생성하기')}
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('templates.name', '템플릿 이름')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('templates.description', '설명')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('templates.status', '상태')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('templates.createdAt', '생성일')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('templates.actions', '작업')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map(template => (
                <TableRow
                  key={template.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td': { borderBottom: 0 },
                  }}
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {template.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(template.status)}
                      color={getStatusColor(template.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(template.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="medium"
                      onClick={() => navigate(`/templates/${template.id}`)}
                      title={t('templates.view', '상세 보기')}
                      sx={{ mr: 1 }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="medium"
                      onClick={() => navigate(`/templates/${template.id}/edit`)}
                      title={t('templates.edit', '수정')}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}
