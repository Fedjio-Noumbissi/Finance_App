import { useTranslation } from 'react-i18next'

import { isFirebaseConfigured } from '#/lib/firebase'

export function FormAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  )
}

export function FirebaseMissingNotice() {
  const { t } = useTranslation()

  if (isFirebaseConfigured()) {
    return null
  }

  return <FormAlert message={t('auth.firebaseMissing')} />
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </div>
  )
}

export const submitButtonClass =
  'w-full rounded-lg bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
