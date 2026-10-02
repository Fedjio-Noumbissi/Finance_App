import { Coins, Globe2, Tags, UserRound, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormAlert } from '#/components/auth/AuthCard'
import { useCategories } from '#/lib/categories/queries'
import { useLanguageState } from '#/lib/i18n/useLanguage'
import { extractErrorMessage } from '#/lib/errors'

import { CategoryCreateForm } from './CategoryCreateForm'
import { CurrencyPanel } from './CurrencyPanel'
import { CategoryRow } from './CategoryRow'

function Section({
  title,
  description,
  icon: Icone,
  children,
}: {
  title: string
  description?: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icone aria-hidden className="size-4" strokeWidth={1.9} />
        </span>
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  )
}

function initials(email: string | null): string {
  if (!email) {
    return '?'
  }

  return email.slice(0, 2).toUpperCase()
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
      <Section title={t('settings.account.title')} icon={UserRound}>
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white"
          >
            {initials(user?.email ?? null)}
          </span>

          <dl className="flex min-w-0 flex-col gap-1.5 text-sm">
            <dd className="truncate font-medium text-slate-900">
              {user?.email ?? t('settings.account.unknownEmail')}
            </dd>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Globe2 aria-hidden className="size-3.5" strokeWidth={1.9} />
              {t(`language.${language}`)}
            </div>
          </dl>
        </div>
      </Section>

      <Section
        title={t('settings.currency.title')}
        description={t('settings.currency.description')}
        icon={Coins}
      >
        <CurrencyPanel />
      </Section>

      <Section
        title={t('settings.categories.title')}
        description={t('settings.categories.description')}
        icon={Tags}
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
