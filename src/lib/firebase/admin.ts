import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(projectId && clientEmail && privateKey)
}

export function getAdminAuth() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      'Configuration Firebase Admin manquante : renseignez FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL et FIREBASE_PRIVATE_KEY dans .env',
    )
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })

  return getAuth(app)
}