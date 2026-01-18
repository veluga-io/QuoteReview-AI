import {
  Box,
  Button,
  Card,
  CardContent,
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('templates.title', '템플릿 관리')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/templates/new')}
        >
          {t('templates.create', '템플릿 생성')}
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              {t('templates.empty', '생성된 템플릿이 없습니다.')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/templates/new')}
              >
                {t('templates.createFirst', '첫 템플릿 생성하기')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('templates.name', '템플릿 이름')}</TableCell>
                <TableCell>{t('templates.description', '설명')}</TableCell>
                <TableCell>{t('templates.status', '상태')}</TableCell>
                <TableCell>{t('templates.createdAt', '생성일')}</TableCell>
                <TableCell align="right">{t('templates.actions', '작업')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
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
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(template.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/templates/${template.id}`)}
                      title={t('templates.view', '상세 보기')}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/templates/${template.id}/edit`)}
                      title={t('templates.edit', '수정')}
                    >
                      <EditIcon fontSize="small" />
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
