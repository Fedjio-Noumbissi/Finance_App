import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useAuth } from '#/lib/auth/context'

const STEPS = ['welcome', 'categories', 'firstTransaction', 'done'] as const

type Step = (typeof STEPS)[number]

const STEP_ICONS: Record<Step, string> = {
  welcome: '👋',
  categories: '🏷️',
  firstTransaction: '🧾',
  done: '🎉',
}

export function OnboardingFlow() {
  const { t } = useTranslation()
  const { profile, sessionReady, markOnboardingDone } = useAuth()
  const [step, setStep] = useState<Step>('welcome')
  const [closing, setClosing] = useState(false)

  const isOpen = Boolean(sessionReady && profile && !profile.onboardingTerminee)

  const finish = useCallback(async () => {
    setClosing(true)

    try {
      await markOnboardingDone()
    } catch {
      setClosing(false)
    }
  }, [markOnboardingDone])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        void finish()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, finish])

  if (!isOpen) {
    return null
  }

  const index = STEPS.indexOf(step)
  const isLast = index === STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span aria-hidden className="text-3xl">
            {STEP_ICONS[step]}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {`${index + 1} / ${STEPS.length}`}
          </span>
        </div>

        <h2
          id="onboarding-title"
          className="text-lg font-semibold text-slate-900"
        >
          {t(`onboarding.${step}Title`)}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t(`onboarding.${step}Body`)}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            onClick={() => void finish()}
            disabled={closing}
          >
            {t('onboarding.skip')}
          </button>

          <div className="flex items-center gap-2">
            {index > 0 && !isLast ? (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={() => setStep(STEPS[index - 1] ?? 'welcome')}
                disabled={closing}
              >
                {t('onboarding.back')}
              </button>
            ) : null}

            {isLast ? (
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                onClick={() => void finish()}
                disabled={closing}
              >
                {t('onboarding.start')}
              </button>
            ) : (
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
                onClick={() => setStep(STEPS[index + 1] ?? 'done')}
                disabled={closing}
              >
                {t('onboarding.next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
