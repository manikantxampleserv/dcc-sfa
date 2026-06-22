export const THEME_PALETTES = {
  blue: {
    name: 'Blue',
    colors: {
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
    },
  },
  emerald: {
    name: 'Green',
    colors: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
  },
  rose: {
    name: 'Red',
    colors: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
  },
  violet: {
    name: 'Violet',
    colors: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
  },
  amber: {
    name: 'Orange',
    colors: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
  },
};

export type ThemePaletteKey = keyof typeof THEME_PALETTES;

export const THEME_FONTS = {
  poppins: { name: 'Poppins', value: "'Poppins', sans-serif" },
  inter: { name: 'Inter', value: "'Inter', sans-serif" },
  roboto: { name: 'Roboto', value: "'Roboto', sans-serif" },
  outfit: { name: 'Outfit', value: "'Outfit', sans-serif" },
};

export type ThemeFontKey = keyof typeof THEME_FONTS;

export const THEME_RADII = {
  none: { name: 'None', value: '0px' },
  sm: { name: 'Small', value: '4px' },
  md: { name: 'Medium', value: '8px' },
  lg: { name: 'Large', value: '12px' },
};

export type ThemeRadiusKey = keyof typeof THEME_RADII;

export interface ThemePreferences {
  palette: ThemePaletteKey;
  font: ThemeFontKey;
  radius: ThemeRadiusKey;
  mode: 'light' | 'dark';
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  palette: 'blue',
  font: 'poppins',
  radius: 'sm',
  mode: 'light',
};
