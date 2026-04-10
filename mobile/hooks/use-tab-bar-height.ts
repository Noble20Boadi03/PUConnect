import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from './use-responsive';

/**
 * Returns the exact height of the bottom tab bar for the current device,
 * orientation, and platform. Use this to correctly pad scroll content so
 * nothing is obscured behind the tab bar or system navigation bar.
 *
 * Usage (inside a tab screen's FlatList/ScrollView):
 *   const tabBarHeight = useTabBarHeight();
 *   contentContainerStyle={{ paddingBottom: tabBarHeight }}
 */
export function useTabBarHeight(): number {
    const insets = useSafeAreaInsets();
    const { isLandscape } = useResponsive();

    // These match the exact values in app/(tabs)/_layout.tsx
    const baseHeight = Platform.select({
        ios: isLandscape ? 48 : 64,
        android: isLandscape ? 46 : 62,
        default: isLandscape ? 46 : 62,
    }) ?? 62;

    return baseHeight + insets.bottom;
}
