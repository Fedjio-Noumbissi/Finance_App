import { Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Gabarit des pages de connexion et d'inscription : seule la saisie est
 * affichee, le formulaire reste le point focal et le lien de retour vers
 * l'accueil occupe le haut de l'ecran.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link
        className="mb-6 flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold tracking-tight text-slate-900"
        to="/"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Sparkles aria-hidden className="size-4" strokeWidth={2} />
        </span>
        {t('appName')}
      </Link>

      <div className="flex w-full justify-center">{children}</div>
    </div>
  )
}