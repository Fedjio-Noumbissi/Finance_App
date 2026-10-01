import { useTranslation } from 'react-i18next'
import { FormAlert } from '#/components/auth/AuthCard'
import { useCategories } from '#/lib/categories/queries'
import { useLanguageState } from '#/lib/i18n/useLanguage'
import { extractErrorMessage } from '#/lib/errors'

import { CategoryCreateForm } from './CategoryCreateForm'
import { CategoryRow } from './CategoryRow'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

export function SettingsPanels() {
  const { t } = useTranslation()
  const categories = useCategories()
  const { language, user } = useLanguageState()

  const data = categories.data ?? []
  const defaultCategories = data.filter((category) => category.isDefault)
  const customCategories = data.filter((category) => !category.isDefault)

  return (
    <div className="flex flex-col gap-4">
      <Section title={t('settings.account.title')}>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-slate-500">{t('settings.account.email')}</dt>
            <dd className="font-medium break-all text-slate-800">
              {user?.email ?? t('settings.account.unknownEmail')}
            </dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-slate-500">{t('settings.account.language')}</dt>
            <dd className="font-medium text-slate-800">
              {t(`language.${language}`)}
            </dd>
          </div>
        </dl>
      </Section>

      <Section
        title={t('settings.categories.title')}
        description={t('settings.categories.description')}
      >
        {categories.isPending ? (
          <ul className="flex flex-col gap-2" aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <li
                key={index}
                className="h-8 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </ul>
        ) : categories.isError ? (
          <FormAlert
            message={extractErrorMessage(
              categories.error,
              t('settings.categories.loadError'),
            )}
          />
        ) : (
          <ul className="flex flex-col">
            {defaultCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t('settings.categories.custom')}
          </h3>

          {categories.isPending ? null : categories.isError ? null : (
            <ul className="flex flex-col">
              {customCategories.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </ul>
          )}

          {categories.isPending || categories.isError ? null : customCategories.length === 0 ? (
            <p className="mb-3 text-xs text-slate-400">
              {t('settings.categories.empty')}
            </p>
          ) : null}

          <CategoryCreateForm />
        </div>
      </Section>
    </div>
  )
}
