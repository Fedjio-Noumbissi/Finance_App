import { useSession } from '@tanstack/react-start/server'
import type { SessionConfig } from '@tanstack/react-start/server'

import { i18n } from '#/i18n'

export interface AppSessionData {
  userId: string
  firebaseUid: string
}

const SESSION_NAME = 'finance_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

export class UnauthorizedError extends Error {}

function getSessionConfig(): SessionConfig {
  const password = process.env.SESSION_SECRET

  if (!password || password.length < 32) {
    throw new Error(
      'SESSION_SECRET manquant ou trop court : 32 caractères minimum requis dans .env',
    )
  }

  return { name: SESSION_NAME, password, maxAge: SESSION_MAX_AGE }
}

export async function openAppSession(data: AppSessionData): Promise<void> {
  const session = await useSession<AppSessionData>(getSessionConfig())
  await session.update(data)
}

export async function closeAppSession(): Promise<void> {
  const session = await useSession<AppSessionData>(getSessionConfig())
  await session.clear()
}

export async function requireUserId(): Promise<string> {
  const session = await useSession<AppSessionData>(getSessionConfig())
  const userId = session.data.userId

  if (!userId) {
    throw new UnauthorizedError(i18n.t('transaction.table.sessionExpired'))
  }

  return userId
}