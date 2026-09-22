import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/shared/lib/firebase'
import { useAppStore } from '../store/app.store'
import type { RoleId } from '../lib/permissions'

/**
 * Keeps `useAppStore`'s session in sync with Firebase Auth's own state — picks up
 * sign-outs/disables that happen elsewhere, and resolves `authLoading` once Firebase
 * has reported the current session (or lack of one) on startup.
 */
export function useFirebaseAuthBridge() {
  const setSession = useAppStore((s) => s.setSession)
  const setAuthLoading = useAppStore((s) => s.setAuthLoading)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setSession(null)
        setAuthLoading(false)
        return
      }

      try {
        const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        const profile = profileSnap.data() as
          | {
              fullName?: string
              role?: RoleId
              customRoleId?: string
              isActive?: boolean
              photoUrl?: string
              photoStoragePath?: string
            }
          | undefined

        if (!profile || profile.isActive === false) {
          setSession(null)
          setAuthLoading(false)
          return
        }

        setSession({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          fullName: profile.fullName ?? firebaseUser.displayName ?? firebaseUser.email ?? '',
          role: profile.role ?? 'manager',
          customRoleId: profile.customRoleId,
          photoUrl: profile.photoUrl,
          photoStoragePath: profile.photoStoragePath
        })
      } catch {
        setSession(null)
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [setSession, setAuthLoading])
}
