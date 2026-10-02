import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import fr from './fr.json'
import en from './en.json'
import {
  DEFAULT_LANGUAGE,
  i18n,
  LANGUAGE_COOKIE,
  readInitialLanguage,
  storeLanguage,
} from './index'

type Langue = Record<string, unknown>

const racine = fileURLToPath(new URL('..', import.meta.url))

function fichiersSource(dossier: string): string[] {
  const sortie: string[] = []

  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree)

    if (statSync(chemin).isDirectory()) {
      sortie.push(...fichiersSource(chemin))
      continue
    }

    if (/\.tsx?$/.test(entree) && !entree.endsWith('.test.ts') && !entree.endsWith('.d.ts')) {
      sortie.push(chemin)
    }
  }

  return sortie
}

/** Toutes les clés statiques appelées par `t('...')` dans les composants. */
function clesUtilisees(): string[] {
  const cles = new Set<string>()

  for (const fichier of fichiersSource(racine)) {
    const source = readFileSync(fichier, 'utf8')

    for (const motif of [
      /\bt\(\s*'([a-zA-Z0-9_.]+)'/g,
      /\bt\(\s*"([a-zA-Z0-9_.]+)"/g,
      /\bi18n\.t\(\s*'([a-zA-Z0-9_.]+)'/g,
      /\bt\(\s*`([a-zA-Z0-9_.]+)`/g,
    ]) {
      for (const [, cle] of source.matchAll(motif)) {
        cles.add(cle)
      }
    }
  }

  return [...cles].sort()
}

function aplatir(objet: Langue, prefixe = '', sortie = new Map<string, string>()) {
  for (const [cle, valeur] of Object.entries(objet)) {
    const chemin = prefixe ? `${prefixe}.${cle}` : cle

    if (valeur && typeof valeur === 'object') {
      aplatir(valeur as Langue, chemin, sortie)
    } else {
      sortie.set(chemin, String(valeur))
    }
  }

  return sortie
}

function placeholders(texte: string): string[] {
  return [...texte.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort()
}

const clesFr = aplatir(fr as Langue)
const clesEn = aplatir(en as Langue)
const clesCode = clesUtilisees()

describe('parite FR / EN', () => {
  it('expose exactement les memes cles dans les deux langues', () => {
    expect([...clesEn.keys()].sort()).toEqual([...clesFr.keys()].sort())
  })

  it('utilise les memes placeholders pour une meme cle', () => {
    const ecarts: string[] = []

    for (const [cle, valeurFr] of clesFr) {
      const valeurEn = clesEn.get(cle)

      if (valeurEn === undefined) continue

      const frPlaceholders = placeholders(valeurFr).join(',')
      const enPlaceholders = placeholders(valeurEn).join(',')

      if (frPlaceholders !== enPlaceholders) {
        ecarts.push(`${cle} : {${frPlaceholders}} != {${enPlaceholders}}`)
      }
    }

    expect(ecarts).toEqual([])
  })

  it('ne laisse aucune chaine vide', () => {
    const vides = [...clesFr.entries()]
      .filter(([, valeur]) => valeur.trim() === '')
      .map(([cle]) => cle)

    expect(vides).toEqual([])
  })
})

describe('cles utilisees dans le code', () => {
  it('toutes les cles t() existent en francais', () => {
    const manquantes = clesCode.filter((cle) => !clesFr.has(cle))

    expect(manquantes).toEqual([])
  })

  it('toutes les cles t() existent en anglais', () => {
    const manquantes = clesCode.filter((cle) => !clesEn.has(cle))

    expect(manquantes).toEqual([])
  })

  it('decouvre vraiment des cles (le scan n est pas vide)', () => {
    expect(clesCode.length).toBeGreaterThan(150)
  })
})

describe('configuration i18next', () => {
  it('interpole les accolades simples utilisees dans les fichiers', () => {
    expect(i18n.options.interpolation).toMatchObject({ prefix: '{', suffix: '}' })
  })

  it('ne laisse pas echapper les valeurs inserees', () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false)
  })

  it('resout une cle et interpole ses placeholders', async () => {
    await i18n.changeLanguage('fr')

    const message = i18n.t('settings.currency.preview', {
      montant: '100',
      devise: 'XOF',
      resultat: '0,17',
      deviseCible: 'USD',
    })

    expect(message).toContain('100 XOF')
    expect(message).toContain('0,17 USD')
    expect(message).not.toContain('{')
  })
})
describe('langue partagee entre le serveur et le client', () => {
  /**
   * Le serveur ne lit pas localStorage : il ne peut donc reproduire la langue
   * du premier rendu que si elle est aussi portee par un cookie. Ces tests
   * verrouillent ce contrat, dont depend l'absence d'erreur d'hydratation.
   */
  function avecCookie(valeur: string) {
    const cibles = globalThis as unknown as { document?: unknown; window?: unknown }

    cibles.document = { cookie: valeur }
    cibles.window = {
      localStorage: {
        store: new Map<string, string>(),
        getItem(this: Map<string, string>, key: string) {
          return this.get(key) ?? null
        },
        setItem(this: Map<string, string>, key: string, entry: string) {
          this.set(key, entry)
        },
      },
    }

    return () => {
      delete cibles.document
      delete cibles.window
    }
  }

  it('ecrit la langue dans le cookie lu par le serveur', () => {
    const restaurer = avecCookie('')

    try {
      storeLanguage('en')

      const documentCourant = globalThis as unknown as { document: { cookie: string } }

      expect(documentCourant.document.cookie).toContain(`${LANGUAGE_COOKIE}=en`)
      expect(readInitialLanguage()).toBe('en')
    } finally {
      restaurer()
    }
  })

  it('lit la langue du cookie et non celle du stockage local', () => {
    const restaurer = avecCookie(`${LANGUAGE_COOKIE}=en`)

    try {
      expect(readInitialLanguage()).toBe('en')
    } finally {
      restaurer()
    }
  })

  it('retombe sur la langue par defaut si le cookie est absent ou invalide', () => {
    for (const cookie of ['', 'autre=1', `${LANGUAGE_COOKIE}=de`, `${LANGUAGE_COOKIE}=`]) {
      const restaurer = avecCookie(cookie)

      try {
        expect(readInitialLanguage()).toBeNull()
      } finally {
        restaurer()
      }
    }

    expect(DEFAULT_LANGUAGE).toBe('fr')
  })
})
