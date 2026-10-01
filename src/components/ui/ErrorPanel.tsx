interface ErrorPanelProps {
  message: string
  onRetry?: () => void
  retryLabel: string
}

export function ErrorPanel({ message, onRetry, retryLabel }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-red-700">{message}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
