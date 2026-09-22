import { create } from 'zustand'
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/shared/lib/firebase'
import { reportHydrateFailure } from '@/shared/lib/firestoreSync'
import type { RoleId } from '@/app/lib/permissions'

export interface StaffUser {
  id: string
  uid: string
  email: string
  fullName: string
  role: RoleId
  /** Set only when `role` was resolved from a custom role's base role — the custom
   *  role's own id, for display + desktop permission-checklist lookup. See
   *  resolveRoleAssignment in app/lib/permissions.ts. */
  customRoleId?: string
  isActive: boolean
  photoUrl?: string
  /** The Firebase Storage path backing `photoUrl`, if any — lets a later photo change
   *  delete the old file instead of leaking it (see features/profile/hooks/useProfile.ts). */
  photoStoragePath?: string
  /** For the Dashboard's Upcoming Birthdays widget — admin/super_admin-editable directly
   *  (see setStaffUserBirthDate), unlike role/password which need the CLI/service-account path. */
  birthDate?: string
}

function toStaffUser(id: string, data: Partial<StaffUser> & { createdAt?: unknown }): StaffUser {
  return {
    id,
    uid: id,
    email: data.email ?? '',
    fullName: data.fullName ?? '',
    role: (data.role as RoleId) ?? 'manager',
    customRoleId: data.customRoleId,
    isActive: data.isActive ?? true,
    photoUrl: data.photoUrl,
    photoStoragePath: data.photoStoragePath,
    birthDate: data.birthDate
  }
}

interface UsersState {
  users: StaffUser[]
  loading: boolean
  subscribe: () => Unsubscribe
  /** This collection is already kept live via `subscribe()`'s onSnapshot listener — this just
   *  forces one fresh server round-trip for the Refresh button, bypassing any local cache. */
  refetch: () => Promise<void>
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  loading: true,

  subscribe: () => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'))
    return onSnapshot(
      q,
      (snap) => {
        set({ users: snap.docs.map((d) => toStaffUser(d.id, d.data())), loading: false })
      },
      () => set({ loading: false })
    )
  },

  refetch: async () => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'asc')))
      set({ users: snap.docs.map((d) => toStaffUser(d.id, d.data())), loading: false })
    } catch (err) {
      reportHydrateFailure('[users.store] Failed to refetch', err)
    }
  }
}))
