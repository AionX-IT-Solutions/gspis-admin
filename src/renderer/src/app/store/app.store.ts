import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/shared/lib/firebase'
import type { UpdateStatus } from '../../../../shared/ipc-types'
import type { RoleId } from '../lib/permissions'

interface LoginResult {
  ok: boolean
  message?: string
}

function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'auth.errors.invalidCredentials'
    case 'auth/user-disabled':
      return 'auth.errors.userDisabled'
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyRequests'
    case 'auth/network-request-failed':
      return 'auth.errors.network'
    default:
      return 'auth.errors.generic'
  }
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: number
}

export interface CurrentUser {
  id: string
  fullName: string
  role: RoleId
  /** Set only when `role` was resolved from a custom role's base role — see
   *  resolveRoleAssignment in app/lib/permissions.ts. Drives desktop's own
   *  permission-checklist lookup in usePermissions.ts. */
  customRoleId?: string
  email: string
  photoUrl?: string
  /** The Firebase Storage path backing `photoUrl`, if any — lets a later photo change
   *  delete the old file instead of leaking it (see features/profile/hooks/useProfile.ts). */
  photoStoragePath?: string
}

export type AccentColor = 'indigo' | 'cyan' | 'emerald' | 'rose'
export type Theme = 'dark' | 'light'
export type Language = 'en' | 'tl'

interface AppState {
  isAuthenticated: boolean
  currentUser: CurrentUser | null
  sidebarCollapsed: boolean
  theme: Theme
  language: Language
  accentColor: AccentColor
  notifications: Notification[]
  notificationsEnabled: boolean
  soundEnabled: boolean
  securityAlerts: boolean
  dataCollection: boolean
  crashReports: boolean
  compactMode: boolean
  fontSize: number[]
  updateStatus: UpdateStatus | null
  authLoading: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  setSession: (user: CurrentUser | null) => void
  setCurrentUserPhoto: (photoUrl: string, photoStoragePath: string) => void
  setAuthLoading: (loading: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  setAccentColor: (color: AccentColor) => void
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setNotificationsEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setSecurityAlerts: (enabled: boolean) => void
  setDataCollection: (enabled: boolean) => void
  setCrashReports: (enabled: boolean) => void
  setCompactMode: (enabled: boolean) => void
  setFontSize: (size: number[]) => void
  setUpdateStatus: (status: UpdateStatus | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      sidebarCollapsed: false,
      theme: 'dark',
      language: 'en',
      accentColor: 'emerald',
      notifications: [],
      notificationsEnabled: true,
      soundEnabled: false,
      securityAlerts: true,
      dataCollection: false,
      crashReports: true,
      compactMode: false,
      fontSize: [14],
      updateStatus: null,
      authLoading: true,

      login: async (email, password) => {
        try {
          const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
          const profileSnap = await getDoc(doc(db, 'users', credential.user.uid))
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
            await signOut(auth)
            return { ok: false, message: 'auth.errors.userDisabled' }
          }

          set({
            isAuthenticated: true,
            currentUser: {
              id: credential.user.uid,
              email: credential.user.email ?? email,
              fullName: profile.fullName ?? credential.user.displayName ?? email,
              role: profile.role ?? 'manager',
              customRoleId: profile.customRoleId,
              photoUrl: profile.photoUrl,
              photoStoragePath: profile.photoStoragePath
            }
          })
          return { ok: true }
        } catch (err) {
          return { ok: false, message: mapAuthError(err) }
        }
      },
      logout: () => {
        signOut(auth).catch(() => {})
        set({ isAuthenticated: false, currentUser: null })
      },
      setSession: (currentUser) => set({ isAuthenticated: !!currentUser, currentUser }),
      setCurrentUserPhoto: (photoUrl, photoStoragePath) =>
        set((s) => ({
          currentUser: s.currentUser
            ? { ...s.currentUser, photoUrl, photoStoragePath }
            : s.currentUser
        })),
      setAuthLoading: (authLoading) => set({ authLoading }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      setAccentColor: (accentColor) => set({ accentColor }),

      addNotification: (notif) =>
        set((s) => ({
          notifications: [
            ...s.notifications,
            {
              ...notif,
              id: Math.random().toString(36).slice(2),
              timestamp: Date.now()
            }
          ]
        })),

      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      clearNotifications: () => set({ notifications: [] }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSecurityAlerts: (securityAlerts) => set({ securityAlerts }),
      setDataCollection: (dataCollection) => set({ dataCollection }),
      setCrashReports: (crashReports) => set({ crashReports }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setUpdateStatus: (updateStatus) => set({ updateStatus })
    }),
    {
      name: 'aionx-app-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        accentColor: state.accentColor,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        securityAlerts: state.securityAlerts,
        dataCollection: state.dataCollection,
        crashReports: state.crashReports,
        compactMode: state.compactMode,
        fontSize: state.fontSize
      })
    }
  )
)
