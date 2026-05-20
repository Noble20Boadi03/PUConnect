/**
 * Theme preference types shared between client and API.
 */

/** Supported application color schemes. */
export type ThemePreference = 'light' | 'dark';

/** Payload for PATCH /api/auth/preferences. */
export interface UpdateThemePreferencePayload {
  themePreference: ThemePreference;
}

/** Data returned after updating theme preference. */
export interface ThemePreferenceData {
  themePreference: ThemePreference;
}

/** Result of a theme toggle on the Profile screen. */
export interface ThemeToggleResult {
  success: boolean;
  themePreference: ThemePreference;
  message?: string;
}

/** UI state while updating theme on the Profile screen. */
export interface ProfileThemeState {
  isUpdating: boolean;
  error: string | null;
}
