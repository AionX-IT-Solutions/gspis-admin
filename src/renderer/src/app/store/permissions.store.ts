import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  persistDoc as persistFirestoreDoc,
  deleteDocById,
  hydrateCollection,
  reportHydrateFailure
} from '@/shared/lib/firestoreSync'
import {
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_LABELS,
  USER_ROLES,
  type CustomRole,
  type Permission,
  type RoleId,
  type UserRole
} from '../lib/permissions'
import { appendAuditLog } from './auditLog.store'
import { useAppStore } from './app.store'

interface RolePermissionsDoc {
  id: string
  permissions: Permission[]
}

// Every module added after this store's very first release, whose default-on roles should
// pick up the new permission automatically rather than staying invisible until someone
// remembers to flip it on by hand. Checked against BOTH this device's own persisted store
// (see migrate() below) and whatever's already sitting in the shared `rolePermissions`
// Firestore collection (see hydrate() below) — a doc written before a suffix was added here
// won't have it, so it'd otherwise silently overwrite an already-migrated local default the
// moment hydrate() merges remote over local. Extend this list every time a new default-on
// module permission is added; never remove an old entry.
const AUTO_BACKFILL_SUFFIXES = [
  ':goals',
  ':orgChart',
  ':troops',
  ':visitors',
  ':devices',
  ':facilityCalendar',
  ':announcements',
  ':budget',
  ':activities',
  ':ptdg',
  ':councilBoard',
  ':troopRegistration',
  ':invoices',
  ':customers'
]

/** Adds any of `role`'s default permissions matching AUTO_BACKFILL_SUFFIXES that `existing`
 *  is missing. Returns `existing` unchanged (same reference) when there's nothing to add. */
function backfillNewDefaults(role: UserRole, existing: Permission[]): Permission[] {
  const additions = DEFAULT_ROLE_PERMISSIONS[role].filter(
    (p) => !existing.includes(p) && AUTO_BACKFILL_SUFFIXES.some((suffix) => p.endsWith(suffix))
  )
  return additions.length > 0 ? [...existing, ...additions] : existing
}

