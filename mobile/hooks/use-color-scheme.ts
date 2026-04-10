import { useTheme } from '@/context/theme-context';

/**
 * Returns 'light' | 'dark' based on the user's in-app theme choice,
 * NOT the device system scheme. This ensures components using
 * useColorScheme() respect the manual theme toggle.
 */
export function useColorScheme(): 'light' | 'dark' {
    const { isDark } = useTheme();
    return isDark ? 'dark' : 'light';
}
