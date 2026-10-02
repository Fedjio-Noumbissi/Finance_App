/**
 * Helpers purs du dashboard admin : ils n'importent ni base ni session afin de
 * rester testables sans environment (le reste vit dans `guards.ts`).
 */

/** Jour ISO (`AAAA-MM-JJ`) servant d'axe aux séries du dashboard. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Début de la fenêtre analysée, jour UTC inclus. */
export function startOfWindow(days: number): Date {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - (days - 1))

  return date
}

export function isValidPath(value: string): boolean {
  return (
    /^\/[A-Za-z0-9\-_/?.=&%]*$/.test(value) &&
    !value.startsWith('//') &&
    value.length <= 200
  )
}

/** On ne conserve une source que si c'est une URL http(s) : pas d'injection. */
export function sanitizeSource(value: string | null | undefined): string | null {
  if (!value) return null

  const source = value.slice(0, 200)

  return /^https?:\/\//i.test(source) ? source : null
}