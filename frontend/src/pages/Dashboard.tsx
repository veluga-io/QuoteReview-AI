import { Container, Typography, Paper, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.welcomeMessage')}, {user?.profile?.full_name || user?.email}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">역할: {user?.profile?.role}</Typography>
        </Box>
      </Paper>
    </Container>
  )
}
