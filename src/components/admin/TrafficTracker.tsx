import { useEffect, useRef } from 'react'

import { useRouterState } from '@tanstack/react-router'

import { trackPageView } from '#/lib/admin/server'

/** On ne compte pas les pages du dashboard : elles gonfleraient le trafic. */
const CHEMINS_IGNORES = ['/admin']

/**
 * Enregistre chaque page vue dans la base, sans cookie ni adresse IP.
 *
 * Le trafic de la page d'accueil publique est mesuré comme celui de
 * l'application : c'est le même site. Le mécanisme respecte le header
 * `Do Not Track` du navigateur.
 */
export function TrafficTracker() {
  const chemin = useRouterState({ select: (state) => state.location.pathname })
  const dernierChemin = useRef<string | null>(null)

  useEffect(() => {
    if (CHEMINS_IGNORES.some((prefix) => chemin.startsWith(prefix))) {
      return
    }

    if (dernierChemin.current === chemin) {
      return
    }

    dernierChemin.current = chemin

    if (
      typeof navigator !== 'undefined' &&
      navigator.doNotTrack === '1'
    ) {
      return
    }

    const source = typeof document !== 'undefined' ? document.referrer : ''

    trackPageView({
      data: { chemin, source: source || null },
    }).catch(() => {
      // Le suivi du trafic ne doit jamais perturber la navigation.
    })
  }, [chemin])

  return null
}
