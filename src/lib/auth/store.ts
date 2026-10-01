import type { User as FirebaseUser } from 'firebase/auth'

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