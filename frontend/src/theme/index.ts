import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

// 토스 디자인 시스템 컬러
const tossBlue = '#3182F6'
const tossRed = '#F04452'
const tossGreen = '#3BC675'
const tossYellow = '#FFBC00'
const tossGray900 = '#191F28'
const tossGray800 = '#333D4B'
const tossGray700 = '#4E5968'
const tossGray600 = '#6B7684'
const tossGray500 = '#8B95A1'
const tossGray400 = '#B0B8C1'
const tossGray300 = '#C9CED6'
const tossGray200 = '#E5E8EB'
const tossGray100 = '#F2F4F6'
const tossGray50 = '#F9FAFB'

const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Noto Sans KR"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          padding: '16px 24px',
          fontSize: '1.125rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: tossBlue,
      light: '#5BA3FF',
      dark: '#1B64DA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tossGray800,
      light: tossGray600,
      dark: tossGray900,
    },
    error: {
      main: tossRed,
      light: '#FF6B7A',
      dark: '#D63440',
    },
    warning: {
      main: tossYellow,
      light: '#FFD142',
      dark: '#E6A700',
    },
    success: {
      main: tossGreen,
      light: '#5FD993',
      dark: '#2BA361',
    },
    background: {
      default: tossGray50,
      paper: '#FFFFFF',
    },
    text: {
      primary: tossGray900,
      secondary: tossGray700,
      disabled: tossGray500,
    },
    divider: tossGray200,
  },
})

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#5BA3FF',
      light: '#7DB8FF',
      dark: tossBlue,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tossGray400,
      light: tossGray300,
      dark: tossGray500,
    },
    error: {
      main: '#FF6B7A',
      light: '#FF8B96',
      dark: tossRed,
    },
    warning: {
      main: '#FFD142',
      light: '#FFE066',
      dark: tossYellow,
    },
    success: {
      main: '#5FD993',
      light: '#7FE4AB',
      dark: tossGreen,
    },
    background: {
      default: '#0F1419',
      paper: '#1A1F28',
    },
    text: {
      primary: '#F2F4F6',
      secondary: tossGray400,
      disabled: tossGray600,
    },
    divider: tossGray800,
  },
})
