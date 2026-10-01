import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

import { AuthCard, FirebaseMissingNotice, FormAlert, submitButtonClass } from './AuthCard'
import { useTranslation } from 'react-i18next'
import { TextField } from '#/components/ui/TextField'
import { useAuth } from '#/lib/auth/context'
import { safeRedirectPath } from '#/lib/auth/guard'

export function LoginForm({ redirect }
: { redirect?: string }) {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setPending(true)

    try {
      await signIn(email, password)
      await navigate({ to: safeRedirectPath(redirect) })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('authError.generic'))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title={t('auth.welcomeTitle')} subtitle={t('auth.welcomeSubtitle')}>
      <FirebaseMissingNotice />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          label={t('auth.email')}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <TextField
          label={t('auth.password')}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? <FormAlert message={error} /> : null}

        <button className={submitButtonClass} type="submit" disabled={pending}>
          {pending ? t('auth.signingIn') : t('auth.submitLogin')}
        </button>
      </form>

      <p className="text-sm text-slate-500">
        {t('auth.noAccount')}{' '}
        <Link
          className="font-medium text-slate-900 underline"
          to="/signup"
        >
          {t('nav.signup')}
        </Link>
      </p>
    </AuthCard>
  )
}