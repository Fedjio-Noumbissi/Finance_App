import { describe, expect, it } from 'vitest'

import {
  dayKey,
  isValidPath,
  sanitizeSource,
  startOfWindow,
} from './utils'

describe('isValidPath', () => {
  it('accepte les chemins internes du site', () => {
    for (const path of ['/', '/login', '/_protected/dashboard', '/a?b=1&c=2']) {
      expect(isValidPath(path)).toBe(true)
    }
  })

  it('refuse ce qui sort du site', () => {
    for (const path of [
      '/admin\n/x',
      'javascript:alert(1)',
      '//evil.example',
      '/x'.repeat(201),
    ]) {
      expect(isValidPath(path)).toBe(false)
    }
  })
})

describe('sanitizeSource', () => {
  it('garde les URL http(s)', () => {
    expect(sanitizeSource('https://news.example/a')).toBe('https://news.example/a')
    expect(sanitizeSource('http://news.example')).toBe('http://news.example')
  })

  it('ecarte tout le reste', () => {
    expect(sanitizeSource(null)).toBeNull()
    expect(sanitizeSource(undefined)).toBeNull()
    expect(sanitizeSource('')).toBeNull()
    expect(sanitizeSource('javascript:alert(1)')).toBeNull()
    expect(sanitizeSource('data:text/html,<script>')).toBeNull()
  })

  it('tronque a 200 caracteres', () => {
    const long = `https://example.com/${'a'.repeat(400)}`
    expect(sanitizeSource(long)).toHaveLength(200)
  })
})

describe('dayKey', () => {
  it('retourne le jour ISO', () => {
    expect(dayKey(new Date('2026-02-03T10:20:30Z'))).toBe('2026-02-03')
  })
})

describe('startOfWindow', () => {
  it('revient de N-1 jours a minuit UTC', () => {
    const debut = startOfWindow(7)
    const aujourdhui = new Date()
    aujourdhui.setUTCHours(0, 0, 0, 0)

    expect(debut.getTime()).toBe(aujourdhui.getTime() - 6 * 86_400_000)
    expect(debut.getUTCHours()).toBe(0)
    expect(debut.getUTCMinutes()).toBe(0)
  })
})