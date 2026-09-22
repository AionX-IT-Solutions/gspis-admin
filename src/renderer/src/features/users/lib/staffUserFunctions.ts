import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { httpsCallable, FunctionsError } from 'firebase/functions'
import { db, functions } from '@/shared/lib/firebase'
import type { UserRole } from '@/app/lib/permissions'
import type { StaffAdminResult } from '../../../../../shared/staff-admin-types'

/** `role` here is always a real built-in role — a custom role selection is resolved to
 *  its base role (+ `customRoleId`) via resolveRoleAssignment() before it ever reaches
 *  these functions. See useAddUserModal.ts / useEditUserModal.ts. */
interface CreateStaffUserInput {
  email: string
  password: string
  fullName: string
  role: UserRole
  customRoleId?: string | null
}

interface UpdateStaffUserDirectInput {
  uid: string
  fullName?: string
  role?: UserRole
  customRoleId?: string | null
}

// Account creation and role changes need the Admin SDK (custom claims can only be set
// server-side), so they run as Cloud Functions the signed-in admin calls directly —
// no local service account key, no terminal command, works on every machine.
const createStaffUserCallable = httpsCallable<CreateStaffUserInput, { ok: true; uid: string }>(
  functions,
  'createStaffUser'
)
const updateStaffUserCallable = httpsCallable<
  UpdateStaffUserDirectInput,
  { ok: true; uid: string }
>(functions, 'updateStaffUser')

function toResult(err: unknown, fallback: string): StaffAdminResult {
  if (err instanceof FunctionsError) return { ok: false, error: err.message }
  return { ok: false, error: err instanceof Error ? err.message : fallback }
}

export async function createStaffUserDirect(
  input: CreateStaffUserInput
): Promise<StaffAdminResult> {
  try {
    const { data } = await createStaffUserCallable(input)
    return data
  } catch (err) {
    return toResult(err, 'Failed to create user account.')
  }
}

export async function updateStaffUserDirect(
  input: UpdateStaffUserDirectInput
): Promise<StaffAdminResult> {
  try {
    const { data } = await updateStaffUserCallable(input)
    return data
  } catch (err) {
    return toResult(err, 'Failed to update user account.')
  }
}

/** The one staff-account change the app makes directly — Firestore rules narrowly allow
 *  admin/super_admin to toggle just this field, so Enable/Disable doesn't need the CLI. */
export async function setStaffUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { isActive, updatedAt: serverTimestamp() })
}

/** Renaming a staff member never touches Firebase Auth or the `role` custom claim, so
 *  Firestore rules allow admin/super_admin to write it directly — no round-trip needed. */
export async function setStaffUserFullName(uid: string, fullName: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { fullName, updatedAt: serverTimestamp() })
}

/** Self-service profile photo — Firestore rules narrowly allow a signed-in user to update
 *  only these fields (plus `updatedAt`) on their own `users/{uid}` document. `photoStoragePath`
 *  is carried alongside the URL so a later photo change can delete the old file from Storage
 *  instead of leaking it (see features/profile/hooks/useProfile.ts). */
export async function setStaffUserPhoto(
  uid: string,
  photoUrl: string,
  photoStoragePath: string
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    photoUrl,
    photoStoragePath,
    updatedAt: serverTimestamp()
  })
}

/** Birthdate is non-sensitive (unlike role/password), so — like renaming — Firestore rules
 *  let admin/super_admin write it directly, no service-account round-trip needed. */
export async function setStaffUserBirthDate(uid: string, birthDate: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { birthDate, updatedAt: serverTimestamp() })
}
