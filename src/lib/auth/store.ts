import type { User as FirebaseUser } from 'firebase/auth'

import type { UserRole } from '#/lib/db/schema'

import { SessionNotReadyError } from '#/lib/errors'

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'unconfigured'

export interface AppProfile {
  id: string
  email: string
  languePreferee: string
  onboardingTerminee: boolean
  role: UserRole
}

export interface AuthState {
  status: AuthStatus
  user: FirebaseUser | null
  sessionReady: boolean
  profileSynced: boolean
  profile: AppProfile | null
}

const initialState: AuthState = {
  status: 'loading',
  user: null,
  sessionReady: false,
  profileSynced: false,
  profile: null,
}

let state: AuthState = initialState

const listeners = new Set<() => void>()

export function getAuthState(): AuthState {
  return state
}

export function setAuthState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch }

  for (const listener of listeners) {
    listener()
  }
}

export function subscribeToAuth(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/**
 * Les server functions lisent la session dans le cookie : une mutation
 * declenchee avant que `openSession` ait repondu part avec une session
 * absente. On attend donc que la session serveur soit prete avant d envoyer
 * quoi que ce soit.
 */
export function waitForServerSession(timeoutMs = 12_000): Promise<void> {
  if (state.sessionReady || state.status !== 'authenticated') {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsubscribe()
      reject(new SessionNotReadyError())
    }, timeoutMs)

    const unsubscribe = subscribeToAuth(() => {
      if (state.sessionReady) {
        clearTimeout(timer)
        unsubscribe()
        resolve()
      }
    })
  })
}

export function waitForAuthReady(): Promise<AuthState> {
  if (state.status !== 'loading') {
    return Promise.resolve(state)
  }

  return new Promise((resolve) => {
    const unsubscribe = subscribeToAuth(() => {
      if (state.status !== 'loading') {
        unsubscribe()
        resolve(state)
      }
    })
  })
}