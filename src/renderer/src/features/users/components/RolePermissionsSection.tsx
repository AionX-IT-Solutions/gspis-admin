import { useEffect, useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { FormField, FieldInput, FieldSelect } from '@/shared/components/ui/FormField'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Tooltip } from '@/shared/components/ui/Tooltip'
import {
  ALL_PERMISSIONS,
  MODULE_LABELS,
  PERMISSION_MODULES,
  permissionsForModule,
  type Permission,
  type UserRole
} from '@/app/lib/permissions'
import { useRolePermissionsSection, type RoleRow } from '../hooks/useRolePermissionsSection'

type TFn = ReturnType<typeof useTranslation>['t']

function permissionLabel(t: TFn, permission: Permission) {
  const [action, moduleKey] = permission.split(':')
  return `${action === 'view' ? t('common.view') : t('users.permissionsModal.manage')} ${MODULE_LABELS[moduleKey] ?? moduleKey}`
}

function permissionsEqual(a: Permission[], b: Permission[]): boolean {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every((p) => setA.has(p))
}

const ALL_PERMISSIONS_SET = new Set<string>(ALL_PERMISSIONS)

// A role's stored permission list can outlive the permission strings themselves — a module
// rename/removal (e.g. a `view:foo` becoming `view:fooRegistration`) leaves the old string
// stuck in Firestore since nothing prunes it automatically. Filtering against the current
// ALL_PERMISSIONS here is what keeps the "granted / total" count from reading impossible
// values like "80 / 72", and self-heals the stored list the next time someone hits Done.
function currentPermissionsOnly(permissions: Permission[] | undefined): Permission[] {
  return (permissions ?? []).filter((p) => ALL_PERMISSIONS_SET.has(p))
}

