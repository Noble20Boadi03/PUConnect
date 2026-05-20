import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEME_PREFERENCE_KEY } from '../constants';
import type { ThemePreference } from '../types';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark';

/**
 * Restores the last locally saved theme when the app starts.
 */
export async function initializeThemePreference(): Promise<void> {
  const stored = await SecureStore.getItemAsync(THEME_PREFERENCE_KEY);
  if (isThemePreference(stored)) {
    Appearance.setColorScheme(stored);
  }
}

/**
 * Toggles light/dark mode on the device only (no server).
 */
export async function toggleThemePreference(): Promise<ThemePreference> {
  const current = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const next: ThemePreference = current === 'dark' ? 'light' : 'dark';
  Appearance.setColorScheme(next);
  await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, next);
  return next;
}
