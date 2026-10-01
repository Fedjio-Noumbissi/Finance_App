import { getLocale, i18n } from '#/i18n'

export const CURRENCY_CODE = 'XOF'

export const todayIso = (): string => new Date().toISOString().slice(0, 10)

function currentLocale(): string {
  return getLocale(i18n.resolvedLanguage ?? i18n.language)
}

export function formatMoney(
  amount: string | number,
  locale = currentLocale(),
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactMoney(
  amount: string | number,
  locale = currentLocale(),
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY_CODE,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(iso: string, locale = currentLocale()): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatMonthName(mois: string, locale = currentLocale()): string {
  const [year, month] = mois.split('-')

  if (!year || !month) {
    return mois
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(year), Number(month) - 1, 1))
}

export function formatShortMonth(mois: string, locale = currentLocale()): string {
  const [year, month] = mois.split('-')

  if (!year || !month) {
    return mois
  }

  return new Intl.DateTimeFormat(locale, { month: 'short' })
    .format(new Date(Number(year), Number(month) - 1, 1))
    .replace(/\.$/, '')
}

export function monthRange(reference: Date): { du: string; au: string } {
  const year = reference.getFullYear()
  const month = reference.getMonth()

  return {
    du: toIsoDate(new Date(year, month, 1)),
    au: toIsoDate(new Date(year, month + 1, 0)),
  }
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
