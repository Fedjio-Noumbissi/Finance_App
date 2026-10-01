import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { FormAlert } from '#/components/auth/AuthCard'
import { useCreateCategory } from '#/lib/categories/queries'
import {
  RequestTimeoutError,
  SessionNotReadyError,
  extractErrorMessage,
  withTimeout,
} from '#/lib/errors'

const PALETTE = [
  '#0f172a',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0d9488',
  '#0284c7',
]

export function CategoryCreateForm({ onCreated }: { onCreated?: () => void }) {
  const { t } = useTranslation()
  const create = useCreateCategory()
  const [nomFr, setNomFr] = useState('')
  const [nomEn, setNomEn] = useState('')
  const [couleur, setCouleur] = useState(PALETTE[0])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setSuccess(false)
    setPending(true)

    try {
      await withTimeout(create.mutateAsync({ nomFr, nomEn, couleur }))
      setNomFr('')
      setNomEn('')
      setSuccess(true)
      onCreated?.()
    } catch (cause) {
      setSuccess(false)
      setError(
        cause instanceof SessionNotReadyError
          ? t('errors.sessionNotReady')
          : cause instanceof RequestTimeoutError
            ? t('errors.timeout')
            : extractErrorMessage(cause, t('settings.category.createError')),
      )
    } finally {
      setPending(false)
    }
  }

  const invalid = nomFr.trim().length === 0 || nomEn.trim().length === 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            {t('settings.category.nameFr')}
          </span>
          <input
            value={nomFr}
            onChange={(event) => setNomFr(event.target.value)}
            maxLength={60}
            placeholder={t('settings.category.namePlaceholder')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            {t('settings.category.nameEn')}
          </span>
          <input
            value={nomEn}
            onChange={(event) => setNomEn(event.target.value)}
            maxLength={60}
            placeholder={t('settings.category.namePlaceholder')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-medium text-slate-600">
          {t('settings.category.color')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setCouleur(color)}
              aria-label={`${t('settings.category.color')} ${color}`}
              aria-pressed={couleur === color}
              style={{ backgroundColor: color }}
              className={`h-7 w-7 rounded-full border-2 transition ${
                couleur === color
                  ? 'border-slate-900 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
            />
          ))}
        </div>
      </fieldset>

      {error ? <FormAlert message={error} /> : null}
      {success ? (
        <p className="text-xs font-medium text-emerald-600" role="status">
          {t('settings.category.createSuccess')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || invalid}
        className="self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? t('common.saving') : t('settings.category.add')}
      </button>
    </form>
  )
}
