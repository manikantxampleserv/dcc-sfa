import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Divider,
  Box,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import { Palette, X, Type, Square, Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import {
  THEME_PALETTES,
  THEME_FONTS,
  THEME_RADII,
  type ThemePaletteKey,
  type ThemeFontKey,
  type ThemeRadiusKey,
} from '../../context/ThemeContext/themeConfig';

const ThemeSettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, setPalette, setFont, setRadius, setMode } = useThemeContext();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setIsOpen(open);
    };

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title="Theme Settings" placement="left">
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            backgroundColor: 'primary.main',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s',
            zIndex: 1000,
            width: 48,
            height: 48,
          }}
        >
          <Palette size={24} />
        </IconButton>
      </Tooltip>

      {/* Settings Drawer */}
      <Drawer anchor="right" open={isOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 320, p: 3 }} role="presentation">
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Palette size={20} /> Theme Settings
            </Typography>
            <IconButton onClick={toggleDrawer(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>
          {/* Theme Mode (Light / Dark) */}
          <Box mb={4}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              mb={2}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {preferences.mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Theme Mode
            </Typography>
            <Box display="flex" gap={1}>
              <Box
                onClick={() => setMode('light')}
                sx={{
                  flex: 1,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  border: '1px solid',
                  borderColor: preferences.mode === 'light' ? 'primary.main' : 'grey.300',
                  backgroundColor: preferences.mode === 'light' ? 'primary.main' : 'transparent',
                  color: preferences.mode === 'light' ? 'white' : 'text.primary',
                  borderRadius: THEME_RADII[preferences.radius].value,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: preferences.mode === 'light' ? 600 : 400,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: preferences.mode === 'light' ? 'primary.dark' : 'grey.100',
                  },
                }}
              >
                <Sun size={16} /> Light
              </Box>
              <Box
                onClick={() => setMode('dark')}
                sx={{
                  flex: 1,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  border: '1px solid',
                  borderColor: preferences.mode === 'dark' ? 'primary.main' : 'grey.300',
                  backgroundColor: preferences.mode === 'dark' ? 'primary.main' : 'transparent',
                  color: preferences.mode === 'dark' ? 'white' : 'text.primary',
                  borderRadius: THEME_RADII[preferences.radius].value,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: preferences.mode === 'dark' ? 600 : 400,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: preferences.mode === 'dark' ? 'primary.dark' : 'grey.100',
                  },
                }}
              >
                <Moon size={16} /> Dark
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Color Palette Selection */}
          <Box mb={4}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              mb={2}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Palette size={16} /> Primary Color
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap">
              {(Object.keys(THEME_PALETTES) as ThemePaletteKey[]).map(key => {
                const palette = THEME_PALETTES[key];
                const isSelected = preferences.palette === key;
                return (
                  <Tooltip title={palette.name} key={key} placement="top">
                    <Box
                      onClick={() => setPalette(key)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: palette.colors[500],
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isSelected
                          ? '2px solid'
                          : '2px solid transparent',
                        borderColor: isSelected
                          ? 'text.primary'
                          : 'transparent',
                        outline: isSelected
                          ? `2px solid ${palette.colors[500]}`
                          : 'none',
                        outlineOffset: '2px',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Font Family Selection */}
          <Box mb={4}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              mb={2}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Type size={16} /> Font Family
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={preferences.font}
                onChange={e => setFont(e.target.value as ThemeFontKey)}
              >
                {(Object.keys(THEME_FONTS) as ThemeFontKey[]).map(key => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio size="small" />}
                    label={
                      <Typography
                        style={{ fontFamily: THEME_FONTS[key].value }}
                      >
                        {THEME_FONTS[key].name}
                      </Typography>
                    }
                    sx={{
                      mb: 1,
                      border: '1px solid',
                      borderColor:
                        preferences.font === key ? 'primary.main' : 'grey.200',
                      borderRadius: 1,
                      p: 0.5,
                      pl: 1,
                      backgroundColor:
                        preferences.font === key ? 'primary.50' : 'transparent',
                      transition: 'all 0.2s',
                      margin: '0 0 8px 0',
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Border Radius Selection */}
          <Box mb={4}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              mb={2}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Square size={16} /> Border Radius
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {(Object.keys(THEME_RADII) as ThemeRadiusKey[]).map(key => {
                const radius = THEME_RADII[key];
                const isSelected = preferences.radius === key;
                return (
                  <Box
                    key={key}
                    onClick={() => setRadius(key)}
                    sx={{
                      px: 2,
                      py: 1,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'grey.300',
                      backgroundColor: isSelected
                        ? 'primary.main'
                        : 'transparent',
                      color: isSelected ? 'white' : 'text.primary',
                      borderRadius: radius.value,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: isSelected
                          ? 'primary.dark'
                          : 'grey.100',
                      },
                    }}
                  >
                    {radius.name}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ThemeSettingsPanel;
