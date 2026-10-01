/**
 * Catalogue des devises prises en charge.
 *
 * `tauxVersXof` indique combien de FCFA (XOF) vaut 1 unité de la devise.
 * Le franc CFA (XOF) est la devise de référence : son taux vaut donc 1.
 *
 * Ces taux sont des valeurs de départ indicatives, éditables depuis les
 * réglages de l'application (voir `updateCurrencyRate`). Ils ne sont pas
 * récupérés automatiquement en ligne : l'utilisateur les met à jour quand il
 * le souhaite, ce qui évite de dépendre d'un service externe.
 */
export interface CurrencyDefinition {
  code: string
  nomFr: string
  nomEn: string
  /** Nombre de décimales affichées. */
  decimales: number
  /** Valeur d'1 unité de cette devise en XOF. */
  tauxVersXof: number
}

export const DEVISE_BASE = 'XOF'

export const CURRENCIES: CurrencyDefinition[] = [
  // Afrique de l'Ouest et centrale (zone CFA)
  { code: 'XOF', nomFr: 'Franc CFA (BCEAO)', nomEn: 'CFA franc (BCEAO)', decimales: 2, tauxVersXof: 1 },
  { code: 'XAF', nomFr: 'Franc CFA (BEAC)', nomEn: 'CFA franc (BEAC)', decimales: 0, tauxVersXof: 1 },
  { code: 'GHS', nomFr: 'Cedi ghanéen', nomEn: 'Ghanaian cedi', decimales: 2, tauxVersXof: 50 },
  { code: 'NGN', nomFr: 'Naira nigérian', nomEn: 'Nigerian naira', decimales: 2, tauxVersXof: 0.4 },
  { code: 'KES', nomFr: 'Shilling kényan', nomEn: 'Kenyan shilling', decimales: 2, tauxVersXof: 4.6 },
  { code: 'ZAR', nomFr: 'Rand sud-africain', nomEn: 'South African rand', decimales: 2, tauxVersXof: 33 },
  { code: 'MAD', nomFr: 'Dirham marocain', nomEn: 'Moroccan dirham', decimales: 2, tauxVersXof: 61 },
  { code: 'DZD', nomFr: 'Dinar algérien', nomEn: 'Algerian dinar', decimales: 3, tauxVersXof: 4.4 },
  { code: 'TND', nomFr: 'Dinar tunisien', nomEn: 'Tunisian dinar', decimales: 3, tauxVersXof: 208 },
  { code: 'EGP', nomFr: 'Livre égyptienne', nomEn: 'Egyptian pound', decimales: 2, tauxVersXof: 12.5 },
  { code: 'ETB', nomFr: 'Birr éthiopien', nomEn: 'Ethiopian birr', decimales: 2, tauxVersXof: 5.3 },
  { code: 'UGX', nomFr: 'Shilling ougandais', nomEn: 'Ugandan shilling', decimales: 0, tauxVersXof: 0.17 },
  { code: 'TZS', nomFr: 'Shilling tanzanien', nomEn: 'Tanzanian shilling', decimales: 0, tauxVersXof: 0.39 },

  // Europe
  { code: 'EUR', nomFr: 'Euro', nomEn: 'Euro', decimales: 2, tauxVersXof: 655.957 },
  { code: 'GBP', nomFr: 'Livre sterling', nomEn: 'British pound', decimales: 2, tauxVersXof: 786 },
  { code: 'CHF', nomFr: 'Franc suisse', nomEn: 'Swiss franc', decimales: 2, tauxVersXof: 672 },
  { code: 'SEK', nomFr: 'Couronne suédoise', nomEn: 'Swedish krona', decimales: 2, tauxVersXof: 60 },
  { code: 'NOK', nomFr: 'Couronne norvégienne', nomEn: 'Norwegian krone', decimales: 2, tauxVersXof: 55 },
  { code: 'DKK', nomFr: 'Couronne danoise', nomEn: 'Danish krone', decimales: 2, tauxVersXof: 88 },
  { code: 'PLN', nomFr: 'Zloty polonais', nomEn: 'Polish zloty', decimales: 2, tauxVersXof: 157 },
  { code: 'CZK', nomFr: 'Couronne tchèque', nomEn: 'Czech koruna', decimales: 2, tauxVersXof: 26.9 },
  { code: 'HUF', nomFr: 'Forint hongrois', nomEn: 'Hungarian forint', decimales: 2, tauxVersXof: 1.7 },
  { code: 'RON', nomFr: 'Leu roumain', nomEn: 'Romanian leu', decimales: 2, tauxVersXof: 132 },
  { code: 'BGN', nomFr: 'Lev bulgare', nomEn: 'Bulgarian lev', decimales: 2, tauxVersXof: 335 },
  { code: 'RUB', nomFr: 'Rouble russe', nomEn: 'Russian ruble', decimales: 2, tauxVersXof: 6.6 },
  { code: 'TRY', nomFr: 'Livre turque', nomEn: 'Turkish lira', decimales: 2, tauxVersXof: 15.5 },
  { code: 'UAH', nomFr: 'Hryvnia ukrainienne', nomEn: 'Ukrainian hryvnia', decimales: 2, tauxVersXof: 14.5 },

  // Amérique du Nord
  { code: 'USD', nomFr: 'Dollar américain', nomEn: 'US dollar', decimales: 2, tauxVersXof: 600 },
  { code: 'CAD', nomFr: 'Dollar canadien', nomEn: 'Canadian dollar', decimales: 2, tauxVersXof: 440 },
  { code: 'MXN', nomFr: 'Peso mexicain', nomEn: 'Mexican peso', decimales: 2, tauxVersXof: 33 },

  // Amérique du Sud
  { code: 'BRL', nomFr: 'Réal brésilien', nomEn: 'Brazilian real', decimales: 2, tauxVersXof: 108 },
  { code: 'ARS', nomFr: 'Peso argentin', nomEn: 'Argentine peso', decimales: 2, tauxVersXof: 0.54 },
  { code: 'CLP', nomFr: 'Peso chilien', nomEn: 'Chilean peso', decimales: 0, tauxVersXof: 0.63 },
  { code: 'COP', nomFr: 'Peso colombien', nomEn: 'Colombian peso', decimales: 0, tauxVersXof: 0.15 },
  { code: 'PEN', nomFr: 'Sol péruvien', nomEn: 'Peruvian sol', decimales: 2, tauxVersXof: 160 },
  { code: 'UYU', nomFr: 'Peso uruguayen', nomEn: 'Uruguayan peso', decimales: 2, tauxVersXof: 15.8 },

  // Asie
  { code: 'JPY', nomFr: 'Yen japonais', nomEn: 'Japanese yen', decimales: 0, tauxVersXof: 3.9 },
  { code: 'CNY', nomFr: 'Yuan chinois', nomEn: 'Chinese yuan', decimales: 2, tauxVersXof: 83 },
  { code: 'INR', nomFr: 'Roupie indienne', nomEn: 'Indian rupee', decimales: 2, tauxVersXof: 7.2 },
  { code: 'KRW', nomFr: 'Won sud-coréen', nomEn: 'South Korean won', decimales: 0, tauxVersXof: 0.44 },
  { code: 'SGD', nomFr: 'Dollar singapourien', nomEn: 'Singapore dollar', decimales: 2, tauxVersXof: 445 },
  { code: 'HKD', nomFr: 'Dollar hongkongais', nomEn: 'Hong Kong dollar', decimales: 2, tauxVersXof: 77 },
  { code: 'TWD', nomFr: 'Dollar taïwanais', nomEn: 'New Taiwan dollar', decimales: 2, tauxVersXof: 18.6 },
  { code: 'IDR', nomFr: 'Roupie indonésienne', nomEn: 'Indonesian rupiah', decimales: 0, tauxVersXof: 0.037 },
  { code: 'MYR', nomFr: 'Ringgit malaisien', nomEn: 'Malaysian ringgit', decimales: 2, tauxVersXof: 134 },
  { code: 'PHP', nomFr: 'Peso philippin', nomEn: 'Philippine peso', decimales: 2, tauxVersXof: 10.4 },
  { code: 'VND', nomFr: 'Dong vietnamien', nomEn: 'Vietnamese dong', decimales: 0, tauxVersXof: 0.023 },
  { code: 'THB', nomFr: 'Baht thaïlandais', nomEn: 'Thai baht', decimales: 2, tauxVersXof: 17 },
  { code: 'PKR', nomFr: 'Roupie pakistanaise', nomEn: 'Pakistani rupee', decimales: 2, tauxVersXof: 2.1 },
  { code: 'BDT', nomFr: 'Taka bangladais', nomEn: 'Bangladeshi taka', decimales: 2, tauxVersXof: 5.1 },
  { code: 'LKR', nomFr: 'Roupie sri-lankaise', nomEn: 'Sri Lankan rupee', decimales: 2, tauxVersXof: 1.9 },
  { code: 'KZT', nomFr: 'Tenge kazakh', nomEn: 'Kazakhstani tenge', decimales: 2, tauxVersXof: 1.3 },

  // Moyen-Orient
  { code: 'SAR', nomFr: 'Riyal saoudien', nomEn: 'Saudi riyal', decimales: 2, tauxVersXof: 160 },
  { code: 'AED', nomFr: 'Dirham des Émirats', nomEn: 'UAE dirham', decimales: 2, tauxVersXof: 163 },
  { code: 'QAR', nomFr: 'Riyal qatari', nomEn: 'Qatari riyal', decimales: 2, tauxVersXof: 165 },
  { code: 'KWD', nomFr: 'Dinar koweïtien', nomEn: 'Kuwaiti dinar', decimales: 3, tauxVersXof: 1950 },
  { code: 'BHD', nomFr: 'Dinar bahreïnien', nomEn: 'Bahraini dinar', decimales: 3, tauxVersXof: 1590 },
  { code: 'OMR', nomFr: 'Rial omanais', nomEn: 'Omani rial', decimales: 3, tauxVersXof: 1560 },
  { code: 'JOD', nomFr: 'Dinar jordanien', nomEn: 'Jordanian dinar', decimales: 3, tauxVersXof: 846 },
  { code: 'ILS', nomFr: 'Shekel israélien', nomEn: 'Israeli shekel', decimales: 2, tauxVersXof: 170 },
  { code: 'LBP', nomFr: 'Livre libanaise', nomEn: 'Lebanese pound', decimales: 2, tauxVersXof: 0.0067 },

  // Océanie
  { code: 'AUD', nomFr: 'Dollar australien', nomEn: 'Australian dollar', decimales: 2, tauxVersXof: 390 },
  { code: 'NZD', nomFr: 'Dollar néo-zélandais', nomEn: 'New Zealand dollar', decimales: 2, tauxVersXof: 355 },
  { code: 'FJD', nomFr: 'Dollar fijien', nomEn: 'Fijian dollar', decimales: 2, tauxVersXof: 268 },
]

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code)

