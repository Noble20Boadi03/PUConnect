import Constants from 'expo-constants';
import { Platform, StatusBar } from 'react-native';
import { Spacing } from '../constants/Theme';
import { ANDROID_EDGE_TO_EDGE_ENABLED } from '../constants/Android';

/** Fallback when `useSafeAreaInsets().bottom` is 0 on Android edge-to-edge. */
const ANDROID_BOTTOM_INSET_FALLBACK = 48;

/** Reliable status bar height when nested stacks report `insets.top === 0`. */
export function getSafeAreaTop(insetTop: number): number {
  const statusBarHeight =
    Constants.statusBarHeight ??
    (Platform.OS === 'android' ? StatusBar.currentHeight : undefined) ??
    (Platform.OS === 'ios' ? 47 : 24);

  return Math.max(insetTop, statusBarHeight ?? 24);
}

/** Top padding for full-screen stack headers (category, service list, etc.). */
export function getScreenTopPadding(insetTop: number, extra = Spacing.md): number {
  return getSafeAreaTop(insetTop) + extra;
}

/** Bottom inset for full-screen content above the system nav / home indicator. */
export function getSafeAreaBottom(insetBottom: number): number {
  if (insetBottom > 0) return insetBottom;
  if (Platform.OS === 'android' && ANDROID_EDGE_TO_EDGE_ENABLED) {
    return ANDROID_BOTTOM_INSET_FALLBACK;
  }
  return Spacing.sm;
}

/** Bottom padding inside the tab bar (keeps icons above the system navigation bar). */
export function getTabBarBottomPadding(insetBottom: number): number {
  return Math.max(getSafeAreaBottom(insetBottom), Spacing.sm);
}

/** Total tab bar height including safe-area padding. */
export function getTabBarHeight(insetBottom: number): number {
  const baseHeight = Platform.OS === 'ios' ? 49 : 56;
  return baseHeight + getTabBarBottomPadding(insetBottom);
}
