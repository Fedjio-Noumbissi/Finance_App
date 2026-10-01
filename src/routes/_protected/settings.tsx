import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { SettingsPanels } from '#/components/settings/SettingsPanels'

export const Route = createFileRoute('/_protected/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('settings.subtitle')}</p>
      </header>

      <SettingsPanels />
    </main>
  )
}