const BY_CODE = new Map(CURRENCIES.map((currency) => [currency.code, currency]))

export function getCurrencyDefinition(code: string): CurrencyDefinition {
  return BY_CODE.get(code) ?? BY_CODE.get(DEVISE_BASE)!
}

export function isSupportedCurrency(code: string): boolean {
  return BY_CODE.has(code)
}

export type TauxMap = Record<string, number>

export function buildTauxMap(
  overrides: Record<string, number> = {},
): TauxMap {
  const taux: TauxMap = {}

  for (const currency of CURRENCIES) {
    const override = overrides[currency.code]
    taux[currency.code] =
      typeof override === 'number' && Number.isFinite(override) && override > 0
        ? override
        : currency.tauxVersXof
  }

  return taux
}

export function roundCurrency(value: number, code: string): number {
  const { decimales } = getCurrencyDefinition(code)
  const factor = 10 ** decimales

  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** Convertit un montant d'une devise vers une autre via les taux XOF. */
export function convertMontant(
  montant: number,
  from: string,
  to: string,
  taux: TauxMap,
): number {
  const tauxFrom = taux[from] ?? 1
  const tauxTo = taux[to] ?? 1

  if (tauxFrom === tauxTo) {
    return roundCurrency(montant, to)
  }

  return roundCurrency((montant * tauxFrom) / tauxTo, to)
}

export function formatTaux(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(value)
}
