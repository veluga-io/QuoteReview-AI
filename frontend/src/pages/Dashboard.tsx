import { Container, Typography, Paper, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.welcomeMessage')}, {user?.profile?.full_name || user?.email}
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          계정 정보
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              이메일
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.email}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              역할
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.profile?.role}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
