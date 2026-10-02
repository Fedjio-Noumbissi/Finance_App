import type { ReactNode } from 'react'

/**
 * Carte de statistique visuelle : icone, valeur en grand, variation en pastille
 * et, si possible, une courbe ou une barre. Le texte reste court.
 */
export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  footer,
  tone = 'default',
  emphasis = false,
}: {
  label: string
  value: string
  icon?: ReactNode
  delta?: ReactNode
  hint?: string
  footer?: ReactNode
  tone?: 'default' | 'income' | 'expense' | 'brand'
  emphasis?: boolean
}) {
  const tones = {
    default: 'text-slate-900',
    income: 'text-emerald-600',
    expense: 'text-rose-600',
    brand: 'text-slate-900',
  } as const

  const badges = {
    default: 'bg-slate-100 text-slate-500',
    income: 'bg-emerald-50 text-emerald-600',
    expense: 'bg-rose-50 text-rose-500',
    brand: 'bg-slate-900 text-white',
  } as const

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        emphasis
          ? 'border-slate-900/10 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-xs font-semibold tracking-wide uppercase ${
            emphasis ? 'text-white/60' : 'text-slate-400'
          }`}
        >
          {label}
        </p>
        {icon ? (
          <span
            aria-hidden
            className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
              emphasis ? 'bg-white/10 text-white' : badges[tone]
            }`}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <p
        className={`mt-3 text-3xl leading-none font-bold tracking-tight tabular-nums ${
          emphasis ? 'text-white' : tones[tone]
        }`}
      >
        {value}
      </p>

      {delta || hint ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {delta}
          {hint ? (
            <span
              className={`text-xs ${emphasis ? 'text-white/60' : 'text-slate-400'}`}
            >
              {hint}
            </span>
          ) : null}
        </div>
      ) : null}

      {footer ? <div className="-mx-1 mt-3">{footer}</div> : null}
    </div>
  )
}

/** Pastille de variation : la couleur et la fleche suffisent, pas de phrase. */
export function DeltaPill({
  percent,
  label,
  inverted = false,
  emphasis = false,
}: {
  percent: number | null
  label: string
  /** Sur les depenses, une hausse est defavorable : on inverse les couleurs. */
  inverted?: boolean
  emphasis?: boolean
}) {
  if (percent === null || !Number.isFinite(percent)) {
    return null
  }

  const arrondi = Math.round(percent)
  const hausse = arrondi > 0
  const plat = arrondi === 0
  const favorable = inverted ? !hausse : hausse

  const couleurs = plat
    ? 'bg-slate-100 text-slate-600'
    : favorable
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-rose-50 text-rose-700'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        emphasis ? 'bg-white/15 text-white' : couleurs
      }`}
    >
      <span aria-hidden>{hausse ? '↑' : plat ? '→' : '↓'}</span>
      {`${Math.abs(arrondi)} %`}
      <span className="sr-only">{label}</span>
    </span>
  )
}