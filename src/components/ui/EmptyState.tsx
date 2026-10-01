import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  to?: string
  onAction?: () => void
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  to,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const navigate = useNavigate()

  const hasAction = Boolean(actionLabel && (to || onAction))

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-center ${
        compact ? 'py-8' : 'py-14'
      }`}
    >
      {icon ? (
        <span
          aria-hidden
          className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl"
        >
          {icon}
        </span>
      ) : null}

      <p className="text-sm font-medium text-slate-700">{title}</p>

      {description ? (
        <p className="max-w-xs text-sm text-slate-500">{description}</p>
      ) : null}

      {hasAction ? (
        <button
          type="button"
          className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={() => {
            if (onAction) {
              onAction()
              return
            }

            if (to) {
              void navigate({ to })
            }
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
