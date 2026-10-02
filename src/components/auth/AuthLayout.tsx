import { Link } from '@tanstack/react-router'
import { BarChart3, PieChart, Sparkles, Tags, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FEATURES: { cle: string; icone: LucideIcon }[] = [
  { cle: 'auth.panelFeatureCategories', icone: Tags },
  { cle: 'auth.panelFeatureStats', icone: PieChart },
  { cle: 'auth.panelFeatureCurrencies', icone: BarChart3 },
]

/** Retour a l'accueil sur mobile, ou le panneau illustratif est masque. */
function MobileBrandLink() {
  const { t } = useTranslation()

  return (
    <Link
      className="flex items-center gap-2 self-start rounded-lg px-1 py-1 text-sm font-semibold tracking-tight text-slate-900 lg:hidden"
      to="/"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
        <Sparkles aria-hidden className="size-4" strokeWidth={2} />
      </span>
      {t('appName')}
    </Link>
  )
}

/**
 * Panneau illustratif des pages d'authentification : il montre le produit
 * (cartes, barres, courbe) au lieu d'une longue liste de copier.
 */
function AuthShowcase() {
  const { t } = useTranslation()

  return (
    <aside className="relative hidden w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900 p-10 text-white lg:block">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-slate-700/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-slate-800/60 blur-3xl"
      />

      <div className="relative flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
            <Sparkles aria-hidden className="size-4" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            {t('appName')}
          </span>
        </div>

        <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-white">
          {t('auth.panelTitle')}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-medium text-white/60">{t('auth.panelBalance')}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-white">
              {t('auth.panelBalanceValue')}
            </p>
            <div aria-hidden className="mt-4 flex h-12 items-end gap-1.5">
              {[42, 58, 35, 72, 55, 88, 66].map((hauteur, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t-sm bg-emerald-400/80"
                  style={{ height: `${hauteur}%` }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="h-2 w-16 rounded-full bg-white/20" />
              <div aria-hidden className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <span className="block h-full w-2/5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="h-2 w-16 rounded-full bg-white/20" />
              <div aria-hidden className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <span className="block h-full w-3/5 rounded-full bg-rose-400" />
              </div>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-2.5">
          {FEATURES.map(({ cle, icone: Icone }) => (
            <li key={cle} className="flex items-center gap-3 text-sm text-white/80">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icone aria-hidden className="size-4" strokeWidth={1.9} />
              </span>
              {t(cle)}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

/**
 * Gabarit commun des pages de connexion et d'inscription : la maquette
 *occupe la moitie large, le formulaire reste le point focal sur mobile.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <MobileBrandLink />
        <AuthShowcase />
        <div className="flex w-full justify-center">{children}</div>
      </div>
    </div>
  )
}