import { redirect } from '@tanstack/react-router'

import { getAuthState, waitForAuthReady, waitForServerSession } from './store'

export function safeRedirectPath(value: string | undefined | null): string {
  if (!value) {
    return '/dashboard'
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/dashboard'
  }

  return value
}

export async function requireAuth(currentPath: string): Promise<void> {
  if (import.meta.env.SSR) {
    return
  }

  const state = await waitForAuthReady()

  if (state.status !== 'authenticated') {
    throw redirect({ to: '/login', search: { redirect: currentPath } })
  }
}

/** Reserve la page d'administration au role `admin`. */
export async function requireAdmin(currentPath: string): Promise<void> {
  if (import.meta.env.SSR) {
    return
  }

  const state = await waitForAuthReady()

  if (state.status !== 'authenticated') {
    throw redirect({ to: '/login', search: { redirect: currentPath } })
  }

  // La session serveur (et donc le profil) peut encore être en cours.
  await waitForServerSession()

  if (getAuthState().profile?.role !== 'admin') {
    throw redirect({ to: '/dashboard' })
  }
}

export async function redirectIfAuthenticated(): Promise<void> {
  if (import.meta.env.SSR) {
    return
  }

  const state = await waitForAuthReady()

  if (state.status === 'authenticated') {
    throw redirect({ to: '/dashboard' })
  }
}

export function isAuthenticated(): boolean {
  return getAuthState().status === 'authenticated'
}