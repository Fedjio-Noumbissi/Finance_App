import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { FormAlert } from '#/components/auth/AuthCard'
import { useAuth } from '#/lib/auth/context'
import {
  RequestTimeoutError,
  extractErrorMessage,
  withTimeout,
} from '#/lib/errors'

export function LogoutButton({ block = false }: { block?: boolean } = {}) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setPending(true)
    setError(null)

    try {
      await withTimeout(Promise.resolve(signOut()))
      await navigate({ to: '/login', replace: true })
    } catch (caught) {
      setError(
        caught instanceof RequestTimeoutError
          ? t('errors.timeout')
          : extractErrorMessage(caught, t('auth.logoutError')),
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${block ? 'items-stretch' : 'items-end'}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 ${
          block ? 'w-full py-2.5' : ''
        }`}
      >
        {pending ? t('auth.loggingOut') : t('nav.logout')}
      </button>
      {error ? <FormAlert message={error} /> : null}
    </div>
  )
}
