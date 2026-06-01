import { createTheme, ThemeProvider } from '@mui/material';
import React from 'react';

declare module '@mui/material/styles' {
  interface Theme {
    primaryColors: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      950: string;
    };
  }

  interface ThemeOptions {
    primaryColors?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      950: string;
    };
  }
}

const primaryColors = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

const ThemeContext = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: primaryColors[500],
        light: primaryColors[400],
        dark: primaryColors[600],
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6b7280',
        light: '#9ca3af',
        dark: '#4b5563',
        contrastText: '#ffffff',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: primaryColors[600],
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 'auto',
            padding: '2px 0',
            '& .MuiChip-label': {
              paddingLeft: '8px',
              paddingRight: '8px',
            },
          },
          colorPrimary: {
            backgroundColor: primaryColors[50],
            color: primaryColors[600],
            border: `1px solid ${primaryColors[100]}`,
            '&:hover': {
              backgroundColor: primaryColors[100],
            },
          },
          colorSuccess: {
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #dcfce7',
            '&:hover': {
              backgroundColor: '#dcfce7',
            },
          },
          colorError: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fee2e2',
            '&:hover': {
              backgroundColor: '#fee2e2',
            },
          },
          colorWarning: {
            backgroundColor: '#fffbeb',
            color: '#d97706',
            border: '1px solid #fef3c7',
            '&:hover': {
              backgroundColor: '#fef3c7',
            },
          },
          colorInfo: {
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #e0f2fe',
            '&:hover': {
              backgroundColor: '#e0f2fe',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            '& .MuiTouchRipple-root': {
              borderRadius: '6px',
              overflow: 'hidden',
            },
            '& .MuiTouchRipple-ripple': {
              borderRadius: '6px !important',
            },
            '& .MuiTouchRipple-rippleVisible': {
              borderRadius: '6px !important',
            },
            '& .MuiTouchRipple-child': {
              borderRadius: '6px !important',
            },
          },
        },
      },
    },
    primaryColors: primaryColors,
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export { primaryColors };
export default ThemeContext;
