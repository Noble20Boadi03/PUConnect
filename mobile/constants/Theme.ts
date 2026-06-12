/**
 * Design tokens for the application.
 */

export interface ThemeColors {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  primary: string;
  secondary: string;
  error: string;
  border: string;
  card: string;
  shimmer: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#65A30D',
    icon: '#687076',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#65A30D',
    primary: '#65A30D',
    secondary: '#5856D6',
    error: '#FF3B30',
    border: '#E1E4E8',
    card: '#F4F4F5',
    shimmer: '#E5E7EB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#C4F000',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#C4F000',
    primary: '#C4F000',
    secondary: '#5E5CE6',
    error: '#FF453A',
    border: '#30363D',
    card: '#1E1E21',
    shimmer: '#2F2F33',
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

export const Typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
