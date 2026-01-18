import { Container, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Submissions() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('submissions.title')}
      </Typography>
      <Typography color="text.secondary">검증 요청 관리 기능 (구현 예정)</Typography>
    </Container>
  )
}
