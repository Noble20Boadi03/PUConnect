import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import type { StatusBarStyle } from 'expo-status-bar';
import { ANDROID_EDGE_TO_EDGE_ENABLED } from '../constants/Android';

export interface SystemChromeConfig {
  statusBarStyle: StatusBarStyle;
  /** Used only when edge-to-edge is disabled on Android. */
  androidNavBarColor: string;
  androidNavBarButtonStyle: 'light' | 'dark';
}

const LIGHT_SCREEN_BG = '#F4F4F5';
const DARK_SCREEN_BG = '#09090B';
const LIGHT_CARD_BG = '#FFFFFF';
const DARK_CARD_BG = '#18181B';
const GALLERY_CHROME_BG = '#0a0a0a';

/** Default chrome for app screens (tabs, settings, etc.). */
export function getThemeSystemChrome(isDark: boolean): SystemChromeConfig {
  return {
    statusBarStyle: isDark ? 'light' : 'dark',
    androidNavBarColor: isDark ? DARK_SCREEN_BG : LIGHT_SCREEN_BG,
    androidNavBarButtonStyle: isDark ? 'light' : 'dark',
  };
}

/** Chrome when the post gallery (dark imagery) dominates the top of the screen. */
export function getPostGallerySystemChrome(): SystemChromeConfig {
  return {
    statusBarStyle: 'light',
    androidNavBarColor: GALLERY_CHROME_BG,
    androidNavBarButtonStyle: 'light',
  };
}

/** Chrome when post detail content / footer is primary. */
export function getPostContentSystemChrome(
  isDark: boolean,
  options?: { footerVisible?: boolean }
): SystemChromeConfig {
  const footerVisible = options?.footerVisible ?? false;
  return {
    statusBarStyle: isDark ? 'light' : 'dark',
    androidNavBarColor: footerVisible
      ? isDark
        ? DARK_CARD_BG
        : LIGHT_CARD_BG
      : isDark
        ? DARK_SCREEN_BG
        : LIGHT_SCREEN_BG,
    androidNavBarButtonStyle: isDark ? 'light' : 'dark',
  };
}

export async function applyAndroidSystemChrome(config: SystemChromeConfig): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    // Edge-to-edge: nav bar is transparent; only button contrast can be set.
    if (!ANDROID_EDGE_TO_EDGE_ENABLED) {
      await NavigationBar.setBackgroundColorAsync(config.androidNavBarColor);
    }
    await NavigationBar.setButtonStyleAsync(config.androidNavBarButtonStyle);
  } catch {
    // Navigation bar APIs can fail on emulators or unsupported devices.
  }
}

export async function applyThemeSystemChrome(isDark: boolean): Promise<void> {
  await applyAndroidSystemChrome(getThemeSystemChrome(isDark));
}
