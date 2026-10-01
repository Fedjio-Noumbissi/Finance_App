import { useForm } from '@tanstack/react-form'
import { useId, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FormAlert, submitButtonClass } from '#/components/auth/AuthCard'
import { useDevise } from '#/lib/currency/store'
import {
  RequestTimeoutError,
  SessionNotReadyError,
  extractErrorMessage,
  withTimeout,
} from '#/lib/errors'
import { todayIso } from '#/lib/format'
import { useCategoryName } from '#/lib/i18n/useCategoryName'
import { useCreateTransaction, useUpdateTransaction } from '#/lib/transactions/queries'
import {
  validateTransaction,
  validateTransactionField,
  transactionTypeValues,
  type TransactionInput,
} from '#/lib/transactions/schema'
import type { TransactionWithCategory } from '#/lib/transactions/server'

export interface CategoryOption {
  id: string
  nomFr: string
  nomEn: string | null
}

interface TransactionFormProps {
  categories: CategoryOption[]
  transaction?: TransactionWithCategory | null
  onDone?: () => void
}

const emptyValues = (devise = 'XOF'): TransactionInput => ({
  montant: '',
  devise,
  type: 'depense',
  categorieId: '',
  date: todayIso(),
  note: '',
})

const fromTransaction = (
  transaction: TransactionWithCategory,
): TransactionInput => ({
  montant: Number(transaction.montant).toFixed(2),
  devise: transaction.deviseSaisie ?? transaction.devise,
  type: transaction.type,
  categorieId: transaction.categorie.id,
  date: transaction.date.slice(0, 10),
  note: transaction.note ?? '',
})

export function TransactionForm({
  categories,
  transaction,
  onDone,
}
: TransactionFormProps) {
  const { t } = useTranslation()
  const categoryName = useCategoryName()
  const { devise, currencies, formatMontantAvecCode } = useDevise()
  const isEdit = Boolean(transaction)

  const create = useCreateTransaction()
  const update = useUpdateTransaction()

  const amountRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const selectId = useId()
  const deviseId = useId()

  const form = useForm({
    defaultValues: transaction
      ? fromTransaction(transaction)
      : emptyValues(devise),
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      setSubmitting(true)

      const errors = validateTransaction(value)

      if (Object.keys(errors).length > 0) {
        setSubmitError(t('transaction.form.fixErrors'))
        return
      }

      try {
        if (transaction) {
          await withTimeout(update.mutateAsync({ ...value, id: transaction.id }))
        } else {
          await withTimeout(create.mutateAsync(value))
        }

        if (!transaction) {
          form.reset({
            ...emptyValues(value.devise),
            type: value.type,
            categorieId: value.categorieId,
            date: value.date,
          })
          amountRef.current?.focus()
        }

        onDone?.()
      } catch (error) {
        setSubmitError(
          error instanceof SessionNotReadyError
            ? t('errors.sessionNotReady')
            : error instanceof RequestTimeoutError
              ? t('errors.timeout')
              : extractErrorMessage(error, t('transaction.form.error')),
        )
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setAttempted(true)
        void form.handleSubmit()
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <form.Field
          name="montant"
          validators={{
            onChange: ({ value }) => validateTransactionField('montant', { montant: value }),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="montant"
              >
                {t('transaction.form.montant')}
              </label>
              <input
                id="montant"
                name="montant"
                ref={amountRef}
                autoFocus
                inputMode="decimal"
                placeholder={t('currency.placeholder')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-lg text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 ? (
                <FieldError messageKey={String(field.state.meta.errors[0])} />
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="devise"
          validators={{
            onChange: ({ value }) =>
              validateTransactionField('devise', { devise: value }),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor={deviseId}
              >
                {t('transaction.form.devise')}
              </label>
              <select
                id={deviseId}
                name="devise"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} — {categoryName({ nomFr: currency.nomFr, nomEn: currency.nomEn })}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {t('transaction.form.deviseHint', {
                  devise: field.state.value,
                  exemple: formatMontantAvecCode(100, field.state.value),
                })}
              </p>
              {field.state.meta.errors.length > 0 ? (
                <FieldError messageKey={String(field.state.meta.errors[0])} />
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <span className="text-sm font-medium text-slate-700">
                {t('transaction.form.type')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {transactionTypeValues.map((value) => (
                  <button
                    key={value}
                    type="button"
                    name="type"
                    aria-pressed={field.state.value === value}
                    onClick={() => field.handleChange(value)}
                    className={
                      field.state.value === value
                        ? value === 'revenu'
                          ? 'rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700'
                          : 'rounded-lg border border-rose-600 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700'
                        : 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400'
                    }
                  >
                    {t(`transaction.form.${value}` as const)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form.Field>

        <form.Field
          name="categorieId"
          validators={{
            onChange: ({ value }) =>
              validateTransactionField('categorieId', { categorieId: value }),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor={selectId}
              >
                {t('transaction.form.categorie')}
              </label>
              <select
                id={selectId}
                name="categorieId"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              >
                <option value="">{t('transaction.form.categoriePlaceholder')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryName(category)}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 ? (
                <FieldError messageKey={String(field.state.meta.errors[0])} />
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="date"
          validators={{
            onChange: ({ value }) => validateTransactionField('date', { date: value }),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="date">
                {t('transaction.form.date')}
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 ? (
                <FieldError messageKey={String(field.state.meta.errors[0])} />
              ) : null}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="note">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="note">
              {t('transaction.form.note')}
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder={t('transaction.form.notePlaceholder')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              value={field.state.value ?? ''}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isValid}>
        {(isValid) =>
          attempted && !isValid ? (
            <div className="mb-3">
              <FormAlert message={t('transaction.form.fixErrors')} />
            </div>
          ) : null
        }
      </form.Subscribe>

      {submitError ? <FormAlert message={submitError} /> : null}

      <div className="flex items-center gap-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              className={submitButtonClass}
              type="submit"
              disabled={isSubmitting || submitting}
            >
              {isSubmitting || submitting
                ? t('transaction.form.saving')
                : isEdit
                  ? t('transaction.form.saveEdit')
                  : t('transaction.form.submit')}
            </button>
          )}
        </form.Subscribe>
        {onDone ? (
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            type="button"
            onClick={onDone}
          >
            {t('transaction.form.cancel')}
          </button>
        ) : null}
      </div>
    </form>
  )
}

function FieldError({ messageKey }: { messageKey: string }) {
  const { t } = useTranslation()

  return <p className="text-xs text-red-600">{t(messageKey)}</p>
}