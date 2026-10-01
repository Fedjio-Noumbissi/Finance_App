import { z } from 'zod'

import type { TransactionType } from '#/lib/db/schema'

export const transactionTypeValues: TransactionType[] = ['revenu', 'depense']

export interface TransactionFormValues {
  montant: string
  devise: string
  type: TransactionType
  categorieId: string
  date: string
  note: string
}

export type TransactionInput = TransactionFormValues

export interface TransactionUpdateInput extends TransactionFormValues {
  id: string
}

const montantSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')

    return cleaned === '' ? Number.NaN : Number(cleaned)
  },
  z
    .number({ error: 'validation.montantRequired' })
    .positive('validation.montantPositive')
    .max(99_999_999, 'validation.montantTooHigh'),
)

export const deviseSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'validation.deviseRequired')

export const transactionSchema = z.object({
  montant: montantSchema,
  devise: deviseSchema.default('XOF'),
  type: z.enum(['revenu', 'depense'], { error: 'validation.typeInvalid' }),
  categorieId: z.uuid('validation.categorieRequired'),
  date: z.iso.date('validation.dateInvalid'),
  note: z
    .string()
    .max(280, 'validation.noteTooLong')
    .optional(),
})

export const transactionUpdateSchema = transactionSchema.extend({
  id: z.uuid('validation.idInvalid'),
})

export const transactionFiltersSchema = z.object({
  categorieId: z.uuid().nullable().default(null),
  du: z.iso.date().nullable().default(null),
  au: z.iso.date().nullable().default(null),
})

export const transactionIdSchema = z.uuid('Identifiant invalide.')

export type TransactionFilters = z.input<typeof transactionFiltersSchema>

export type TransactionField = keyof TransactionFormValues

export type FieldErrors = Partial<Record<TransactionField, string>>

export function validateTransaction(
  values: Partial<TransactionFormValues>,
): FieldErrors {
  const result = transactionSchema.safeParse(values)

  if (result.success) {
    return {}
  }

  const errors: FieldErrors = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (typeof field === 'string' && !(field in errors)) {
      errors[field as TransactionField] = issue.message
    }
  }

  return errors
}

export function validateTransactionField(
  field: TransactionField,
  values: Partial<TransactionFormValues>,
): string | undefined {
  return validateTransaction(values)[field]
}