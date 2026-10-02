import { describe, expect, it } from 'vitest'

import {
  CURRENCIES,
  CURRENCY_CODES,
  DEVISE_BASE,
  buildTauxMap,
  convertMontant,
  formatTaux,
  getCurrencyDefinition,
  isSupportedCurrency,
  roundCurrency,
} from './catalogue'

describe('catalogue', () => {
  it('a une devise de base et des codes uniques', () => {
    expect(DEVISE_BASE).toBe('XOF')
    expect(new Set(CURRENCY_CODES).size).toBe(CURRENCY_CODES.length)
    expect(CURRENCY_CODES).toContain('XOF')
    expect(CURRENCY_CODES).toContain('EUR')
    expect(CURRENCY_CODES).toContain('USD')
  })

  it('donne un nom FR et EN a chaque devise', () => {
    for (const devise of CURRENCIES) {
      expect(devise.nomFr.length).toBeGreaterThan(0)
      expect(devise.nomEn.length).toBeGreaterThan(0)
      expect(devise.tauxVersXof).toBeGreaterThan(0)
      expect(devise.decimales).toBeGreaterThanOrEqual(0)
    }
  })

  it('retombe sur la devise de base pour un code inconnu', () => {
    expect(getCurrencyDefinition('ZZZ').code).toBe(DEVISE_BASE)
    expect(isSupportedCurrency('ZZZ')).toBe(false)
    expect(isSupportedCurrency('EUR')).toBe(true)
  })
})

describe('buildTauxMap', () => {
  it('utilise le catalogue par defaut', () => {
    const taux = buildTauxMap()
    expect(taux.XOF).toBe(1)
    expect(Object.keys(taux)).toHaveLength(CURRENCIES.length)
  })

  it('applique les surcharges valides', () => {
    const taux = buildTauxMap({ USD: 600, EUR: 655.957 })
    expect(taux.USD).toBe(600)
    expect(taux.EUR).toBeCloseTo(655.957, 3)
  })

  it('ignore les surcharges invalides', () => {
    const defaut = buildTauxMap()
    const taux = buildTauxMap({ USD: 0, EUR: -5, GBP: Number.NaN })
    expect(taux.USD).toBe(defaut.USD)
    expect(taux.EUR).toBe(defaut.EUR)
    expect(taux.GBP).toBe(defaut.GBP)
  })
})

describe('roundCurrency', () => {
  it('respecte le nombre de decimales de la devise', () => {
    expect(roundCurrency(100.005, 'XOF')).toBe(100) // franc CFA sans centime
    expect(roundCurrency(100.005, 'XAF')).toBe(100)
    expect(roundCurrency(100.005, 'EUR')).toBe(100.01)
    expect(roundCurrency(1.005, 'JPY')).toBe(1)
    expect(roundCurrency(123.4567, 'USD')).toBe(123.46)
  })

  it('aligne le catalogue sur la base pour les deux francs CFA', () => {
    expect(getCurrencyDefinition('XOF').decimales).toBe(0)
    expect(getCurrencyDefinition('XAF').decimales).toBe(0)
  })
})

describe('convertMontant', () => {
  const taux = buildTauxMap({ USD: 600, EUR: 655.957 })

  it('convertit via la devise de base', () => {
    // 100 USD = 60 000 XOF = 60 000 / 1 (XAF) => 60 000
    expect(convertMontant(100, 'USD', 'XAF', taux)).toBe(60000)
    // aller-retour : on retrouve le montant de depart
    expect(convertMontant(convertMontant(100, 'USD', 'EUR', taux), 'EUR', 'USD', taux)).toBe(100)
  })

  it('est neutre pour une devise identique', () => {
    expect(convertMontant(1234.56, 'EUR', 'EUR', taux)).toBe(1234.56)
  })

  it('arrondit a la devise cible', () => {
    // 100 XOF ≈ 0,17 USD (arrondi a 2 decimales)
    expect(convertMontant(100, 'XOF', 'USD', taux)).toBe(0.17)
    expect(convertMontant(100, 'XOF', 'EUR', taux)).toBe(0.15)
    // yen : 100 XOF / 3,9 = 25,6 yen, arrondi a l unite
    expect(convertMontant(100, 'XOF', 'JPY', taux)).toBe(26)
  })

  it('retombe sur un taux de 1 si la devise est absente de la carte', () => {
    expect(convertMontant(100, 'ZZZ', 'XOF', taux)).toBe(100)
  })
})

describe('formatTaux', () => {
  it('formate en francais sans zéros inutiles', () => {
    expect(formatTaux(1)).toBe('1')
    expect(formatTaux(655.957)).toBe('655,957')
  })
})