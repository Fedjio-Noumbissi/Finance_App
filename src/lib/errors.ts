const GENERIC_MESSAGES = new Set([
  'internal server error',
  'server function error',
  'unknown error',
  'failed to fetch',
  'network error',
  'load failed',
])

/**
 * Les server functions TanStack Start sérialisent leurs erreurs ; le message
 * utilisateur peut être imbriqué dans un JSON. On tente de le récupérer, sinon
 * on renvoie le texte de repli traduit.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (!(error instanceof Error)) {
    return fallback
  }

  const raw = error.message?.trim() ?? ''

  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(raw)
      const candidate =
        typeof parsed === 'object' && parsed !== null && 'message' in parsed
          ? String((parsed as { message: unknown }).message)
          : ''

      if (candidate) return candidate
    } catch {
      return fallback
    }
  }

  if (!raw || GENERIC_MESSAGES.has(raw.toLowerCase())) {
    return fallback
  }

  return raw
}

export const REQUEST_TIMEOUT_MS = 20_000

/**
 * La session serveur (cookie) n'est pas encore prete : la mutation est
 * envoyee trop tot, juste apres la connexion par exemple.
 */
export class SessionNotReadyError extends Error {
  constructor() {
    super('session-not-ready')
  }
}

export class RequestTimeoutError extends Error {
  constructor() {
    super('request-timeout')
  }
}

/**
 * Une requête serveur bloquée (réseau coupé, indisponibilité) laisserait le
 * formulaire en attente indéfinie. On borne l'attente pour toujours rendre la
 * main à l'utilisateur avec un message d'erreur.
 */
export function withTimeout<T>(promise: Promise<T>, ms = REQUEST_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new RequestTimeoutError()), ms)
    }),
  ])
}
