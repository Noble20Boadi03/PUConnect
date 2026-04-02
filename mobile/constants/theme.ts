import { Platform } from 'react-native';

const palette = {
  primary: '#4f46e5', // Indigo - Trust, Professionalism
  primaryLight: '#818cf8',
  secondary: '#10b981', // Emerald - Completion, Success
  accent: '#f59e0b', // Amber - Projects, Attention
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    dark: '#1e293b',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    onPrimary: '#ffffff',
  },
  border: '#e2e8f0',
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
