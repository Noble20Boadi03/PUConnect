import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/Theme';

/**
 * Custom hook to access admin-specific theme colors.
 * Overrides the primary, tabIconSelected, and tint colors to deep green.
 * 
 * @returns The color scheme object for the current theme with deep green overrides.
 */
export function useAdminThemeColor(): ThemeColors {
  const theme = useColorScheme() ?? 'light';
  const baseColors = Colors[theme];

  return {
    ...baseColors,
    primary: theme === 'dark' ? '#22C55E' : '#166534',
    tabIconSelected: theme === 'dark' ? '#22C55E' : '#166534',
    tint: theme === 'dark' ? '#22C55E' : '#166534',
  };
}

export default useAdminThemeColor;
