import { createServerFn } from '@tanstack/react-start'
import { eq, or } from 'drizzle-orm'

import { i18n, isSupportedLanguage, type Language } from '#/i18n'
import { db } from '#/lib/db'
import { users, type UserRole } from '#/lib/db/schema'

import { requireUserId } from '#/lib/auth/session'

import { closeAppSession, openAppSession } from './session'

export interface SyncedProfile {
  id: string
  email: string
  languePreferee: string
  onboardingTerminee: boolean
  role: UserRole
}

const profileColumns = {
  id: users.id,
  email: users.email,
  languePreferee: users.languePreferee,
  onboardingTerminee: users.onboardingTerminee,
  role: users.role,
}

async function verifyIdToken(idToken: string) {
  const { getAdminAuth, isFirebaseAdminConfigured } = await import(
    '#/lib/firebase/admin'
  )

  if (!isFirebaseAdminConfigured()) {
    return null
  }

  return getAdminAuth().verifyIdToken(idToken)
}

async function upsertUser(
  uid: string,
  email: string,
  localeClaim: string | undefined,
): Promise<SyncedProfile | null> {
  const languePreferee: Language = isSupportedLanguage(localeClaim)
    ? localeClaim
    : 'fr'

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.firebaseUid, uid), eq(users.email, email)))
    .limit(1)

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({ firebaseUid: uid })
      .where(eq(users.id, existing.id))
      .returning(profileColumns)

    return updated
  }

  const [created] = await db
    .insert(users)
    .values({ firebaseUid: uid, email, languePreferee })
    .returning(profileColumns)

  return created
}

export const openSession = createServerFn({ method: 'POST' })
  .validator((data: { idToken: string }) => {
    if (!data.idToken) {
      throw new Error(i18n.t('serverError.missingToken'))
    }

    return data
  })
  .handler(async ({ data }) => {
    const decoded = await verifyIdToken(data.idToken)

    if (!decoded) {
      throw new Error(i18n.t('serverError.adminMissing'))
    }

    if (!decoded.email) {
      throw new Error(i18n.t('serverError.missingEmail'))
    }

    const profile = await upsertUser(decoded.uid, decoded.email, decoded.locale)

    if (!profile) {
      throw new Error(i18n.t('serverError.syncFailed'))
    }

    await openAppSession({ userId: profile.id, firebaseUid: decoded.uid })

    return profile
  })

export const closeSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    await closeAppSession()

    return { closed: true }
  },
)

export const syncUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { idToken: string }) => {
    if (!data.idToken) {
      throw new Error(i18n.t('serverError.missingToken'))
    }

    return data
  })
  .handler(async ({ data }): Promise<SyncedProfile | null> => {
    const decoded = await verifyIdToken(data.idToken)

    if (!decoded?.email) {
      return null
    }

    return upsertUser(decoded.uid, decoded.email, decoded.locale)
  })
export const updateUserLanguage = createServerFn({ method: 'POST' })
  .validator((data: { language: string }) => {
    if (!isSupportedLanguage(data.language)) {
      throw new Error(i18n.t('serverError.languageInvalid'))
    }

    return { language: data.language }
  })
  .handler(async ({ data }): Promise<SyncedProfile> => {
    const userId = await requireUserId()

    const [updated] = await db
      .update(users)
      .set({ languePreferee: data.language })
      .where(eq(users.id, userId))
      .returning(profileColumns)

    if (!updated) {
      throw new Error(i18n.t('serverError.syncFailed'))
    }

    return updated
  })

export const completeOnboarding = createServerFn({ method: 'POST' }).handler(
  async (): Promise<SyncedProfile> => {
    const userId = await requireUserId()

    const [updated] = await db
      .update(users)
      .set({ onboardingTerminee: true })
      .where(eq(users.id, userId))
      .returning(profileColumns)

    if (!updated) {
      throw new Error(i18n.t('serverError.syncFailed'))
    }

    return updated
  },
)
