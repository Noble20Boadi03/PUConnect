import { Platform } from 'react-native';

const palette = {
  primary: '#4f46e5', // Indigo - PuConnect signature
  primaryLight: '#818cf8',
  fiverrGreen: '#1dbf73',
  secondary: '#1a1a1a', 
  accent: '#1a1a1a', 
  background: {
    light: '#ffffff',
    dark: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    dark: '#1e293b',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#555555',
    muted: '#999999',
    onPrimary: '#ffffff',
  },
  border: '#eeeeee',
  error: '#ef4444',
};

export const Colors = {
  light: {
    text: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    background: palette.background.light,
    surface: palette.surface.light,
    tint: palette.primary,
    primary: palette.primary,
    discoveryPrimary: palette.fiverrGreen,
    secondary: palette.secondary,
    accent: palette.accent,
    icon: palette.text.secondary,
    tabIconDefault: palette.text.muted,
    tabIconSelected: palette.primary,
    border: palette.border,
    error: palette.error,
  },
  dark: {
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    background: palette.background.dark,
    surface: palette.surface.dark,
    tint: palette.primaryLight,
    primary: palette.primaryLight,
    discoveryPrimary: palette.fiverrGreen,
    secondary: palette.secondary,
    accent: palette.accent,
    icon: '#cbd5e1',
    tabIconDefault: '#64748b',
    tabIconSelected: palette.primaryLight,
    border: '#334155',
    error: palette.error,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
