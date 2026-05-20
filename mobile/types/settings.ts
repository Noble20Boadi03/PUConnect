/**
 * Types for the Settings screen and its actions.
 */

/**
 * UI state while performing logout on the Settings screen.
 */
export interface SettingsLogoutState {
  isLoading: boolean;
  error: string | null;
  confirmVisible: boolean;
}
