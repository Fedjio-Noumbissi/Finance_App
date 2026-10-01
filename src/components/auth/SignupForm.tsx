import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

import { AuthCard, FirebaseMissingNotice, FormAlert, submitButtonClass } from './AuthCard'
import { useTranslation } from 'react-i18next'
import { TextField } from '#/components/ui/TextField'
import { useAuth } from '#/lib/auth/context'

export function SignupForm() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setPending(true)

    try {
      await signUp({ email, password, passwordConfirmation })
      await navigate({ to: '/dashboard' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('authError.generic'))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title={t('auth.signupTitle')} subtitle={t('auth.signupSubtitle')}>
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
          autoComplete="new-password"
          required
          minLength={6}
          hint={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <TextField
          label={t('auth.passwordConfirmation')}
          type="password"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          minLength={6}
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
        />

        {error ? <FormAlert message={error} /> : null}

        <button className={submitButtonClass} type="submit" disabled={pending}>
          {pending ? t('auth.signingUp') : t('auth.submitSignup')}
        </button>
      </form>

      <p className="text-sm text-slate-500">
        {t('auth.haveAccount')}{' '}
        <Link className="font-medium text-slate-900 underline" to="/login">
          {t('nav.login')}
        </Link>
      </p>
    </AuthCard>
  )
}
