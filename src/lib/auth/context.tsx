import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import {
  i18n,
  isSupportedLanguage,
  storeLanguage,
  type Language,
} from '#/i18n'
import { getFirebaseAuth, isFirebaseConfigured } from '#/lib/firebase'

import { AuthError, toAuthError } from './errors'
import {
  closeSession,
  completeOnboarding,
  openSession,
  updateUserLanguage,
} from './server'
import {
  getAuthState,
  setAuthState,
  subscribeToAuth,
  type AuthState,
} from './store'

export interface SignUpInput {
  email: string
  password: string
  passwordConfirmation: string
}

interface AuthContextValue extends AuthState {
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signOut: () => Promise<void>
  language: Language
  setLanguage: (language: Language) => void
  markOnboardingDone: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribeToAuth, getAuthState, getAuthState)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthState({
        status: 'unconfigured',
        user: null,
        sessionReady: false,
        profileSynced: false,
        profile: null,
      })
      return
    }

    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      setAuthState({
        status: user ? 'authenticated' : 'unauthenticated',
        user,
        sessionReady: false,
        profileSynced: false,
        profile: null,
      })
    })
  }, [])

  useEffect(() => {
    if (state.status !== 'authenticated' || state.sessionReady) {
      return
    }

    let cancelled = false

    async function openServerSession() {
      const token = await getFirebaseAuth().currentUser?.getIdToken()

      if (!token) {
        return
      }

      const profile = await openSession({ data: { idToken: token } })

      if (!cancelled) {
        setAuthState({
          sessionReady: true,
          profileSynced: true,
          profile: profile ?? null,
        })

        if (profile && isSupportedLanguage(profile.languePreferee)) {
          storeLanguage(profile.languePreferee)
          void i18n.changeLanguage(profile.languePreferee)
        }
      }

      return profile
    }

    void openServerSession().catch((error) => {
      console.error('Ouverture de la session impossible :', error)

      if (!cancelled) {
        setAuthState({ sessionReady: false, profileSynced: false, profile: null })
      }
    })

    return () => {
      cancelled = true
    }
  }, [state.status, state.sessionReady])

  const language: Language = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'fr'

  const setLanguage = useCallback((next: Language) => {
    if (!isSupportedLanguage(next)) {
      return
    }

    storeLanguage(next)
    void i18n.changeLanguage(next)

    if (getAuthState().status === 'authenticated') {
      void updateUserLanguage({ data: { language: next } }).catch((error) => {
        console.error('Enregistrement de la langue impossible :', error)
      })
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    } catch (error) {
      throw toAuthError(error)
    }
  }, [])

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!input.email || !input.password) {
      throw new AuthError(i18n.t('authError.missingFields'))
    }

    if (input.password !== input.passwordConfirmation) {
      throw new AuthError(i18n.t('authError.passwordMismatch'))
    }

    try {
      await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        input.email,
        input.password,
      )
    } catch (error) {
      throw toAuthError(error)
    }
  }, [])

  const markOnboardingDone = useCallback(async () => {
    const profile = await completeOnboarding()

    setAuthState({ profile })
  }, [])

  const signOut = useCallback(async () => {
    try {
      await closeSession()
      await firebaseSignOut(getFirebaseAuth())
    } catch (error) {
      throw toAuthError(error)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isLoading: state.status === 'loading',
      signIn,
      signUp,
      signOut,
      language,
      setLanguage,
      markOnboardingDone,
    }),
    [
      state,
      signIn,
      signUp,
      signOut,
      language,
      setLanguage,
      markOnboardingDone,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  }

  return context
}

export function useUser() {
  return useAuth().user
}