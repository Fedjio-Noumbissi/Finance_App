import { z } from 'zod/v4'

const nomSchema = z
  .string()
  .trim()
  .min(1, 'validation.required')
  .max(60, 'settings.category.nameTooLong')

export const categoryCreateSchema = z.object({
  nomFr: nomSchema,
  nomEn: nomSchema,
  couleur: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'settings.category.colorInvalid')
    .optional(),
})

export const categoryUpdateSchema = z.object({
  id: z.uuid('validation.invalidId'),
  nomFr: nomSchema,
  nomEn: nomSchema,
})

export const categoryDeleteSchema = z.object({
  id: z.uuid('validation.invalidId'),
})

export type CategoryFormValues = z.input<typeof categoryCreateSchema>
export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>
