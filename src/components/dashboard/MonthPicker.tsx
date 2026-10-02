import { useTranslation } from 'react-i18next'
import { formatMonthName } from '#/lib/format'
import { currentMonthKey, listMonthKeys, shiftMonthKey } from '#/lib/dates/months'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthPickerProps {
  value: string
  onChange: (month: string) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { t } = useTranslation()
  const current = currentMonthKey()
  const options = listMonthKeys(24)
  const isCurrentMonth = value >= current

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(shiftMonthKey(value, -1))}
        aria-label={t('month.previous')}
        title={t('month.previous')}
      >
        <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
      </button>

      <label className="sr-only" htmlFor="month-picker">
        {t('month.label')}
      </label>
      <select
        id="month-picker"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((month) => (
          <option key={month} value={month}>
            {formatMonthName(month)}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(shiftMonthKey(value, 1))}
        disabled={isCurrentMonth}
        aria-label={t('month.next')}
        title={t('month.next')}
      >
        <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
      </button>
    </div>
  )
}
