import { useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { toggleThemePreference } from '../lib/themePreference';

/**
 * Local theme toggle for the Profile header (device appearance only).
 */
export function useThemeToggle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconName = isDark ? 'sunny-outline' : 'moon-outline';

  const handleToggle = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleThemePreference();
  }, []);

  return {
    isDark,
    iconName,
    handleToggle,
  };
}

export default useThemeToggle;
