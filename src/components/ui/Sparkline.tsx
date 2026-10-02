import { useId } from 'react'

/**
 * Mini courbe d'evolution : remplace un paragraphe de texte par une forme.
 * Les valeurs restent accessibles via `label`.
 */
export function Sparkline({
  values,
  label,
  tone = 'default',
  className = '',
}: {
  values: number[]
  label: string
  tone?: 'default' | 'income' | 'expense'
  className?: string
}) {
  const gradientId = useId()

  if (values.length < 2) {
    return null
  }

  const largeur = 120
  const hauteur = 34
  const padding = 2

  const min = Math.min(...values)
  const max = Math.max(...values)
  const etendue = max - min || 1

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (largeur - padding * 2)
    const y =
      hauteur - padding - ((value - min) / etendue) * (hauteur - padding * 2)

    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const couleur =
    tone === 'income' ? '#059669' : tone === 'expense' ? '#e11d48' : '#0f172a'

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${largeur} ${hauteur}`}
      preserveAspectRatio="none"
      className={`h-9 w-full ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={couleur} stopOpacity="0.22" />
          <stop offset="100%" stopColor={couleur} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon
        points={`${padding},${hauteur} ${points.join(' ')} ${largeur - padding},${hauteur}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={couleur}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={points.at(-1)?.split(',')[0]}
        cy={points.at(-1)?.split(',')[1]}
        r="2.2"
        fill={couleur}
      />
    </svg>
  )
}