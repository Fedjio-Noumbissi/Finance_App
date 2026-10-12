import { afterEach, describe, expect, it } from 'vitest'

import { doitEtreAdmin } from './admin'

const initial = process.env.ADMIN_EMAIL

afterEach(() => {
  if (initial === undefined) {
    delete process.env.ADMIN_EMAIL
  } else {
    process.env.ADMIN_EMAIL = initial
  }
})

describe('promotion admin par variable d environnement', () => {
  it('refuse tout le monde quand ADMIN_EMAIL est absent ou vide', () => {
    delete process.env.ADMIN_EMAIL
    expect(doitEtreAdmin('fedjio@gmail.com')).toBe(false)

    process.env.ADMIN_EMAIL = '   '
    expect(doitEtreAdmin('fedjio@gmail.com')).toBe(false)
  })

  it('accepte uniquement l adresse configuree', () => {
    process.env.ADMIN_EMAIL = 'fedjio@gmail.com'

    expect(doitEtreAdmin('fedjio@gmail.com')).toBe(true)
    expect(doitEtreAdmin('autre@gmail.com')).toBe(false)
    expect(doitEtreAdmin(null)).toBe(false)
    expect(doitEtreAdmin(undefined)).toBe(false)
    expect(doitEtreAdmin('')).toBe(false)
  })

  it('ignore la casse et les espaces autour des deux valeurs', () => {
    process.env.ADMIN_EMAIL = '  Fedjio@Gmail.COM '

    expect(doitEtreAdmin('fedjio@gmail.com')).toBe(true)
    expect(doitEtreAdmin('  FEDJIO@gmail.com  ')).toBe(true)
  })
})
