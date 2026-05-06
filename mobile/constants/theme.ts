import { Platform } from 'react-native';

/**
 * Material 3 Color Palette (Material You)
 * Using Indigo (#4f46e5) as the primary brand color
 */
const palette = {
  primary: {
    40: '#4f46e5', // Modern Indigo (Primary Brand)
    90: '#eef2ff', // Light Container
    10: '#312e81', // Deep Contrast
    80: '#a5b4fc', // Dark Mode Primary
    20: '#3730a3', // Dark Mode Container
  },
  secondary: {
    40: '#0284c7', // Deep Sky
    90: '#e0f2fe', 
    10: '#082f49', 
    80: '#7dd3fc', 
    20: '#075985', 
  },
  tertiary: {
    40: '#f59e0b', // Sunset Amber
    90: '#fef3c7', 
    10: '#78350f', 
    80: '#fcd34d', 
    20: '#92400e', 
  },
  error: {
    40: '#ef4444', 
    90: '#fee2e2', 
    10: '#450a0a', 
    80: '#fca5a5', 
    20: '#7f1d1d', 
  },
  neutral: {
    0:  '#000000',
    10: '#0f172a', // Slate 900
    20: '#1e293b', // Slate 800
    30: '#334155', // Slate 700
    50: '#64748b', // Slate 500
    80: '#94a3b8', // Slate 400 (Improved from Slate 300 for better visibility in dark)
    90: '#cbd5e1', // Slate 300
    95: '#f1f5f9', // Slate 100
    98: '#f8fafc', // Slate 50
    99: '#fafafa',
    100: '#ffffff',
  },
  neutralVariant: {
    30: '#1e293b', // Slate 800 (Much darker for light mode visibility)
    50: '#475569', // Slate 600 (Darker for light mode visibility)
    80: '#cbd5e1', 
    90: '#e2e8f0', 
  },
};

export const Colors = {
  light: {
    primary: palette.primary[40],
    onPrimary: palette.neutral[100],
    primaryContainer: palette.primary[90],
    onPrimaryContainer: palette.primary[10],
    
    secondary: palette.secondary[40],
    onSecondary: palette.neutral[100],
    secondaryContainer: palette.secondary[90],
    onSecondaryContainer: palette.secondary[10],
    
    tertiary: palette.tertiary[40],
    onTertiary: palette.neutral[100],
    tertiaryContainer: palette.tertiary[90],
    onTertiaryContainer: palette.tertiary[10],
    
    error: palette.error[40],
    onError: palette.neutral[100],
    errorContainer: palette.error[90],
    onErrorContainer: palette.error[10],
    
    background: palette.neutral[98],
    onBackground: palette.neutral[10],
    
    surface: palette.neutral[100],
    onSurface: palette.neutral[10],
    surfaceVariant: palette.neutral[95],
    onSurfaceVariant: palette.neutralVariant[30],
    
    outline: palette.neutralVariant[80],
    outlineVariant: palette.neutral[90],
    
    inverseSurface: palette.neutral[10],
    inverseOnSurface: palette.neutral[95],
    inversePrimary: palette.primary[80],
    
    // Legacy mapping (Improved contrast)
    text: palette.neutral[10],
    textSecondary: '#1e293b', // Slate 800
    textMuted: '#475569', // Slate 600
    tint: palette.primary[40],
    discoveryPrimary: '#10b981',
    icon: '#334155',
    tabIconDefault: '#64748b',
    tabIconSelected: palette.primary[40],
    border: palette.neutral[90],
    glass: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    primary: palette.primary[80],
    onPrimary: palette.neutral[100], // High contrast white for primary buttons
    primaryContainer: palette.primary[20],
    onPrimaryContainer: palette.primary[90],
    
    secondary: palette.secondary[80],
    onSecondary: palette.secondary[10],
    secondaryContainer: palette.secondary[20],
    onSecondaryContainer: palette.secondary[90],
    
    tertiary: palette.tertiary[80],
    onTertiary: palette.tertiary[10],
    tertiaryContainer: palette.tertiary[20],
    onTertiaryContainer: palette.tertiary[90],
    
    error: palette.error[80],
    onError: palette.error[10],
    errorContainer: palette.error[20],
    onErrorContainer: palette.error[90],
    
    background: '#000000', // Pure Black for OLED
    onBackground: palette.neutral[100],
    
    surface: '#121212', // Material Design elevated surface
    onSurface: palette.neutral[100],
    surfaceVariant: '#1e1e1e', // Higher elevation
    onSurfaceVariant: '#a3a3a3', // Neutral 400
    
    outline: '#333333', // Neutral border
    outlineVariant: '#262626', // Subtle border
    
    inverseSurface: palette.neutral[100],
    inverseOnSurface: '#000000',
    inversePrimary: palette.primary[40],
    
    // Legacy mapping (Improved contrast)
    text: palette.neutral[100],
    textSecondary: '#d4d4d4', // Neutral 300
    textMuted: '#a3a3a3', // Neutral 400
    tint: palette.primary[80],
    discoveryPrimary: '#10b981',
    icon: '#a3a3a3',
    tabIconDefault: '#737373', // Neutral 500
    tabIconSelected: palette.neutral[100],
    border: '#262626',
    glass: 'rgba(18, 18, 18, 0.75)',
    glassBorder: 'rgba(51, 51, 51, 0.5)',
  },
};

/**
 * 8pt Grid Spacing System
 */
export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  massive: 64,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

/**
 * Typography Scale (Material 3)
 */
export const Typography = {
  display: {
    large: { fontSize: 57, lineHeight: 64, fontWeight: '400' },
    medium: { fontSize: 45, lineHeight: 52, fontWeight: '400' },
    small: { fontSize: 36, lineHeight: 44, fontWeight: '400' },
  },
  headline: {
    large: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
    medium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
    small: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  },
  title: {
    large: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
    medium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  },
  body: {
    large: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
    medium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  },
  label: {
    large: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    medium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
    small: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  },
};

export const Shadows = {
  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Gradients = {
  primary: ['#4f46e5', '#3730a3'] as const,
  secondary: ['#0ea5e9', '#3b82f6'] as const,
  tertiary: ['#f59e0b', '#d97706'] as const,
  glass: (isDark: boolean) => isDark 
    ? ['rgba(18, 18, 18, 0.75)', 'rgba(0, 0, 0, 0.85)'] as const
    : ['rgba(255, 255, 255, 0.85)', 'rgba(241, 245, 249, 0.75)'] as const,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
});
