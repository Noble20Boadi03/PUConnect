/**
 * Types and interfaces related to authentication flows (Login, Register, and Onboarding).
 */

/**
 * Credentials required for standard login.
 */
export interface LoginCredentials {
  emailOrUsername?: string;
  password?: string;
}

/**
 * Data gathered throughout the multi-step registration wizard.
 */
export interface RegisterCredentials {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
}

/**
 * Route parameter types returned on the Login screen.
 */
export interface LoginSearchParams {
  registered?: string;
  username?: string;
}

/**
 * Route parameter types returned on the Landing Page.
 */
export interface LandingPageSearchParams {
  slide?: string;
  skipSplash?: string;
}

/**
 * Focusable inputs on the Login form.
 */
export type LoginFormInput = 'emailOrUsername' | 'password';

/**
 * Focusable inputs throughout the multi-wizard Registration form.
 */
export type RegisterFormInput = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'username';

/**
 * Strict bounds for the registration wizard step progression.
 */
export type WizardStep = 1 | 2 | 3;
