import { createTheme, ThemeProvider } from '@mui/material';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  THEME_PALETTES,
  THEME_FONTS,
  THEME_RADII,
  type ThemePaletteKey,
  type ThemeFontKey,
  type ThemeRadiusKey,
  type ThemePreferences,
  DEFAULT_THEME_PREFERENCES,
} from './themeConfig';

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

interface ThemeContextType {
  preferences: ThemePreferences;
  setPalette: (palette: ThemePaletteKey) => void;
  setFont: (font: ThemeFontKey) => void;
  setRadius: (radius: ThemeRadiusKey) => void;
  setMode: (mode: 'light' | 'dark') => void;
}

const ThemeContextValue = createContext<ThemeContextType | undefined>(
  undefined
);

export const useThemeContext = () => {
  const context = useContext(ThemeContextValue);
  if (!context) {
    throw new Error(
      'useThemeContext must be used within a CustomThemeProvider'
    );
  }
  return context;
};

const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const saved = localStorage.getItem('themePreferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse theme preferences', e);
      }
    }
    return DEFAULT_THEME_PREFERENCES;
  });

  useEffect(() => {
    localStorage.setItem('themePreferences', JSON.stringify(preferences));

    const root = document.documentElement;

    const palette = THEME_PALETTES[preferences.palette].colors;
    Object.entries(palette).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-primary-${shade}`, hex);
    });

    const font = THEME_FONTS[preferences.font].value;
    root.style.setProperty('--font-primary', font);

    const radius = THEME_RADII[preferences.radius].value;
    root.style.setProperty('--global-radius', radius);
    root.style.setProperty('--radius', radius);
    root.style.setProperty('--radius-sm', radius);
    root.style.setProperty('--radius-md', radius);
    root.style.setProperty('--radius-lg', radius);
    root.style.setProperty('--radius-xl', radius);
    root.style.setProperty('--radius-2xl', radius);
    root.style.setProperty('--radius-3xl', radius);

    // Apply dark mode class to document element for Tailwind and standard styles
    if (preferences.mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [preferences]);

  const primaryColors = THEME_PALETTES[preferences.palette].colors;

  const theme = createTheme({
    palette: {
      mode: preferences.mode,
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
      ...(preferences.mode === 'dark'
        ? {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#f3f4f6',
              secondary: '#9ca3af',
            },
          }
        : {}),
    },
    typography: {
      fontFamily: THEME_FONTS[preferences.font].value,
    },
    shape: {
      borderRadius: parseInt(THEME_RADII[preferences.radius].value) || 0,
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
            borderRadius: THEME_RADII[preferences.radius].value,
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
            borderRadius: THEME_RADII[preferences.radius].value,
            '& .MuiTouchRipple-root': {
              borderRadius: THEME_RADII[preferences.radius].value,
              overflow: 'hidden',
            },
            '& .MuiTouchRipple-ripple': {
              borderRadius: `${THEME_RADII[preferences.radius].value} !important`,
            },
            '& .MuiTouchRipple-rippleVisible': {
              borderRadius: `${THEME_RADII[preferences.radius].value} !important`,
            },
            '& .MuiTouchRipple-child': {
              borderRadius: `${THEME_RADII[preferences.radius].value} !important`,
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            borderRadius: THEME_RADII[preferences.radius].value,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: THEME_RADII[preferences.radius].value,
          },
        },
      },
    },
    primaryColors: primaryColors,
  });

  const value: ThemeContextType = {
    preferences,
    setPalette: palette => setPreferences(p => ({ ...p, palette })),
    setFont: font => setPreferences(p => ({ ...p, font })),
    setRadius: radius => setPreferences(p => ({ ...p, radius })),
    setMode: mode => setPreferences(p => ({ ...p, mode })),
  };

  return (
    <ThemeContextValue.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContextValue.Provider>
  );
};

export { THEME_PALETTES as primaryColors }; // Kept for backwards compatibility if needed
export default CustomThemeProvider;
