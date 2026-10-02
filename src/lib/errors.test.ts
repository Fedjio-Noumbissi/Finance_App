import { describe, expect, it } from 'vitest'

import { extractErrorMessage, withTimeout } from './errors'

const FALLBACK = 'Texte de repli'

describe('extractErrorMessage', () => {
  it('renvoie le message utile dune erreur', () => {
    expect(extractErrorMessage(new Error('Mot de passe incorrect'), FALLBACK)).toBe(
      'Mot de passe incorrect',
    )
  })

  it('recupere le message imbrique dans le JSON des server functions', () => {
    const serialisee = new Error(
      JSON.stringify({ message: 'Session expirée', status: 401 }),
    )

    expect(extractErrorMessage(serialisee, FALLBACK)).toBe('Session expirée')
  })

  it('remplace les messages generiques et les erreurs inconnues', () => {
    for (const message of [
      'Internal Server Error',
      'failed to fetch',
      'SERVER FUNCTION ERROR',
      '',
    ]) {
      expect(extractErrorMessage(new Error(message), FALLBACK)).toBe(FALLBACK)
    }

    expect(extractErrorMessage(null, FALLBACK)).toBe(FALLBACK)
    expect(extractErrorMessage(undefined, FALLBACK)).toBe(FALLBACK)
    expect(extractErrorMessage({ message: 'objet' }, FALLBACK)).toBe(FALLBACK)
  })

  it('accepte une chaine directe', () => {
    expect(extractErrorMessage('Message direct', FALLBACK)).toBe('Message direct')
  })

  it('remplace une chaine vide', () => {
    expect(extractErrorMessage('   ', FALLBACK)).toBe(FALLBACK)
  })

  it('remplace un JSON invalide ou sans message', () => {
    expect(extractErrorMessage(new Error('{pas du json'), FALLBACK)).toBe(FALLBACK)
    expect(extractErrorMessage(new Error('{"autre":1}'), FALLBACK)).toBe(FALLBACK)
  })
})

describe('withTimeout', () => {
  it('laisse passer une promesse qui aboutit', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok')
  })

  it('rejete quand la promesse depasse le delai', async () => {
    const lente = new Promise((resolve) => setTimeout(resolve, 200))
    await expect(withTimeout(lente, 20)).rejects.toThrow()
  })
})