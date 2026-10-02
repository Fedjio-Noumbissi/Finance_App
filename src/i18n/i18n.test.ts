import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import fr from './fr.json'
import en from './en.json'
import { i18n } from './index'

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

function resoudre(objet: Langue, cle: string): unknown {
  return cle
    .split('.')
    .reduce<unknown>(
      (accumulateur, partie) =>
        accumulateur && typeof accumulateur === 'object'
          ? (accumulateur as Langue)[partie]
          : undefined,
      objet,
    )
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
    const manquantes = clesCode.filter((cle) => resoudre(fr as Langue, cle) === undefined)

    expect(manquantes).toEqual([])
  })

  it('toutes les cles t() existent en anglais', () => {
    const manquantes = clesCode.filter((cle) => resoudre(en as Langue, cle) === undefined)

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