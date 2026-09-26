// Single shared Admin SDK init — both index.ts (staff-account management) and
// troopLeaderRegistration.ts (public self-registration) need `auth`/`db`, and
// initializeApp() throws if called more than once per process.

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()

export const auth = getAuth()
export const db = getFirestore()
