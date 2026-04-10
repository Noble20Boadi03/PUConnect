import { Platform } from 'react-native';

/**
 * Material 3 Color Palette (Material You)
 * Using Indigo (#4f46e5) as the primary brand color
 */
const palette = {
  primary: {
    40: '#4f46e5', // Primary
    90: '#e0e0ff', // Primary Container (Light)
    10: '#00006e', // On Primary (Dark)
    80: '#c0c1ff', // Primary (Dark)
    20: '#1a00a0', // Primary Container (Dark)
  },
  secondary: {
    40: '#5e5e72', // Secondary
    90: '#e3e0f9', // Secondary Container (Light)
    10: '#1a1b2c', // On Secondary (Dark)
    80: '#c7c4e0', // Secondary (Dark)
    20: '#2b2c3e', // Secondary Container (Dark)
  },
  tertiary: {
    40: '#7e5264', // Tertiary
    90: '#ffd8e4', // Tertiary Container (Light)
    10: '#311021', // On Tertiary (Dark)
    80: '#efb8ce', // Tertiary (Dark)
    20: '#4a2537', // Tertiary Container (Dark)
  },
  error: {
    40: '#ba1a1a', // Error
    90: '#ffdad6', // Error Container (Light)
    10: '#410002', // On Error (Dark)
    80: '#ffb4ab', // Error (Dark)
    20: '#93000a', // Error Container (Dark)
  },
  neutral: {
    0: '#000000',
    10: '#1a1c1e',
    20: '#2f3033',
    90: '#e2e2e6',
    95: '#f1f0f4',
    98: '#fdfbff',
    99: '#fefbff',
    100: '#ffffff',
  },
  neutralVariant: {
    30: '#44474e',
    50: '#74777f',
    80: '#c4c6d0',
    90: '#e1e2ec',
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
    
    surface: palette.neutral[98],
    onSurface: palette.neutral[10],
    surfaceVariant: palette.neutralVariant[90],
    onSurfaceVariant: palette.neutralVariant[30],
    
    outline: palette.neutralVariant[50],
    outlineVariant: palette.neutralVariant[80],
    
    inverseSurface: palette.neutral[20],
    inverseOnSurface: palette.neutral[95],
    inversePrimary: palette.primary[80],
    
    // Legacy mapping (to avoid breaking things immediately)
    text: palette.neutral[10],
    textSecondary: palette.neutralVariant[30],
    textMuted: palette.neutralVariant[50],
    tint: palette.primary[40],
    discoveryPrimary: '#1dbf73', // Keep Fiverr green for discovery
    icon: palette.neutralVariant[30],
    tabIconDefault: palette.neutralVariant[50],
    tabIconSelected: palette.primary[40],
    border: palette.neutralVariant[80],
  },
  dark: {
    primary: palette.primary[80],
    onPrimary: palette.primary[20],
    primaryContainer: palette.primary[20],
    onPrimaryContainer: palette.primary[90],
    
    secondary: palette.secondary[80],
    onSecondary: palette.secondary[20],
    secondaryContainer: palette.secondary[20],
    onSecondaryContainer: palette.secondary[90],
    
    tertiary: palette.tertiary[80],
    onTertiary: palette.tertiary[20],
    tertiaryContainer: palette.tertiary[20],
    onTertiaryContainer: palette.tertiary[90],
    
    error: palette.error[80],
    onError: palette.error[20],
    errorContainer: palette.error[20],
    onErrorContainer: palette.error[90],
    
    background: palette.neutral[10],
    onBackground: palette.neutral[90],
    
    surface: palette.neutral[10],
    onSurface: palette.neutral[90],
    surfaceVariant: palette.neutralVariant[30],
    onSurfaceVariant: palette.neutralVariant[80],
    
    outline: palette.neutralVariant[80],
    outlineVariant: palette.neutralVariant[30],
    
    inverseSurface: palette.neutral[90],
    inverseOnSurface: palette.neutral[10],
    inversePrimary: palette.primary[40],
    
    // Legacy mapping
    text: palette.neutral[90],
    textSecondary: palette.neutralVariant[80],
    textMuted: palette.neutralVariant[50],
    tint: palette.primary[80],
    discoveryPrimary: '#1dbf73',
    icon: palette.neutralVariant[80],
    tabIconDefault: palette.neutralVariant[50],
    tabIconSelected: palette.primary[80],
    border: palette.neutralVariant[30],
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
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
