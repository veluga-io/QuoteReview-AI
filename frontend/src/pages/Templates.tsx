import { Container, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Templates() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('templates.title')}
      </Typography>
      <Typography color="text.secondary">템플릿 관리 기능 (구현 예정)</Typography>
    </Container>
  )
}
