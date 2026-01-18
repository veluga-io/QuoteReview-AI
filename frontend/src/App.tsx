import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { ThemeProvider, useTheme } from './hooks/useTheme'
import { AuthProvider } from './contexts/AuthContext'
import { lightTheme, darkTheme } from './theme'
import './i18n'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import Submissions from './pages/Submissions'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const { mode } = useTheme()
  const theme = mode === 'light' ? lightTheme : darkTheme

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="templates" element={<Templates />} />
              <Route path="submissions" element={<Submissions />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