function actorName() {
  return useAppStore.getState().currentUser?.fullName ?? 'System'
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

type AddCustomRoleResult = { ok: true; id: string } | { ok: false; error: string }

interface PermissionsState {
  rolePermissions: Record<string, Permission[]>
  customRoles: CustomRole[]
  /** Whether `rolePermissions` has done its one-time pull from/seed to Firestore —
   *  see hydrate() below. gspi-app (mobile) reads this same collection so a role's
   *  checklist actually drives its module visibility too, not just this app's. */
  hydrated: boolean
  hydrate: (force?: boolean) => Promise<void>
  setRolePermissions: (role: RoleId, permissions: Permission[]) => void
  togglePermission: (role: RoleId, permission: Permission) => void
  addCustomRole: (label: string, baseRole: UserRole) => AddCustomRoleResult
  setCustomRoleBaseRole: (id: string, baseRole: UserRole) => void
  deleteCustomRole: (id: string) => void
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      customRoles: [],
      hydrated: false,

      hydrate: async (force = false) => {
        if (get().hydrated && !force) return
        try {
          const docs = await hydrateCollection<RolePermissionsDoc>('rolePermissions')
          const remoteIds = new Set(docs.map((d) => d.id))
          const rolePermissions = { ...get().rolePermissions }
          for (const doc of docs) rolePermissions[doc.id] = doc.permissions ?? []

          // A remote doc written before a module in AUTO_BACKFILL_SUFFIXES existed just
          // overwrote this device's already-migrated local default for that role (see the
          // comment on AUTO_BACKFILL_SUFFIXES) — reconcile every built-in role's merged
          // result against its defaults the same way migrate() does. Applied locally
          // regardless of who's signed in, so this session sees the right permissions
          // immediately either way.
          const backfilled: Record<string, Permission[]> = {}
          for (const role of USER_ROLES) {
            const merged = backfillNewDefaults(role, rolePermissions[role] ?? [])
            if (merged !== rolePermissions[role]) {
              rolePermissions[role] = merged
              backfilled[role] = merged
            }
          }

          // Firestore rules only let super_admin/admin write `rolePermissions` — every other
          // role would just hit permission-denied here, so only they push the backfill (and
          // the "never seen by Firestore" catch-up below) back up for other devices/gspi-app
          // to converge on. Both pushes are best-effort: wrapped so a write failure can't
          // abort the local `set()` below and leave this session's own permissions stale.
          const canWriteRolePermissions = ['super_admin', 'admin'].includes(
            useAppStore.getState().currentUser?.role ?? ''
          )

          if (canWriteRolePermissions && Object.keys(backfilled).length > 0) {
            try {
              await Promise.all(
                Object.entries(backfilled).map(([id, permissions]) =>
                  persistFirestoreDoc('rolePermissions', id, { permissions })
                )
              )
            } catch (err) {
              reportHydrateFailure('[permissions.store] Failed to push permission backfill', err)
            }
          }

          // Push up any role this machine knows about locally (built-in or custom)
          // that Firestore has never seen — e.g. a custom role created while this
          // collection already had other docs in it, so the old "only seed when the
          // whole collection is empty" path never ran for it. Without this, that
          // role's checklist silently never reaches Firestore, so every other
          // signed-in device (including gspi-app) sees it as having no permissions
          // at all instead of what was actually checked here.
          const missingLocally = canWriteRolePermissions
            ? Object.entries(get().rolePermissions).filter(([id]) => !remoteIds.has(id))
            : []
          if (missingLocally.length > 0) {
            try {
              await Promise.all(
                missingLocally.map(([id, permissions]) =>
                  persistFirestoreDoc('rolePermissions', id, { permissions })
                )
              )
            } catch (err) {
              reportHydrateFailure('[permissions.store] Failed to push new roles', err)
            }
          }

          // Custom role *definitions* (id/label/baseRole) — unlike the checklist above,
          // these previously only ever lived in this device's local storage (zustand
          // persist), never in Firestore, so a role added on one machine silently
          // vanished from the Role Permissions screen (and the Add User role dropdown)
          // on every other machine/session even though its checklist kept working.
          // Merge remote in (source of truth going forward) and push up any local-only
          // role Firestore hasn't seen yet, mirroring the reconciliation above.
          const customRoleDocs = await hydrateCollection<CustomRole>('customRoles')
          const remoteCustomRoleIds = new Set(customRoleDocs.map((r) => r.id))
          const localOnlyCustomRoles = canWriteRolePermissions
            ? get().customRoles.filter((r) => !remoteCustomRoleIds.has(r.id))
            : []
          if (localOnlyCustomRoles.length > 0) {
            try {
              await Promise.all(
                localOnlyCustomRoles.map((r) =>
                  persistFirestoreDoc('customRoles', r.id, {
                    label: r.label,
                    baseRole: r.baseRole
                  })
                )
              )
            } catch (err) {
              reportHydrateFailure('[permissions.store] Failed to push new custom roles', err)
            }
          }
          const customRoles = [...customRoleDocs, ...localOnlyCustomRoles]

          set({ rolePermissions, customRoles, hydrated: true })
        } catch (err) {
          reportHydrateFailure('[permissions.store] Failed to hydrate', err)
        }
      },

      setRolePermissions: (role, permissions) => {
        set((s) => ({ rolePermissions: { ...s.rolePermissions, [role]: permissions } }))
        persistFirestoreDoc('rolePermissions', role, { permissions })
        const label =
          ROLE_LABELS[role as UserRole] ??
          get().customRoles.find((r) => r.id === role)?.label ??
          role
        appendAuditLog({
          action: 'role_permissions_updated',
          actorName: actorName(),
          entityType: 'role',
          summary: `Permissions for role "${label}" updated.`
        })
      },

      togglePermission: (role, permission) => {
        const current = get().rolePermissions[role] ?? []
        const next = current.includes(permission)
          ? current.filter((p) => p !== permission)
          : [...current, permission]
        get().setRolePermissions(role, next)
      },

      addCustomRole: (label, baseRole) => {
        const trimmed = label.trim()
        if (!trimmed) return { ok: false, error: 'users.rolePermissions.addRole.errors.required' }

        const id = slugify(trimmed)
        if (!id) return { ok: false, error: 'users.rolePermissions.addRole.errors.invalid' }

        const state = get()
        const taken =
          id === 'super_admin' ||
          (USER_ROLES as readonly string[]).includes(id) ||
          state.customRoles.some((r) => r.id === id)
        if (taken) return { ok: false, error: 'users.rolePermissions.addRole.errors.duplicate' }

        set((s) => ({
          customRoles: [...s.customRoles, { id, label: trimmed, baseRole }],
          rolePermissions: { ...s.rolePermissions, [id]: [] }
        }))
        persistFirestoreDoc('rolePermissions', id, { permissions: [] })
        persistFirestoreDoc('customRoles', id, { label: trimmed, baseRole })
        appendAuditLog({
          action: 'role_created',
          actorName: actorName(),
          entityType: 'role',
          summary: `Role "${trimmed}" created.`
        })
        return { ok: true, id }
      },

      setCustomRoleBaseRole: (id, baseRole) => {
        const role = get().customRoles.find((r) => r.id === id)
        set((s) => ({
          customRoles: s.customRoles.map((r) => (r.id === id ? { ...r, baseRole } : r))
        }))
        if (role) {
          persistFirestoreDoc('customRoles', id, { label: role.label, baseRole })
          appendAuditLog({
            action: 'role_base_role_updated',
            actorName: actorName(),
            entityType: 'role',
            summary: `Role "${role.label}" base role set to "${baseRole}".`
          })
        }
      },

      deleteCustomRole: (id) => {
        const role = get().customRoles.find((r) => r.id === id)
        set((s) => {
          const rolePermissions = { ...s.rolePermissions }
          delete rolePermissions[id]
          return { customRoles: s.customRoles.filter((r) => r.id !== id), rolePermissions }
        })
        deleteDocById('rolePermissions', id)
        deleteDocById('customRoles', id)
        if (role) {
          appendAuditLog({
            action: 'role_deleted',
            actorName: actorName(),
            entityType: 'role',
            summary: `Role "${role.label}" deleted.`
          })
        }
      }
    }),
    {
      name: 'aionx-permissions-store',
      partialize: (state) => ({
        rolePermissions: state.rolePermissions,
        customRoles: state.customRoles
      }),
      version: 15,
      migrate: (persistedState) => {
        const state = persistedState as PermissionsState
        const rolePermissions = { ...state.rolePermissions }
        for (const role of Object.keys(DEFAULT_ROLE_PERMISSIONS) as UserRole[]) {
          if (!rolePermissions[role]) {
            // Role didn't exist in a previously-persisted store (e.g. super_admin added later) — seed its defaults.
            rolePermissions[role] = [...DEFAULT_ROLE_PERMISSIONS[role]]
            continue
          }
          rolePermissions[role] = backfillNewDefaults(role, rolePermissions[role])
        }
        // v7: custom roles now require a `baseRole` (see CustomRole in lib/permissions.ts) —
        // backfill 'admin' for any role persisted before this existed. Best-effort guess, not
        // a guarantee of intent — surfaced in the UI for the admin to double-check/adjust.
        const customRoles = (state.customRoles ?? []).map((r) =>
          r.baseRole ? r : { ...r, baseRole: 'admin' as UserRole }
        )
        return { ...state, rolePermissions, customRoles }
      }
    }
  )
)
