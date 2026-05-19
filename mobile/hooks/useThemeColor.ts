import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Theme';

/**
 * Custom hook to access theme colors based on the current appearance mode.
 * 
 * @returns The color scheme object for the current theme (light or dark).
 */
export function useThemeColor() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
}

export default useThemeColor;