export function RolePermissionsSection() {
  const { t } = useTranslation()
  const {
    rolePermissions,
    customRoles,
    setRolePermissions,
    permTarget,
    setPermTarget,
    canManageRoles,
    roleRows,
    baseRoleOptions,
    addRoleOpen,
    setAddRoleOpen,
    handleAddRole,
    handleSetBaseRole,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDeleteRole
  } = useRolePermissionsSection()
  const [newRoleName, setNewRoleName] = useState('')
  const [newBaseRole, setNewBaseRole] = useState<UserRole>(baseRoleOptions[0]?.value ?? 'admin')

  const permTargetRow = roleRows.find((r) => r.value === permTarget) ?? null
  const permTargetCustomRole = permTargetRow?.isCustom
    ? (customRoles.find((r) => r.id === permTargetRow.value) ?? null)
    : null

  // Draft copy edited by the checkboxes/base-role select below — nothing here touches
  // the store (or Firestore) until "Done" is clicked. Re-seeded from the live data
  // each time the modal opens for a role, so it never leaks a stale/discarded edit
  // into a later session.
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([])
  const [draftBaseRole, setDraftBaseRole] = useState<UserRole | null>(null)

  useEffect(() => {
    if (!permTarget) return
    setDraftPermissions(currentPermissionsOnly(rolePermissions[permTarget]))
    setDraftBaseRole(permTargetCustomRole?.baseRole ?? null)
    // Only re-seed when the modal opens for a (possibly new) role — not on every store
    // update, or an in-progress edit would get clobbered by its own unsaved changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permTarget])

  function openAddRole() {
    setNewRoleName('')
    setNewBaseRole(baseRoleOptions[0]?.value ?? 'admin')
    setAddRoleOpen(true)
  }

  function submitAddRole() {
    handleAddRole(newRoleName, newBaseRole)
  }

  function handleDonePermissions() {
    if (permTarget) {
      const original = rolePermissions[permTarget] ?? []
      if (!permissionsEqual(draftPermissions, original)) {
        setRolePermissions(permTarget, draftPermissions)
      }
      if (
        permTargetCustomRole &&
        draftBaseRole &&
        draftBaseRole !== permTargetCustomRole.baseRole
      ) {
        handleSetBaseRole(permTargetCustomRole.id, draftBaseRole)
      }
    }
    setPermTarget(null)
  }

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {t('users.rolePermissions.title')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {t('users.rolePermissions.subtitle')}
              </p>
            </div>
          </div>
          {canManageRoles && (
            <Button size="sm" variant="primary" leftIcon={<Plus size={13} />} onClick={openAddRole}>
              {t('users.rolePermissions.addRole.button')}
            </Button>
          )}
        </div>
        <Card padding="0px">
          <div>
            {roleRows.map((row, i) => {
              const granted = currentPermissionsOnly(rolePermissions[row.value]).length
              return (
                <div
                  key={row.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom:
                      i < roleRows.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {row.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t('users.rolePermissions.permissionsGranted', {
                        granted,
                        total: ALL_PERMISSIONS.length
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Button size="sm" variant="secondary" onClick={() => setPermTarget(row.value)}>
                      {t('users.rolePermissions.editButton')}
                    </Button>
                    {canManageRoles && row.isCustom && (
                      <RoleDeleteButton row={row} onDelete={() => setDeleteTarget(row)} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Modal
        open={!!permTarget}
        onOpenChange={(open) => !open && setPermTarget(null)}
        title={
          permTargetRow
            ? t('users.permissionsModal.titleWithRole', { role: permTargetRow.label })
            : t('users.permissionsModal.titleDefault')
        }
        size="lg"
        footer={
          <Button variant="primary" size="sm" onClick={handleDonePermissions}>
            {t('users.permissionsModal.doneButton')}
          </Button>
        }
      >
        {permTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {permTargetCustomRole && (
              <div
                style={{
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <FormField label={t('users.rolePermissions.baseRoleLabel')}>
                  <FieldSelect
                    value={draftBaseRole ?? permTargetCustomRole.baseRole}
                    onChange={(e) => setDraftBaseRole(e.target.value as UserRole)}
                    options={baseRoleOptions}
                  />
                </FormField>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {t('users.rolePermissions.baseRoleHint')}
                </p>
              </div>
            )}
            <SelectAllRow
              granted={draftPermissions}
              onToggle={(grantAll) => setDraftPermissions(grantAll ? [...ALL_PERMISSIONS] : [])}
            />
            {PERMISSION_MODULES.map((moduleKey) => {
              const perms = permissionsForModule(moduleKey)
              const granted = draftPermissions
              return (
                <div key={moduleKey}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-muted)',
                      marginBottom: 8
                    }}
                  >
                    {MODULE_LABELS[moduleKey]}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {perms.map((perm) => (
                      <label
                        key={perm}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={granted.includes(perm)}
                          onChange={() =>
                            setDraftPermissions((prev) =>
                              prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
                            )
                          }
                          style={{ accentColor: 'var(--accent-primary)', width: 14, height: 14 }}
                        />
                        {permissionLabel(t, perm)}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={addRoleOpen}
        onOpenChange={setAddRoleOpen}
        title={t('users.rolePermissions.addRole.title')}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddRoleOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={submitAddRole}>
              {t('users.rolePermissions.addRole.submitButton')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormField label={t('users.rolePermissions.addRole.nameLabel')} required>
            <FieldInput
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder={t('users.rolePermissions.addRole.namePlaceholder')}
              autoFocus
            />
          </FormField>
          <FormField label={t('users.rolePermissions.baseRoleLabel')} required>
            <FieldSelect
              value={newBaseRole}
              onChange={(e) => setNewBaseRole(e.target.value as UserRole)}
              options={baseRoleOptions}
            />
          </FormField>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {t('users.rolePermissions.baseRoleHint')}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {t('users.rolePermissions.addRole.note')}
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('users.rolePermissions.deleteRole.confirmTitle')}
        message={t('users.rolePermissions.deleteRole.confirmMessage', {
          role: deleteTarget?.label ?? ''
        })}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDeleteRole}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

function SelectAllRow({
  granted,
  onToggle
}: {
  granted: Permission[]
  onToggle: (grantAll: boolean) => void
}) {
  const { t } = useTranslation()
  const allGranted = granted.length === ALL_PERMISSIONS.length
  const noneGranted = granted.length === 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }}
      >
        <input
          type="checkbox"
          checked={allGranted}
          ref={(el) => {
            if (el) el.indeterminate = !allGranted && !noneGranted
          }}
          onChange={() => onToggle(!allGranted)}
          style={{ accentColor: 'var(--accent-primary)', width: 14, height: 14 }}
        />
        {t('users.permissionsModal.selectAll')}
      </label>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {t('users.permissionsModal.grantedCount', {
          granted: granted.length,
          total: ALL_PERMISSIONS.length
        })}
      </span>
    </div>
  )
}

function RoleDeleteButton({ row, onDelete }: { row: RoleRow; onDelete: () => void }) {
  const { t } = useTranslation()

  if (row.assignedCount > 0) {
    return (
      <Tooltip content={t('users.rolePermissions.deleteRole.inUse', { count: row.assignedCount })}>
        <span>
          <Button size="sm" variant="ghost" disabled>
            <Trash2 size={13} />
          </Button>
        </span>
      </Tooltip>
    )
  }

  return (
    <Button size="sm" variant="ghost" onClick={onDelete} title={t('common.delete')}>
      <Trash2 size={13} />
    </Button>
  )
}
