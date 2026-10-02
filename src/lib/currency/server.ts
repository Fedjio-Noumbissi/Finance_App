import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { requireUserId } from '#/lib/auth/session'
import { db } from '#/lib/db'
import { currencies, users } from '#/lib/db/schema'

import {
  CURRENCIES,
  DEVISE_BASE,
  getCurrencyDefinition,
  isSupportedCurrency,
  type TauxMap,
} from './catalogue'
import { loadUserCurrency } from './guards'

export interface CurrencyRow {
  code: string
  nomFr: string
  nomEn: string
  decimales: number
  tauxVersXof: number
}

export interface CurrencyList {
  devise: string
  deviseParDefaut: string
  taux: TauxMap
  deviseMiseAJour: string | null
  deviseEtrangere: boolean
  currencies: CurrencyRow[]
}

export const listCurrencies = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrencyList> => {
    // La liste des devises alimente aussi l'en-tete des pages publiques :
    // aucune session n'est requise, la devise de base sert alors de defaut.
    const { devise, taux } = await loadUserCurrency()

    const rows = await db
      .select({
        code: currencies.code,
        nomFr: currencies.nomFr,
        nomEn: currencies.nomEn,
        decimales: currencies.decimales,
        tauxVersXof: currencies.tauxVersXof,
        misAJour: currencies.misAJour,
      })
      .from(currencies)

    const known = new Map(rows.map((row) => [row.code, row]))

    // Le catalogue embarqué est la source de vérité pour la liste complète :
    // elle reste disponible même si la table n'a pas été alimentée.
    const list: CurrencyRow[] = CURRENCIES.map((definition) => {
      const row = known.get(definition.code)

      return {
        code: definition.code,
        nomFr: row?.nomFr ?? definition.nomFr,
        nomEn: row?.nomEn ?? definition.nomEn,
        decimales: row?.decimales ?? definition.decimales,
        tauxVersXof: taux[definition.code] ?? definition.tauxVersXof,
      }
    })

    for (const [code, row] of known) {
      if (!isSupportedCurrency(code)) {
        list.push({
          code: row.code,
          nomFr: row.nomFr,
          nomEn: row.nomEn,
          decimales: row.decimales,
          tauxVersXof: Number(row.tauxVersXof),
        })
      }
    }

    const current = known.get(devise)

    return {
      devise,
      deviseParDefaut: DEVISE_BASE,
      taux,
      deviseMiseAJour: current ? current.misAJour.toISOString() : null,
      deviseEtrangere: devise !== DEVISE_BASE,
      currencies: list,
    }
  },
)

const rateSchema = z.object({
  code: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'validation.currencyInvalid'),
  taux: z
    .number({ error: 'validation.rateRequired' })
    .positive('validation.ratePositive')
    .max(1_000_000, 'validation.rateTooHigh'),
})

export const updateCurrencyRate = createServerFn({ method: 'POST' })
  .validator((input: unknown) => rateSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireUserId()

    if (data.code === DEVISE_BASE && data.taux !== 1) {
      throw new Error('Le franc CFA (XOF) est la devise de référence (taux = 1).')
    }

    const definition = getCurrencyDefinition(data.code)
    const values = {
      nomFr: definition.nomFr,
      nomEn: definition.nomEn,
      decimales: definition.decimales,
      tauxVersXof: data.taux.toFixed(8),
      misAJour: new Date(),
    }

    const [existing] = await db
      .select({ code: currencies.code })
      .from(currencies)
      .where(eq(currencies.code, data.code))
      .limit(1)

    if (existing) {
      await db
        .update(currencies)
        .set({ tauxVersXof: values.tauxVersXof, misAJour: values.misAJour })
        .where(eq(currencies.code, data.code))
    } else {
      await db.insert(currencies).values({ code: data.code, ...values })
    }

    return { ok: true }
  })

const preferenceSchema = z.object({
  devise: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'validation.currencyInvalid'),
})

export const updatePreferredCurrency = createServerFn({ method: 'POST' })
  .validator((input: unknown) => preferenceSchema.parse(input))
  .handler(async ({ data }): Promise<{ devise: string }> => {
    const userId = await requireUserId()

    if (!isSupportedCurrency(data.devise)) {
      throw new Error('Devise non prise en charge.')
    }

    await db
      .update(users)
      .set({ devisePreferee: data.devise })
      .where(eq(users.id, userId))

    return { devise: data.devise }
  })
