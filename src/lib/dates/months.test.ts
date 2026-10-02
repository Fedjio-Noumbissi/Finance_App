import { describe, expect, it } from 'vitest'

import {
  MONTH_KEY_PATTERN,
  currentMonthKey,
  isMonthKey,
  listMonthKeys,
  shiftMonthKey,
} from './months'

describe('isMonthKey', () => {
  it('accepte les mois ISO', () => {
    expect(isMonthKey('2026-01')).toBe(true)
    expect(isMonthKey('2026-12')).toBe(true)
    expect(MONTH_KEY_PATTERN.test('2026-00')).toBe(false)
    expect(MONTH_KEY_PATTERN.test('2026-13')).toBe(false)
  })

  it('refuse tout le reste', () => {
    expect(isMonthKey('2026-1')).toBe(false)
    expect(isMonthKey('26-01')).toBe(false)
    expect(isMonthKey('')).toBe(false)
    expect(isMonthKey(null)).toBe(false)
    expect(isMonthKey(202601)).toBe(false)
  })
})

describe('shiftMonthKey', () => {
  it('avance et recule sur les bornes d annee', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12')
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01')
    expect(shiftMonthKey('2026-06', 6)).toBe('2026-12')
    expect(shiftMonthKey('2026-06', -6)).toBe('2025-12')
  })

  it('renvoie toujours un mois valide', () => {
    for (let delta = -30; delta <= 30; delta++) {
      expect(isMonthKey(shiftMonthKey('2026-02', delta))).toBe(true)
    }
  })

  it('ne depend pas du fuseau du poste', () => {
    expect(shiftMonthKey('2026-03', 1)).toBe('2026-04')
  })
})

describe('currentMonthKey', () => {
  it('ancre le mois sur Africa/Abidjan (UTC+0, sans heure d ete)', () => {
    // Abidjan est en UTC permanent : le dernier jour du mois a 23:30 UTC reste
    // dans le mois courant, ce qui evite le decalage du 1er jour a 00:00.
    expect(currentMonthKey(new Date('2026-01-31T23:30:00Z'))).toBe('2026-01')
    expect(currentMonthKey(new Date('2026-01-01T00:30:00Z'))).toBe('2026-01')
  })

  it('change de mois au 1er du mois', () => {
    expect(currentMonthKey(new Date('2026-02-01T00:00:00Z'))).toBe('2026-02')
  })
})

describe('listMonthKeys', () => {
  const months = listMonthKeys(12, new Date('2026-05-20T12:00:00Z'))

  it('renvoie le mois courant en dernier', () => {
    expect(months).toHaveLength(12)
    expect(months.at(-1)).toBe('2026-05')
  })

  it('remonte l annee precedente', () => {
    expect(months[0]).toBe('2025-06')
    expect(months).toContain('2026-01')
    expect(months.every(isMonthKey)).toBe(true)
  })
})