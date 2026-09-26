// Privileged staff-account operations — Firebase Auth user creation + role (custom claim)
// changes. These can only be done with the Admin SDK, and the desktop app deliberately
// never ships a service account key (see the old src/main/services/staffAdmin), so they
// run here instead: the signed-in admin's app calls these directly over HTTPS, no local
// key, no terminal command, on every machine that runs the app.
//
// Mirrors scripts/manageStaffUser.mjs's rules exactly (same role list, same single-
// super_admin constraint) — that script still exists as an emergency CLI backdoor, but
// the app itself no longer generates or needs it for normal Add/Edit User use.
//
// Troop-leader self-registration is a deliberately separate function in
// troopLeaderRegistration.ts, not folded in here: unlike everything below, its caller
// isn't staff yet, so it can't share assertCallerIsAdmin's gate.

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { FieldValue } from 'firebase-admin/firestore'

import { auth, db } from './firebaseAdmin'
import { toHttpsError } from './http'

// Must always be one of these 7 — Firestore security rules and gspi-app (mobile) only
// understand them. A custom role (Role Permissions screen) is never sent as `role`
// itself: the renderer resolves it to its base role first and passes the custom role's
// id separately as `customRoleId` (cosmetic — see resolveRoleAssignment in the app).
const ASSIGNABLE_ROLES = [
  'super_admin',
  'admin',
  'cashier',
  'accountant',
  'hr',
  'inventory_clerk',
  'manager'
]

interface CreateStaffUserRequest {
  email: string
  password: string
  fullName: string
  role: string
  customRoleId?: string | null
}

interface UpdateStaffUserRequest {
  uid: string
  fullName?: string
  role?: string
  customRoleId?: string | null
  isActive?: boolean
  newPassword?: string
}

/** Only a signed-in admin/super_admin may manage other staff accounts — Firestore rules
 *  don't gate this (the Admin SDK bypasses them entirely), so it's enforced here instead. */
function assertCallerIsAdmin(callerAuth: CallableRequest['auth']): void {
  const role = callerAuth?.token?.role
  if (!callerAuth || (role !== 'super_admin' && role !== 'admin')) {
    throw new HttpsError('permission-denied', 'Only an admin or super admin can manage staff accounts.')
  }
}

function assertValidRole(role?: string): void {
  if (!role) return
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}.`)
  }
}

/** Only one active super_admin at a time — the app's role dropdown already hides the
 *  option once one exists, but this re-checks server-side too. */
async function assertSuperAdminAvailable(excludeUid?: string): Promise<void> {
  const snap = await db.collection('users').where('role', '==', 'super_admin').get()
  const other = snap.docs.find((d) => d.id !== excludeUid)
  if (other) {
    throw new HttpsError(
      'failed-precondition',
      `A super_admin already exists (${(other.data().email as string | undefined) ?? other.id}). Demote them first.`
    )
  }
}

export const createStaffUser = onCall<CreateStaffUserRequest>(async (request) => {
  try {
    assertCallerIsAdmin(request.auth)
    const { email, password, fullName, role, customRoleId } = request.data
    if (!email || !password || !fullName || !role) {
      throw new HttpsError(
        'invalid-argument',
        'email, password, fullName, and role are all required.'
      )
    }
    assertValidRole(role)
    if (role === 'super_admin') await assertSuperAdminAvailable()

    const userRecord = await auth.createUser({ email, password, displayName: fullName })
    await auth.setCustomUserClaims(userRecord.uid, { role })
    await db
      .collection('users')
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        fullName,
        role,
        ...(customRoleId ? { customRoleId } : {}),
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      })
    return { ok: true, uid: userRecord.uid }
  } catch (err) {
    throw toHttpsError(err, 'Failed to create user account.')
  }
})

export const updateStaffUser = onCall<UpdateStaffUserRequest>(async (request) => {
  try {
    assertCallerIsAdmin(request.auth)
    const { uid, fullName, role, customRoleId, isActive, newPassword } = request.data
    if (!uid) throw new HttpsError('invalid-argument', 'uid is required.')
    assertValidRole(role)
    if (role === 'super_admin') await assertSuperAdminAvailable(uid)

    const authUpdate: Record<string, unknown> = {}
    if (fullName) authUpdate.displayName = fullName
    if (isActive !== undefined) authUpdate.disabled = !isActive
    if (newPassword) authUpdate.password = newPassword
    if (Object.keys(authUpdate).length > 0) {
      await auth.updateUser(uid, authUpdate)
    }
    if (role) {
      await auth.setCustomUserClaims(uid, { role })
    }

    const firestoreUpdate: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (fullName) firestoreUpdate.fullName = fullName
    if (role) firestoreUpdate.role = role
    if (customRoleId !== undefined) {
      firestoreUpdate.customRoleId = customRoleId || FieldValue.delete()
    }
    if (isActive !== undefined) firestoreUpdate.isActive = isActive

    await db.collection('users').doc(uid).update(firestoreUpdate)
    return { ok: true, uid }
  } catch (err) {
    throw toHttpsError(err, 'Failed to update user account.')
  }
})

export { registerTroopLeader } from './troopLeaderRegistration'
