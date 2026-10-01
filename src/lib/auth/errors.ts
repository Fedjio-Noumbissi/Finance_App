import { i18n } from '#/i18n'

const errorKeys: Record<string, string> = {
  'auth/invalid-email': 'authError.invalidEmail',
  'auth/email-already-in-use': 'authError.emailInUse',
  'auth/weak-password': 'authError.weakPassword',
  'auth/invalid-credential': 'authError.invalidCredentials',
  'auth/invalid-login-credentials': 'authError.invalidCredentials',
  'auth/wrong-password': 'authError.invalidCredentials',
  'auth/user-not-found': 'authError.invalidCredentials',
  'auth/too-many-requests': 'authError.tooManyRequests',
  'auth/network-request-failed': 'authError.network',
  'auth/operation-not-allowed': 'authError.operationNotAllowed',
  'auth/user-disabled': 'authError.userDisabled',
}

export class AuthError extends Error {}

export function authErrorKey(error: unknown): string {
  if (error instanceof AuthError) {
    return error.message
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : ''

  return errorKeys[code] ?? 'authError.generic'
}

export function toAuthError(error: unknown): AuthError {
  return new AuthError(i18n.t(authErrorKey(error)))
}
