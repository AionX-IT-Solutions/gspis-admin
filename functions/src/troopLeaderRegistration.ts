// Self-service account creation for troop leaders, called from the mobile app
// (gspis-app) — the one Cloud Function in this codebase reachable by a caller who
// isn't signed in as staff yet. Unlike createStaffUser (index.ts), there's no
// assertCallerIsAdmin gate here: the caller has no account at all before this call.
//
// Because of that, `role` is hardcoded to 'troop_leader' below and never taken from
// request.data — a client-supplied role here would let anyone grant themselves
// 'admin'. troop_leader is also deliberately not in index.ts's ASSIGNABLE_ROLES: staff
// accounts always go through createStaffUser, leader accounts always go through here.

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'

import { auth, db } from './firebaseAdmin'
import { toHttpsError } from './http'

interface RegisterTroopLeaderRequest {
  email: string
  password: string
  fullName: string
}

export const registerTroopLeader = onCall<RegisterTroopLeaderRequest>(async (request) => {
  try {
    const { email, password, fullName } = request.data
    if (!email || !password || !fullName) {
      throw new HttpsError('invalid-argument', 'email, password, and fullName are all required.')
    }

    const userRecord = await auth.createUser({ email, password, displayName: fullName })
    await auth.setCustomUserClaims(userRecord.uid, { role: 'troop_leader' })
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        fullName,
        role: 'troop_leader',
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
    return { ok: true, uid: userRecord.uid }
  } catch (err) {
    throw toHttpsError(err, 'Failed to create account.')
  }
})
