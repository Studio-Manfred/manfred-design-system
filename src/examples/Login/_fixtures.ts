/**
 * Studio Manfred-flavoured copy for the Login demo.
 *
 * Voice mirrors the Dashboard fixture: real product strings, not lorem.
 * Each export is `readonly`-typed so demos can rely on stable shapes.
 */

export interface AuthCopy {
  /** h1 above (or inside) the auth Card. */
  heading: string;
  /** CardDescription beneath the heading. */
  description: string;
  /** TextInput placeholder for the email field. */
  emailPlaceholder: string;
  /** Submit button label. */
  submitLabel: string;
  /** Forgot-password Button label. */
  forgotLabel: string;
  /** Remember-me Checkbox label. */
  rememberLabel: string;
  /** Footer prefix copy, ending with a space. */
  switchToSignupPrefix: string;
  /** Footer call-to-action that follows the prefix. */
  switchToSignupCta: string;
}

export const authCopy: AuthCopy = {
  heading: 'Welcome back',
  description: 'Sign in to your Studio Manfred account.',
  emailPlaceholder: 'you@studiomanfred.com',
  submitLabel: 'Sign in',
  forgotLabel: 'Forgot password?',
  rememberLabel: 'Remember me',
  switchToSignupPrefix: 'New to Studio Manfred? ',
  switchToSignupCta: 'Create account',
};

export interface AuthError {
  id: string;
  message: string;
}

export const authErrors: readonly AuthError[] = [
  { id: 'invalid-credentials', message: 'Incorrect email or password.' },
  { id: 'network', message: 'Network error — try again in a moment.' },
  { id: 'rate-limited', message: 'Too many attempts. Wait a minute and retry.' },
  { id: 'account-locked', message: 'Account locked. Contact your studio admin.' },
];

export interface SidePanelCopy {
  heading: string;
  tagline: string;
}

export const sidePanelCopy: SidePanelCopy = {
  heading: 'Mitt Intranat',
  tagline: 'Internal tools for the studio — projects, people, and data in one place.',
};
