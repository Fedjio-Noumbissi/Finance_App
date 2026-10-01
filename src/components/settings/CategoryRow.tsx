import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { FormAlert } from '#/components/auth/AuthCard'
import { useDeleteCategory, useUpdateCategory } from '#/lib/categories/queries'
import type { CategoryItem } from '#/lib/categories/server'
import {
  RequestTimeoutError,
  extractErrorMessage,
  withTimeout,
} from '#/lib/errors'
import { useCategoryName } from '#/lib/i18n/useCategoryName'

interface CategoryRowProps {
  category: CategoryItem
}

export function CategoryRow({ category }: CategoryRowProps) {
  const { t } = useTranslation()
  const categoryName = useCategoryName()
  const update = useUpdateCategory()
  const remove = useDeleteCategory()

  const [editing, setEditing] = useState(false)
  const [nomFr, setNomFr] = useState(category.nomFr)
  const [nomEn, setNomEn] = useState(category.nomEn)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEdit() {
    setNomFr(category.nomFr)
    setNomEn(category.nomEn)
    setError(null)
    setEditing(true)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setSaving(true)

    try {
      await withTimeout(update.mutateAsync({ id: category.id, nomFr, nomEn }))
      setEditing(false)
    } catch (cause) {
      setError(
        cause instanceof RequestTimeoutError
          ? t('errors.timeout')
          : extractErrorMessage(cause, t('settings.category.renameError')),
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setError(null)
    setDeleting(true)

    try {
      await withTimeout(remove.mutateAsync(category.id))
      setConfirming(false)
    } catch (cause) {
      setConfirming(false)
      setError(
        cause instanceof RequestTimeoutError
          ? t('errors.timeout')
          : extractErrorMessage(cause, t('settings.category.deleteError')),
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <li className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-b-0">
      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={nomFr}
              onChange={(event) => setNomFr(event.target.value)}
              maxLength={60}
              aria-label={t('settings.category.nameFr')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
            <input
              value={nomEn}
              onChange={(event) => setNomEn(event.target.value)}
              maxLength={60}
              aria-label={t('settings.category.nameEn')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          {error ? <FormAlert message={error} /> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || nomFr.trim() === '' || nomEn.trim() === ''}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full ring-1 ring-slate-200"
              style={{ backgroundColor: category.couleur ?? '#94a3b8' }}
            />
            <span className="truncate text-sm font-medium text-slate-800">
              {categoryName(category)}
            </span>
            {category.isDefault ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-500">
                {t('settings.category.defaultBadge')}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-1">
            {category.isDefault ? (
              <span
                className="px-2 py-1 text-xs text-slate-400"
                title={t('settings.category.defaultLockedHint')}
              >
                {t('settings.category.defaultLocked')}
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {t('common.edit')}
                </button>
                {confirming ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-500 disabled:opacity-60"
                    >
                      {deleting
                        ? t('common.deleting')
                        : t('settings.category.confirmDelete')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      {t('common.cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    {t('common.delete')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!editing && error ? <FormAlert message={error} /> : null}
    </li>
  )
}
