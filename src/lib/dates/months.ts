export const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && MONTH_KEY_PATTERN.test(value)
}

export function currentMonthKey(reference = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Abidjan',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(reference)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value

  return `${year}-${month}`
}

export function shiftMonthKey(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const cursor = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1 + delta, 1))

  return `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`
}

export function listMonthKeys(count: number, reference = new Date()): string[] {
  const current = currentMonthKey(reference)

  return Array.from({ length: count }, (_, index) =>
    shiftMonthKey(current, index - (count - 1)),
  )
}
