import { useTranslation } from 'react-i18next'
import { EmptyState } from '#/components/ui/EmptyState'
import { Sparkles } from 'lucide-react'

export function FirstRunBanner() {
  const { t } = useTranslation()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <EmptyState
        icon={<Sparkles className="size-5" strokeWidth={1.75} />}
        title={t('onboarding.firstRunTitle')}
        description={t('onboarding.firstRunDescription')}
        actionLabel={t('onboarding.firstRunAction')}
        to="/transactions?quick=1"
      />
    </section>
  )
}
